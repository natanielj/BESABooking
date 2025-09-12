import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  User,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../../src/firebase.ts";
import { getCalendarAccessToken, insertCalendarEvent } from "../calendarAPI.tsx";
import { fetchBesas } from "../../src/functions/besaRepo.ts";                                      // optional, if using Firestore
import { getAvailableBesasForInterval } from "./admin/views/BESAManagements.tsx"; // path as needed

const dedupeAttendees = (
  attendees: { email: string; displayName?: string }[],
  ...exclude: string[]
) => {
  const seen = new Set<string>(
    exclude.filter(Boolean).map(e => e.trim().toLowerCase())
  );
  const out: { email: string; displayName?: string }[] = [];
  for (const a of attendees) {
    const em = (a.email || "").trim().toLowerCase();
    if (!em || seen.has(em)) continue;
    seen.add(em);
    out.push({ email: a.email.trim(), displayName: a.displayName });
  }
  return out;
};

export interface Tour {
  id: string;
  title: string;
  description: string;
  duration: number;
  durationUnit: "minutes" | "hours";
  maxAttendees: number;
  location: string;
  zoomLink: string;
  autoGenerateZoom: boolean;
  weeklyHours: WeeklyHours;
  dateSpecificHours: DateSpecificHours[];
  frequency: number;
  frequencyUnit: "minutes" | "hours";
  registrationLimit: number;
  minNotice: number;
  minNoticeUnit: "minutes" | "hours" | "days";
  maxNotice: number;
  maxNoticeUnit: "minutes" | "hours" | "days";
  bufferTime: number;
  bufferUnit: "minutes" | "hours";
  cancellationPolicy: string;
  reschedulingPolicy: string;
  intakeForm: {
    firstName: boolean;
    lastName: boolean;
    email: boolean;
    phone: boolean;
    attendeeCount: boolean;
    majorsInterested: boolean;
    customQuestions: string[];
  };
  reminderEmails: any[];
  sessionInstructions: string;
  published: boolean;
  createdAt: string;
  upcomingBookings: number;
  totalBookings: number;
}

interface DynamicBookingFormProps {
  onBack: () => void | Promise<void>;
  preselectedTour?: string;
  tours: Tour[];
}

// ---------- Page (parent) ----------
function parseLocalDateTime(dateStr: string, timeLabel: string): Date {
  // Example timeLabel: "3:05 PM"
  const m = timeLabel.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) throw new Error(`Unexpected time format: ${timeLabel}`);
  let [_, hhStr, mmStr, ampm] = m;
  let hh = parseInt(hhStr, 10);
  const mm = parseInt(mmStr, 10);
  if (/PM/i.test(ampm) && hh !== 12) hh += 12;
  if (/AM/i.test(ampm) && hh === 12) hh = 0;

  // Construct as local time
  const [Y, M, D] = dateStr.split("-").map(Number);
  return new Date(Y, (M - 1), D, hh, mm, 0, 0);
}

function addMinutes(dt: Date, minutes: number): Date {
  return new Date(dt.getTime() + minutes * 60_000);
}

function toLocalISO(dt: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const offMin = dt.getTimezoneOffset();
  const sign = offMin > 0 ? "-" : "+";
  const abs = Math.abs(offMin);
  const offH = pad(Math.floor(abs / 60));
  const offM = pad(abs % 60);

  return (
    `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}` +
    `T${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}` +
    `${sign}${offH}:${offM}`
  );
}

function BookingPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const navigate = useNavigate();
  const { tourId } = useParams<{ tourId: string }>();  // <-- must match route

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Tours"));
        const toursData: Tour[] = querySnapshot.docs.map((d) => {
          const data: any = d.data();
          return {
            id: d.id,
            title: data.title ?? "",
            description: data.description ?? "",
            duration: data.duration ?? 0,
            durationUnit: data.durationUnit ?? "minutes",
            maxAttendees: data.maxAttendees ?? 1,
            location: data.location ?? "",
            zoomLink: data.zoomLink ?? "",
            autoGenerateZoom: data.autoGenerateZoom ?? false,
            weeklyHours: data.weeklyHours ?? {},
            dateSpecificHours: data.dateSpecificHours ?? [],
            frequency: data.frequency ?? 1,
            frequencyUnit: data.frequencyUnit ?? "hours",
            registrationLimit: data.registrationLimit ?? 1,
            minNotice: data.minNotice ?? 0,
            minNoticeUnit: data.minNoticeUnit ?? "hours",
            maxNotice: data.maxNotice ?? 1,
            maxNoticeUnit: data.maxNoticeUnit ?? "days",
            bufferTime: data.bufferTime ?? 0,
            bufferUnit: data.bufferUnit ?? "minutes",
            cancellationPolicy: data.cancellationPolicy ?? "",
            reschedulingPolicy: data.reschedulingPolicy ?? "",
            intakeForm: data.intakeForm ?? {
              firstName: true,
              lastName: true,
              email: true,
              phone: false,
              attendeeCount: true,
              majorsInterested: false,
              customQuestions: [],
            },
            reminderEmails: data.reminderEmails ?? [],
            sessionInstructions: data.sessionInstructions ?? "",
            published: data.published ?? false,
            createdAt: data.createdAt ?? "",
            upcomingBookings: data.upcomingBookings ?? 0,
            totalBookings: data.totalBookings ?? 0,
          } as Tour;
        });
        setTours(toursData);
      } catch (error) {
        console.error("Error fetching tours:", error);
      }
    };
    fetchTours();
  }, []);

  return (
    <DynamicBookingForm
      tours={tours}
      onBack={() => navigate("/")}
      preselectedTour={tourId ?? ""} 
    />
  );
}

// ---------- Form (child) ----------
const DynamicBookingForm: React.FC<DynamicBookingFormProps> = ({
  onBack,
  preselectedTour = "",
  tours,
}) => {
  const [currentSection, setCurrentSection] = useState(1);
  const [selectedTour, setSelectedTour] = useState<string | null>(null);
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [bookingData, setBookingData] = useState<BookingData>({
    tourId: preselectedTour || "",
    tourType: "",
    date: "",
    time: "",
    attendees: 1,
    maxAttendees: 1,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
    role: "",
    interests: [],
    timeSlot: "",
    groupSize: 1,
    status: "",
    accessibility: "",
    specialRequests: "",
    marketingConsent: false,
    leadGuide: "",
    notes: "",
    besas: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // const interestOptions = [
  //   "Applied Mathematics B.S",
  //   "Biomolecular Engineering and Bioinformatics B.S",
  //   "Biotechnology B.A",
  //   "Computer Science: Computer Game Design B.S",
  //   "Computer Engineering B.S",
  //   "Computer Science B.S",
  //   "Computer Science B.A",
  //   "Network and Digital Technology B.A",
  //   "Electrical Engineering B.S",
  //   "Robotic Engineering B.S",
  //   "Technology and Informations Management B.S",
  // ];

  const sections = [
    { id: 1, title: "Date & Type of Tour", description: "Choose your preferred tour and date" },
    { id: 2, title: "Available Times", description: "Select your time slot and group details" },
    { id: 3, title: "Preferences & Booking Info", description: "Complete your booking information" },
  ];

  const selectTourById = (id: string) => {
    const t = tours.find(x => String(x.id) === String(id));
    if (!t) {
      console.warn("Tour not found for id:", id, "Available:", tours.map(tt => tt.id));
      return;
    }
    setSelectedTour(t.id);
    setBookingData(prev => ({
      ...prev,
      tourId: t.id,
      tourType: t.title,
      maxAttendees: t.maxAttendees ?? prev.maxAttendees,
    }));
    console.log("Tour Selected", t.id);
  };


  const updateBookingData = (field: keyof BookingData, value: any) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field as string]: "" }));
    }
    console.log("Tour selected")
  };

  // Preselect the tour from param once tours are loaded
  useEffect(() => {
    console.log("EFFECT deps -> preselectedTour:", preselectedTour, "tours.length:", tours.length);
    if (!preselectedTour || !tours.length) return;
    selectTourById(preselectedTour.trim());   // simulates the button press
  }, [preselectedTour, tours]);


  // ---------- Validation ----------
  const validateSection = (section: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (section) {
      case 1:
        if (!bookingData.tourId) newErrors.tourType = "Please select a tour type";
        if (!bookingData.date) newErrors.date = "Please select a date";
        break;
      case 2:
        if (!bookingData.time) newErrors.time = "Please select a time slot";
        if (bookingData.attendees < 1) newErrors.maxAttendees = "Group size must be at least 1";
        break;
      case 3:
        if (!bookingData.firstName) newErrors.firstName = "First name is required";
        if (!bookingData.lastName) newErrors.lastName = "Last name is required";
        if (!bookingData.email) newErrors.contactEmail = "Email is required";
        if (!bookingData.phone) newErrors.contactPhone = "Phone number is required";
        if (!bookingData.organization) newErrors.organization = "Organization is required";
        if (!bookingData.role) newErrors.role = "Role is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------- Section nav ----------
  const nextSection = () => {
    if (validateSection(currentSection)) {
      setCurrentSection((s) => Math.min(s + 1, 3));
    }
  };

  const prevSection = () => setCurrentSection((s) => Math.max(s - 1, 1));

  // ---------- Submit ----------
  const handleSubmit = async () => {
    if (!validateSection(currentSection)) return;

    // --- local helpers for this function ---
    const weekdayKey = (d: Date) =>
      ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][d.getDay()];

    const hmToMinutes = (hm: string) => {
      const [h, m] = hm.split(":").map(Number);
      return h * 60 + (m || 0);
    };

    // Consider a BESA "available" if ANY of their slots overlaps the booking window
    const slotOverlaps = (startMin: number, endMin: number, slot: { start: string; end: string }) => {
      const s = hmToMinutes(slot.start);
      const e = hmToMinutes(slot.end);
      return s < endMin && startMin < e;
    };

    const dedupeAttendees = (
      attendees: { email: string; displayName?: string }[],
      ...exclude: string[]
    ) => {
      const seen = new Set<string>(exclude.filter(Boolean).map(e => e.trim().toLowerCase()));
      const out: { email: string; displayName?: string }[] = [];
      for (const a of attendees) {
        const em = (a.email || "").trim().toLowerCase();
        if (!em || seen.has(em)) continue;
        seen.add(em);
        out.push({ email: a.email.trim(), displayName: a.displayName });
      }
      return out;
    };

    try {
      // 1) Save booking in Firestore
      const bookingsRef = collection(db, "Bookings");
      const newDocRef = doc(bookingsRef);
      const bookingWithId = {
        ...bookingData,
        id: newDocRef.id,
        createdAt: new Date().toISOString(),
      };
      await setDoc(newDocRef, bookingWithId);

      // 2) Compute start/end Date from form + selected tour duration
      const selected = tours.find((t) => t.id === bookingData.tourId);
      if (!selected) throw new Error("Selected tour not found.");

      const durationMins =
        selected.durationUnit === "hours" ? selected.duration * 60 : selected.duration;

      if (!bookingData.date || !bookingData.time) {
        throw new Error("Missing date or time.");
      }

      const startLocal = parseLocalDateTime(bookingData.date, bookingData.time);
      const endLocal = addMinutes(startLocal, durationMins);

      const startISO = toLocalISO(startLocal);
      const endISO = toLocalISO(endLocal);

      // 3) Google access token
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
      if (!clientId) throw new Error("VITE_GOOGLE_CLIENT_ID is missing.");
      const accessToken = await getCalendarAccessToken(clientId);

      // 4) Event details
      const location = selected.zoomLink
        ? `Online (Zoom): ${selected.zoomLink}`
        : (selected.location || "");

      const descriptionLines = [
        `Tour: ${bookingData.tourType || selected.title}`,
        `Date & Time: ${bookingData.date} at ${bookingData.time} (${userTimeZone})`,
        `Group Size: ${bookingData.maxAttendees}`,
        `Lead Guide: ${bookingData.leadGuide || "TBD"}`,
        "",
        "Contact",
        `- Name: ${bookingData.firstName} ${bookingData.lastName}`,
        `- Email: ${bookingData.email}`,
        `- Phone: ${bookingData.phone}`,
        "",
        "Notes",
        bookingData.specialRequests ? `- Special Requests: ${bookingData.specialRequests}` : "",
        bookingData.accessibility ? `- Accessibility: ${bookingData.accessibility}` : "",
      ].filter(Boolean);

      const summary = `${selected.title} — ${bookingData.firstName} ${bookingData.lastName} (${bookingData.maxAttendees})`;

      // 5) Fetch BESA roster and filter by availability (with deep console logs)
      type TimeSlot = { start: string; end: string };
      type OfficeHours = { available: boolean; timeSlots: TimeSlot[] };
      type Besa = {
        id: string;
        name: string;
        email: string;
        status: string;
        role: string;
        officeHours: {
          monday: OfficeHours; tuesday: OfficeHours; wednesday: OfficeHours;
          thursday: OfficeHours; friday: OfficeHours; saturday: OfficeHours; sunday: OfficeHours;
        };
      };

      let extraAttendees: { email: string; displayName?: string }[] = [];
      try {
        console.log("[FIREBASE DEBUG] app:", (db as any)?._firebaseApp?.options);
        try {
          const snap = await getDocs(collection(db, "Besas")); // exact name?
          console.log("[FIREBASE DEBUG] BESAS size:", snap.size);
          for (const d of snap.docs) {
            console.log("[FIREBASE DEBUG] BESA doc:", d.id, d.data());
          }
        } catch (e: any) {
          console.error("[FIREBASE DEBUG] getDocs failed:", e?.code, e?.message, e);
        }
        const besaSnap = await getDocs(collection(db, "Besas")); // change collection name if needed
        const rawBesas: Besa[] = besaSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

        const key = weekdayKey(startLocal) as keyof Besa["officeHours"];
        const startMin = startLocal.getHours() * 60 + startLocal.getMinutes();
        const endMin = endLocal.getHours() * 60 + endLocal.getMinutes();

        console.log(`[BESA DEBUG] Day: ${key} | Interval: ${startMin}-${endMin} mins`);
        console.log(`[BESA DEBUG] Roster count: ${rawBesas.length}`);

        const besas = rawBesas.map(b => ({
          ...b,
          email: (b.email || "").trim(),
          status: (b.status || "").trim().toLowerCase(),
          role: (b.role || "").trim().toLowerCase(),
        }));

        const availableBesas = besas.filter(b => {
          // skip with reasons logged
          if (!b.email) {
            console.log(`[BESA SKIP] No email -> ${b.name} (id=${b.id})`);
            return false;
          }
          if (b.status && b.status !== "active") {
            console.log(`[BESA SKIP] Inactive -> ${b.name} (${b.email}) status=${b.status}`);
            return false;
          }
          const hours = b.officeHours?.[key];
          if (!hours || !hours.available) {
            console.log(`[BESA SKIP] Closed on ${key} -> ${b.name} (${b.email})`);
            return false;
          }
          if (!Array.isArray(hours.timeSlots) || hours.timeSlots.length === 0) {
            console.log(`[BESA SKIP] No timeslots on ${key} -> ${b.name} (${b.email})`);
            return false;
          }

          let matched = false;
          for (const slot of hours.timeSlots) {
            const s = hmToMinutes(slot.start);
            const e = hmToMinutes(slot.end);
            const ok = slotOverlaps(startMin, endMin, slot);
            console.log(
              `[BESA SLOT] ${b.name} (${b.email}) slot ${slot.start}-${slot.end} -> ${ok ? "MATCH" : "no"}`
            );
            if (ok) matched = true;
          }
          if (!matched) {
            console.log(`[BESA NO MATCH] ${b.name} (${b.email}) has no overlapping slot`);
          }
          return matched;
        });

        extraAttendees = availableBesas.map(b => ({ email: b.email, displayName: b.name }));
        console.log(`[BESA DEBUG] Available BESA ->`, extraAttendees);
      } catch (e) {
        console.warn("BESA lookup failed; proceeding without BESA attendees.", e);
      }

      // 6) Always include distro; de-dupe against the booker and any repeats
      const distro = { email: "ucscbesa@ucsc.edu", displayName: "UCSC BESA" };
      extraAttendees = dedupeAttendees(
        [...extraAttendees, distro],
        (bookingData.email || "").trim()
      );
      console.log(`[BESA DEBUG] Final attendees (excluding booker):`, extraAttendees);

      // 7) Create Calendar event (send updates to all)
      const event = await insertCalendarEvent({
        accessToken,
        summary,
        description: descriptionLines.join("\n"),
        location,
        startISO,
        endISO,
        attendeeEmail: bookingData.email,
        attendeeName: `${bookingData.firstName} ${bookingData.lastName}`,
        extraAttendees, // includes available BESA and ucscbesa@ucsc.edu
        timezone: userTimeZone,
        calendarId: "primary",
      });

      console.log("[Calendar] created event:", event?.htmlLink || event?.id);
      console.log("[Calendar] attendees on event:", event?.attendees);

      alert("Booking submitted successfully!");
      console.log("Booking Data:", bookingWithId);
    } catch (error) {
      console.error("Error during submission:", error);
      alert("Failed to submit booking. Please try again.");
    }
  };


  // ---------- Helpers for Section 2 ----------
  const toMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const toDisplayTime = (mins: number) => {
    const hours24 = Math.floor(mins / 60);
    const minutes = mins % 60;
    const ampm = hours24 >= 12 ? "PM" : "AM";
    const hours12 = ((hours24 + 11) % 12) + 1;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const generateTimeSlots = (start: string, end: string, duration: number, frequency: number) => {
    const startMins = toMinutes(start);
    const endMins = toMinutes(end);
    const slots: string[] = [];
    for (let mins = startMins; mins + duration <= endMins; mins += frequency) {
      slots.push(toDisplayTime(mins));
    }
    return slots;
  };

  // ---------- Renderers ----------
  const renderSectionIndicator = () => (
    <div className="flex items-start justify-center mb-8">
      {sections.map((section, index) => (
        <div key={section.id} className="flex items-center">
          <div className="text-center flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${section.id <= currentSection ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
            >
              {section.id < currentSection ? <Check className="w-6 h-6" /> : section.id}
            </div>
            <div className="text-center w-32">
              <p
                className={`text-sm font-medium ${section.id <= currentSection ? "text-blue-600" : "text-gray-500"
                  }`}
              >
                {section.title}
              </p>
              <p className="text-xs text-gray-400 mt-1">{section.description}</p>
            </div>
          </div>
          {index < sections.length - 1 && (
            <div
              className={`w-20 h-1 mx-4 mt-6 flex-shrink-0 ${section.id < currentSection ? "bg-blue-600" : "bg-gray-200"
                }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderSection1 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Tour Experience</h2>
        <p className="text-gray-600">Select the tour that best matches your interests and preferred date</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Available Tours</h3>
        <div className="grid gap-6">
          {tours.map((tour) => (
            <div key={tour.id} className={`tour-card ${selectedTour === tour.id ? "selected" : ""}`}>
              <h3 className="text-lg font-semibold text-indigo-600 mb-2">{tour.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{tour.description}</p>
              <div className="text-sm text-gray-700 space-y-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {tour.duration} {tour.durationUnit}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Max {tour.maxAttendees} people
                </span>
              </div>
              <button
                onClick={() => selectTourById(tour.id)}
                className={`mt-4 px-4 py-2 rounded-lg font-semibold ${selectedTour === tour.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
                  }`}
              >
                {selectedTour === tour.id ? "Selected" : "Select This Tour"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {errors.tourType && (
        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {errors.tourType}
        </p>
      )}

      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-4">Preferred Date</label>
        <input
          type="date"
          value={bookingData.date}
          onChange={(e) => updateBookingData("date", e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className={`w-full px-4 py-3 border-2 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.date ? "border-red-500" : "border-gray-300"
            }`}
        />
        {errors.date && <p className="text-red-500 text-sm mt-2">{errors.date}</p>}
      </div>
    </div>
  );

  const renderSection2 = () => {
    const selected = tours.find((t) => t.id === bookingData.tourId);
    if (!selected) return null;

    const durationMins =
      selected.durationUnit === "hours" ? selected.duration * 60 : selected.duration;
    const frequencyMins =
      selected.frequencyUnit === "hours" ? selected.frequency * 60 : selected.frequency;

    const getAvailableTimes = () => {
      const date = bookingData.date;
      if (!date) return [];
      const dateSpecific = selected.dateSpecificHours?.find(
        (d) => d.date === date && !d.unavailable
      );
      if (dateSpecific) {
        return dateSpecific.slots.flatMap((slot) =>
          generateTimeSlots(slot.start, slot.end, durationMins, frequencyMins)
        );
      }
      const dayOfWeek = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
      const weekly = selected.weeklyHours?.[dayOfWeek];
      if (weekly && weekly.length > 0) {
        return weekly.flatMap((slot) =>
          generateTimeSlots(slot.start, slot.end, durationMins, frequencyMins)
        );
      }
      return [];
    };

    const availableTimes = getAvailableTimes();

    const updateGroupSize = (newSize: number) => {
      const maxSize = selected.maxAttendees || 15;
      updateBookingData("maxAttendees", Math.min(Math.max(1, newSize), maxSize));
    };

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Time Slot</h2>
          <p className="text-gray-600">Choose from available times for your selected tour</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-blue-900">{selected.title}</p>
              <p className="text-blue-700 text-sm">
                {bookingData.date} • {selected.duration} {selected.durationUnit}
              </p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Time Slots</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {availableTimes.length > 0 ? (
              availableTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => updateBookingData("time", time)}
                  className={`p-4 border-2 rounded-lg text-center transition-all hover:shadow-md ${bookingData.time === time
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <Clock className="w-5 h-5 mx-auto mb-2 text-gray-600" />
                  <span className="font-medium">{time}</span>
                </button>
              ))
            ) : (
              <p>No available times</p>
            )}
          </div>
          {errors.time && <p className="text-red-500 text-sm mt-2">{errors.time}</p>}
        </div>
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-4">Group Size</label>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => updateGroupSize(bookingData.maxAttendees - 1)}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50"
            >
              -
            </button>
            <span className="text-2xl font-semibold text-gray-900 min-w-12 text-center">
              {bookingData.maxAttendees}
            </span>
            <button
              type="button"
              onClick={() => updateGroupSize(bookingData.maxAttendees + 1)}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50"
            >
              +
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">Maximum group size: {selected.maxAttendees}</p>
          {errors.maxAttendees && (
            <p className="text-red-500 text-sm mt-2">{errors.maxAttendees}</p>
          )}
        </div>
      </div>
    );
  };

  const renderSection3 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Booking</h2>
        <p className="text-gray-600">Provide your details and preferences to finalize your tour</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Information
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
            <input
              type="text"
              value={bookingData.firstName}
              onChange={(e) => updateBookingData("firstName", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.firstName ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="Enter your first name"
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
            <input
              type="text"
              value={bookingData.lastName}
              onChange={(e) => updateBookingData("lastName", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.lastName ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="Enter your last name"
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
            <input
              type="email"
              value={bookingData.email}
              onChange={(e) => updateBookingData("email", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.contactEmail ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="your.email@example.com"
            />
            {errors.contactEmail && (
              <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <input
              type="tel"
              value={bookingData.phone}
              onChange={(e) => updateBookingData("phone", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.contactPhone ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="(555) 123-4567"
            />
            {errors.contactPhone && (
              <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Background Information
        </h3>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization/School *
            </label>
            <input
              type="text"
              value={bookingData.organization}
              onChange={(e) => updateBookingData("organization", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.organization ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="Your school or organization"
            />
            {errors.organization && (
              <p className="text-red-500 text-sm mt-1">{errors.organization}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
            <select
              value={bookingData.role}
              onChange={(e) => updateBookingData("role", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.role ? "border-red-500" : "border-gray-300"
                }`}
            >
              <option value="">Select your role</option>
              <option value="prospective-student">Prospective Student</option>
              <option value="parent">Parent/Guardian</option>
              <option value="counselor">School Counselor</option>
              <option value="teacher">Teacher</option>
              <option value="administrator">Administrator</option>
              <option value="other">Other</option>
            </select>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">Booking Summary</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <span className="font-medium">Tour:</span>{" "}
            {bookingData.tourType || tours.find((t) => t.id === bookingData.tourId)?.title}
          </p>
          <p>
            <span className="font-medium">Date & Time:</span> {bookingData.date} at {bookingData.time}
          </p>
          <p>
            <span className="font-medium">Group Size:</span> {bookingData.maxAttendees} people
          </p>
          <p>
            <span className="font-medium">Contact:</span> {bookingData.firstName} {bookingData.lastName}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Campus Tour Booking</h1>
            <div className="w-24" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {renderSectionIndicator()}

          <div className="mb-8">
            {currentSection === 1 && renderSection1()}
            {currentSection === 2 && renderSection2()}
            {currentSection === 3 && renderSection3()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <button
              onClick={prevSection}
              disabled={currentSection === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${currentSection === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {currentSection < 3 ? (
              <button
                onClick={nextSection}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                Complete Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
