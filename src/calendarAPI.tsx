// Minimal helpers for Google Calendar via REST + GIS (browser)
export type Attendee = { email: string; displayName?: string };

export type InsertEventInput = {
  accessToken: string;
  summary: string;
  description?: string;
  location?: string;
  startISO: string;
  endISO: string;
  calendarId?: string;
  attendeeEmail?: string;     
  attendeeName?: string;
  extraAttendees?: Attendee[];
  timezone?: string;
};


export async function insertCalendarEvent(input: InsertEventInput) {
  const {
    accessToken,
    summary,
    description,
    location,
    startISO,
    endISO,
    calendarId = "primary",
    attendeeEmail,
    attendeeName,
    extraAttendees = [],        
    timezone,
  } = input;
  
  const attendees = [
    ...(attendeeEmail ? [{ email: attendeeEmail, displayName: attendeeName }] : []),
    ...extraAttendees,
  ];

  const body: any = {
    summary,
    description,
    location,
    start: timezone ? { dateTime: startISO, timeZone: timezone } : { dateTime: startISO },
    end: timezone ? { dateTime: endISO, timeZone: timezone } : { dateTime: endISO },
    attendees,
    guestsCanInviteOthers: false,
    guestsCanModify: false,
    guestsCanSeeOtherGuests: true,
    reminders: { useDefault: true },
  };
  
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    calendarId
  )}/events?sendUpdates=all`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Calendar insert failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

/** Load GIS script and return a function that requests an access token for Calendar scope */
export async function getCalendarAccessToken(clientId: string): Promise<string> {
  // Ensure GIS script
  await new Promise<void>((resolve, reject) => {
    if ((window as any).google?.accounts?.oauth2) return resolve();
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google Identity Services."));
    document.head.appendChild(s);
  });

  return new Promise<string>((resolve, reject) => {
    const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      // Least-privilege scope that can create/list user events:
      scope: "https://www.googleapis.com/auth/calendar.events",
      callback: (resp: any) => {
        if (resp && resp.access_token) resolve(resp.access_token);
        else reject(new Error("No access token returned."));
      },
    });

    // First call shows a consent prompt; subsequent calls can be silent with prompt: ""
    tokenClient.requestAccessToken({ prompt: "" });
  });
}
