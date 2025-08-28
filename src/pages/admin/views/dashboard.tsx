import React, { useState, useEffect } from 'react';
import type { UserRole } from "../../../appTypes.d.ts";
import { Calendar, Users } from 'lucide-react';
import { db } from '../../../../src/firebase.ts';
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export default function DashboardView() {
  const [currentRole, setCurrentRole] = useState<UserRole>("public");
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [todaysTours, setTodaysTours] = useState(0);
  const [weeklyTours, setWeeklyTours] = useState(0);
  const [editBooking, setEditBooking] = useState<BookingData | null>(null);
  const [formData, setFormData] = useState<BookingData | null>(null);
  const [besaList, setBesaList] = useState<BesaData[]>([]);

  const dayMapping = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
  };

  {/* Fetch BESA Data */}
  useEffect(() => {
    const fetchBESAs = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Besas")); 
        const data = snapshot.docs.map((doc) => {
          const docData = doc.data();

          const convertedOfficeHours: { [day: string]: DayHours } = {};
          Object.entries(docData.officeHours || {}).forEach(([day, hours]) => {
            if (
              hours &&
              typeof hours === 'object' &&
              'start' in hours &&
              'end' in hours
            ) {
              convertedOfficeHours[day] = {
                available: true,
                timeSlots: [{
                  id: Math.random().toString(36).substr(2, 9),
                  start: typeof hours.start === 'string' ? hours.start : '09:00',
                  end: typeof hours.end === 'string' ? hours.end : '17:00'
                }]
              };
            } else if (
              hours &&
              typeof hours === 'object' &&
              'available' in hours &&
              'timeSlots' in hours
            ) {
              convertedOfficeHours[day] = {
                available: !!(hours as any).available,
                timeSlots: Array.isArray((hours as any).timeSlots)
                  ? (hours as any).timeSlots.map((slot: any) => ({
                      id: typeof slot.id === 'string' ? slot.id : Math.random().toString(36).substr(2, 9),
                      start: typeof slot.start === 'string' ? slot.start : '09:00',
                      end: typeof slot.end === 'string' ? slot.end : '17:00'
                    }))
                  : []
              };
            } else {
              convertedOfficeHours[day] = {
                available: false,
                timeSlots: []
              };
            }
          });

          return {
            id: doc.id,
            name: docData.name,
            email: docData.email,
            status: docData.status,
            role: docData.role,
            officeHours: convertedOfficeHours
          } as BesaData;
        });
        setBesaList(data);
      } catch (error) {
        console.error("Error fetching BESAs:", error);
      }
    };

    fetchBESAs();
  }, []);

  {/* Fetch Booking Data */}
  useEffect(() => {
    const fetchData = async () => {
      try {
        const toursSnap = await getDocs(collection(db, "Tours"));
        const toursData = toursSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Tour[];
        setTours(toursData);

        const bookingsRef = collection(db, "Bookings");
        const snapshot = await getDocs(bookingsRef);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BookingData[];

        setBookings(data);

        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(today);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const todayCount = data.filter((b) => b.date === todayStr).length;
        const weekCount = data.filter((b) => {
          const bookingDate = new Date(b.date);
          return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
        }).length;

        setTodaysTours(todayCount);
        setWeeklyTours(weekCount);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchData();
  }, []);

  // Convert 24hr to 12hr format
  const formatTime12Hour = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Convert 12hr to 24hr format
  const parseTime12Hour = (time12: string) => {
    if (!time12) return '';
    
    // Handle various time formats
    const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
    const match = time12.match(timeRegex);
    
    if (!match) return '';
    
    let hour = parseInt(match[1], 10);
    const minute = match[2];
    const ampm = match[3].toUpperCase();
    
    if (ampm === 'PM' && hour !== 12) {
      hour += 12;
    } else if (ampm === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  };

  // Check if a booking time falls within a BESA's availability
  const isBesaAvailable = (besa: BesaData, bookingDate: string, bookingTime: string) => {
    if (!bookingDate || !bookingTime) return false;
    
    const date = new Date(bookingDate);
    const dayOfWeek = date.getDay();
    const dayKey = dayMapping[dayOfWeek as keyof typeof dayMapping];
    
    const dayHours = besa.officeHours[dayKey];
    if (!dayHours || !dayHours.available || dayHours.timeSlots.length === 0) {
      return false;
    }
    
    // Convert booking time to 24hr format for comparison
    const bookingTime24 = parseTime12Hour(bookingTime);
    if (!bookingTime24) return false;
    
    // Check if booking time falls within any of the BESA's time slots
    return dayHours.timeSlots.some(slot => {
      return bookingTime24 >= slot.start && bookingTime24 <= slot.end;
    });
  };

  // Get available BESAs for a specific booking
  const getAvailableBesas = (booking: BookingData) => {
    return besaList.filter(besa => 
      besa.status === 'active' && isBesaAvailable(besa, booking.date, booking.time)
    );
  };

  const handleEditClick = (booking: BookingData) => {
    setEditBooking(booking);
    setFormData({ ...booking });
  };

  const handleSave = async () => {
    if (!editBooking || !formData) return;
    try {
      await updateDoc(doc(db, "Bookings", formData.id!), { ...formData });
      setEditBooking(null);
      
      const bookingsRef = collection(db, "Bookings");
      const snapshot = await getDocs(bookingsRef);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BookingData[];
      setBookings(data);
      
      alert("Booking updated successfully!");
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {currentRole === 'admin' ? 'Admin Dashboard' : 'BESA Dashboard'}
        </h1>
        <p className="text-gray-600">
          {currentRole === 'admin'
            ? 'Manage tours, BESAs, and system settings'
            : 'Track your assigned tours and manage your schedule'
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border-b-4 border-orange-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Tours</p>
              <p className="text-3xl font-bold text-gray-900">{todaysTours}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-b-4 border-orange-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-3xl font-bold text-gray-900">{weeklyTours}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BESA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.tourType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.date}
                    <div className="text-sm text-gray-500">{booking.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.attendees}/{booking.maxAttendees}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.besa || (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.firstName} {booking.lastName}
                    <div className="text-sm text-gray-500">{booking.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                      onClick={() => handleEditClick(booking)}
                      className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editBooking && formData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Booking</h3>

            {/* First Name */}
            <label className="block mb-2 font-medium">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />

            {/* Last Name */}
            <label className="block mb-2 font-medium">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />

            {/* Contact Email */}
            <label className="block mb-2 font-medium">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />

            {/* Contact Phone */}
            <label className="block mb-2 font-medium">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />

            {/* Organization */}
            <label className="block mb-2 font-medium">Organization</label>
            <input
              type="text"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />

            {/* Role */}
            <label className="block mb-2 font-medium">Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />

            {/* Tour Type */}
            <label className="block mb-2 font-medium">Tour</label>
            <select
              value={formData.id || ""}
              onChange={(e) => {
                const tour = tours.find(t => t.id === e.target.value);
                if (tour) setFormData({ ...formData, id: tour.id, tourType: tour.title });
              }}
              className="w-full px-3 py-2 border rounded-lg mb-4">
              <option value="">Select a tour</option>
              {tours.map((tour) => (
                <option key={tour.id} value={tour.id}>{tour.title}</option>
              ))}
            </select>

            {/* Date */}
            <label className="block mb-2 font-medium">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />

            {/* Time */}
            <label className="block mb-2 font-medium">Time</label>
            <input
              type="text"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg mb-4"
              placeholder="e.g., 10:00 AM"
            />

            {/* BESA Assignment - Filtered by availability */}
            <label className="block mb-2 font-medium">
              BESA Assignment
              {formData.date && formData.time && (
                <span className="text-sm text-gray-500 ml-2">
                  (Available on {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long' })} at {formData.time})
                </span>
              )}
            </label>
            <select
              value={formData.besa || ""}
              onChange={(e) => setFormData({ ...formData, besa: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg mb-4">
              <option value="">Select a BESA</option>
              {getAvailableBesas(formData).map((besa) => (
                <option key={besa.id} value={besa.name}>
                  {besa.name}
                </option>
              ))}
            </select>

            {/* Show availability info */}
            {formData.date && formData.time && getAvailableBesas(formData).length === 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ No BESAs are available at this date and time. You may need to:
                </p>
                <ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
                  <li>Change the booking time</li>
                  <li>Update BESA office hours</li>
                  <li>Assign manually (override availability)</li>
                </ul>
              </div>
            )}

            {/* Manual override option when no BESAs are available */}
            {formData.date && formData.time && getAvailableBesas(formData).length === 0 && (
              <div className="mb-4">
                <label className="block mb-2 font-medium text-orange-600">Manual Override (All BESAs)</label>
                <select
                  value={formData.besa || ""}
                  onChange={(e) => setFormData({ ...formData, besa: e.target.value })}
                  className="w-full px-3 py-2 border border-orange-300 rounded-lg">
                  <option value="">Select any BESA (override availability)</option>
                  {besaList.filter(besa => besa.status === 'active').map((besa) => (
                    <option key={besa.id} value={besa.name}>
                      {besa.name} (not available at this time)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Attendees */}
            <label className="block mb-2 font-medium">Attendees</label>
            <input
              type="number"
              value={formData.attendees}
              onChange={(e) => setFormData({ ...formData, attendees: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />

            {/* Max Attendees */}
            <label className="block mb-2 font-medium">Max Attendees</label>
            <input
              type="number"
              value={formData.maxAttendees}
              onChange={(e) => setFormData({ ...formData, maxAttendees: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />

            {/* Interests */}
            <label className="block mb-2 font-medium">Interests (comma separated)</label>
            <input
              type="text"
              value={formData.interests.join(", ")}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value.split(",").map(i => i.trim()) })}
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditBooking(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
