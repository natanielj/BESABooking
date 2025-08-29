export {};

declare global {
//Tour Type     
    
    type editingTour = "true" | "false";

    type UserRole = 'public' | 'admin';
    interface TimeSlot {
        start: string;
        end: string;
        id: string;
    }


    type Tour = {
        id?: string;
        title: string;
        description: string;
        duration: number;
        durationUnit: 'minutes' | 'hours';
        maxAttendees: number;
        location: string;
        zoomLink: string;
        autoGenerateZoom: boolean;
        // Availability
        weeklyHours: {
            [key: string]: { start: string; end: string }[];
        };
        dateSpecificHours: Array<{
            date: string;
            slots: { start: string; end: string }[];
            unavailable: boolean;
        }>;
        frequency: number;
        frequencyUnit: 'minutes' | 'hours';
        // Scheduling Rules
        registrationLimit: number;
        minNotice: number;
        minNoticeUnit: 'hours' | 'days' | 'weeks';
        maxNotice: number;
        maxNoticeUnit: 'days' | 'weeks' | 'months';
        bufferTime: number;
        bufferUnit: 'minutes' | 'hours';
        cancellationPolicy: string;
        reschedulingPolicy: string;
        // Intake Form
        intakeForm: {
            firstName: boolean;
            lastName: boolean;
            email: boolean;
            phone: boolean;
            attendeeCount: boolean;
            majorsInterested: boolean;
            customQuestions: Array<{
            question: string;
            type: 'text' | 'textarea' | 'select' | 'checkbox';
            required: boolean;
            options?: string[];
            }>;
        };
        // Notifications
        reminderEmails: Array<{
            timing: number;
            unit: 'hours' | 'days' | 'weeks';
        }>;
        sessionInstructions: string;
        // Status
        published: boolean;
        createdAt?: string;
        upcomingBookings?: number;
        totalBookings?: number;
    };

// Tour Booking
    interface DayHours {
        available: boolean;
        timeSlots: TimeSlot[];
    }
    type TimeSlot = {
        id: string;
        start: string;
        end: string;
    };
    
    type OfficeHours = {
    available: boolean;
    timeSlots: TimeSlot[];
    };

    interface BesaData {
        id: string;
        name: string;
        email: string;
        status: string;
        role: string;
        officeHours: {
            [day: string]: DayHours;
        };
    }

    interface BookingData {
        id?: string;
        timeSlot?: string,
        groupSize?: number,
        tourType?: string;
        status?: string,
        date: string;
        time: string;
        attendees: number;
        maxAttendees: number;
        besas: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        organization?: string;
        role?: string;
        interests: string[];
        accessibility?: string,
        specialRequests?: string,
        marketingConsent?: boolean,
        leadGuide?: string,
        notes?: string,
    }

    type Besa = {
      id: string;
      name: string;
      email: string;
      status: string;
      role: string;
      officeHours: {
        monday: OfficeHours;
        tuesday: OfficeHours;
        wednesday: OfficeHours;
        thursday: OfficeHours;
        friday: OfficeHours;
        saturday: OfficeHours;
        sunday: OfficeHours;
      };
    };

    type UserRole = 'public' | 'admin';

}