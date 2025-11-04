import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/calendar.events'],
});

const calendar = google.calendar({ version: 'v3', auth });

export async function createCalendarEvent(eventData) {
  const event = {
    summary: eventData.summary,
    description: eventData.description,
    location: eventData.location,
    start: {
      dateTime: eventData.startISO,
      timeZone: eventData.timezone || 'America/Los_Angeles',
    },
    end: {
      dateTime: eventData.endISO,
      timeZone: eventData.timezone || 'America/Los_Angeles',
    },
    attendees: [
      {
        email: eventData.attendeeEmail,
        displayName: eventData.attendeeName,
      },
    ],
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    sendUpdates: 'all',
  });

  return response.data;
}
