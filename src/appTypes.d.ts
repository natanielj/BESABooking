import { Type } from "lucide-react";
export {};




declare global {
    type UserRole = 'public' | 'admin';
    interface BookingData {
        id?: string;
        tourType: string;
        date: string;
        time: string;
        attendees: number;
        maxAttendees: number;
        besa?: string;
        contactEmail: string;
        firstName: string;
        lastName: string;
        contactPhone: string;
        organization: string;
        role: string;
        interests: string[];
        accessibility: string;
        specialRequests: string;
        marketingConsent: boolean;
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

    interface DynamicBookingFormProps {
        onBack: () => void | Promise<void>;
        preselectedTour?: string;
        tours: Tour[]; 
    }

    
}