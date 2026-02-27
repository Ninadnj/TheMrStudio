import { google } from 'googleapis';

let calendarClient: ReturnType<typeof google.calendar> | null = null;

export async function getGoogleCalendarClient() {
  if (calendarClient) {
    return calendarClient;
  }

  // Use a Service Account JSON for server-to-server auth without expiration.
  // The JSON file contents should be base64 encoded into process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT
  if (!process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT) {
    throw new Error('Google Calendar not configured: Missing GOOGLE_CALENDAR_SERVICE_ACCOUNT in .env');
  }

  try {
    // Decode base64 to JSON string
    const decodedKey = Buffer.from(process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT, 'base64').toString('utf-8');
    const credentials = JSON.parse(decodedKey);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    calendarClient = google.calendar({ version: 'v3', auth });
    return calendarClient;
  } catch (err) {
    console.error("Failed to parse GOOGLE_CALENDAR_SERVICE_ACCOUNT. Make sure it's a valid Base64 string of the JSON key", err);
    throw new Error("Invalid Google Calendar credentials configuration");
  }
}

// Create a calendar event for a booking
export async function createCalendarEvent(
  calendarId: string,
  summary: string,
  description: string,
  startTime: string,
  endTime: string,
  attendeeEmail?: string
) {
  try {
    const calendar = await getGoogleCalendarClient();

    const event = {
      summary,
      description,
      start: {
        dateTime: startTime,
        timeZone: 'Asia/Tbilisi',
      },
      end: {
        dateTime: endTime,
        timeZone: 'Asia/Tbilisi',
      },
      attendees: attendeeEmail ? [{ email: attendeeEmail }] : [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 60 }, // 1 hour before
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
      sendUpdates: 'all', // Send email notifications to attendees
    });

    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

// Delete a calendar event
export async function deleteCalendarEvent(
  calendarId: string,
  eventId: string
) {
  try {
    const calendar = await getGoogleCalendarClient();

    await calendar.events.delete({
      calendarId,
      eventId,
      sendUpdates: 'all', // Send cancellation notifications
    });

    console.log(`Deleted calendar event ${eventId} from calendar ${calendarId}`);
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
}

// Check availability for a specific calendar on a given date
export async function checkCalendarAvailability(
  calendarId: string,
  date: string
) {
  try {
    const calendar = await getGoogleCalendarClient();

    const timeMin = new Date(`${date}T00:00:00+04:00`).toISOString();
    const timeMax = new Date(`${date}T23:59:59+04:00`).toISOString();

    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  } catch (error) {
    console.error('Error checking calendar availability:', error);
    throw error;
  }
}

// Get all available calendars
export async function listCalendars() {
  try {
    const calendar = await getGoogleCalendarClient();

    const response = await calendar.calendarList.list();
    return response.data.items || [];
  } catch (error) {
    console.error('Error listing calendars:', error);
    throw error;
  }
}

// Get busy time slots from Google Calendar for multiple calendars
export async function getCalendarBusySlots(
  calendarIds: string[],
  date: string
): Promise<Set<string>> {
  try {
    if (!calendarIds || calendarIds.length === 0) {
      return new Set<string>();
    }

    const calendar = await getGoogleCalendarClient();

    // Use freebusy query for efficient batch checking
    const timeMin = new Date(`${date}T00:00:00+04:00`).toISOString();
    const timeMax = new Date(`${date}T23:59:59+04:00`).toISOString();

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: calendarIds.map(id => ({ id })),
      },
    });

    const busySlots = new Set<string>();

    // Process busy times from all calendars
    if (response.data.calendars) {
      for (const [calendarId, calendarData] of Object.entries(response.data.calendars)) {
        const busyTimes = calendarData.busy || [];

        for (const busyPeriod of busyTimes) {
          if (busyPeriod.start && busyPeriod.end) {
            // Convert busy period to hourly slots in Asia/Tbilisi timezone
            const startTime = new Date(busyPeriod.start);
            const endTime = new Date(busyPeriod.end);

            // Calculate duration in minutes
            const durationMs = endTime.getTime() - startTime.getTime();
            const durationMinutes = Math.floor(durationMs / (60 * 1000));

            // Get start hour and minute in Tbilisi timezone
            const tbilisiTimeStr = startTime.toLocaleString('en-US', {
              timeZone: 'Asia/Tbilisi',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });

            const [startHours, startMinutes] = tbilisiTimeStr.split(':').map(Number);

            // Calculate which 30-minute slots this busy period overlaps
            const startMinutesFromMidnight = startHours * 60 + startMinutes;
            const endMinutesFromMidnight = startMinutesFromMidnight + durationMinutes;

            // Block all 30-minute slots from start to end
            // Round down to nearest 30-minute slot for start
            const firstSlotMinutes = Math.floor(startMinutesFromMidnight / 30) * 30;
            // Round up to include the slot where booking ends
            const lastSlotMinutes = Math.ceil(endMinutesFromMidnight / 30) * 30;

            // Log for debugging
            const blockedSlots: string[] = [];
            for (let slotMinutes = firstSlotMinutes; slotMinutes < lastSlotMinutes; slotMinutes += 30) {
              const slotHours = Math.floor(slotMinutes / 60);
              const slotMins = slotMinutes % 60;
              const slotTime = `${slotHours.toString().padStart(2, '0')}:${slotMins.toString().padStart(2, '0')}`;
              busySlots.add(slotTime);
              blockedSlots.push(slotTime);
            }

            console.log(`Calendar busy slot: ${busyPeriod.start} → Tbilisi ${tbilisiTimeStr} → blocking slots: ${blockedSlots.join(', ')}`);
          }
        }
      }
    }

    return busySlots;
  } catch (error) {
    console.error('Error getting calendar busy slots:', error);
    // Return empty set on error to prevent blocking all bookings
    return new Set<string>();
  }
}

// Test if the service account can access a specific calendar
export async function testCalendarAccess(calendarId: string): Promise<{ success: boolean; error?: string; calendarSummary?: string }> {
  try {
    const calendar = await getGoogleCalendarClient();

    const response = await calendar.events.list({
      calendarId,
      maxResults: 1,
      timeMin: new Date().toISOString(),
    });

    return {
      success: true,
      calendarSummary: response.data.summary || 'No summary',
    };
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    const statusCode = error?.code || error?.response?.status;

    return {
      success: false,
      error: `[${statusCode || 'UNKNOWN'}] ${errorMessage}`,
    };
  }
}
