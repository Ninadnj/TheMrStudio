import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-calendar',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Calendar not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableGoogleCalendarClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
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
    const calendar = await getUncachableGoogleCalendarClient();
    
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

// Check availability for a specific calendar on a given date
export async function checkCalendarAvailability(
  calendarId: string,
  date: string
) {
  try {
    const calendar = await getUncachableGoogleCalendarClient();
    
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
    const calendar = await getUncachableGoogleCalendarClient();
    
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

    const calendar = await getUncachableGoogleCalendarClient();
    
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
            
            // Calculate which hourly slots this busy period overlaps
            const startMinutesFromMidnight = startHours * 60 + startMinutes;
            const endMinutesFromMidnight = startMinutesFromMidnight + durationMinutes;
            
            // Block all hours from start to end (inclusive)
            const startHour = Math.floor(startMinutesFromMidnight / 60);
            const endHour = Math.floor((endMinutesFromMidnight - 1) / 60);
            
            // Log for debugging
            console.log(`Calendar busy slot: ${busyPeriod.start} → Tbilisi ${tbilisiTimeStr} → blocking hours ${startHour}-${endHour}`);
            
            for (let hour = startHour; hour <= endHour; hour++) {
              const slotTime = `${hour.toString().padStart(2, '0')}:00`;
              busySlots.add(slotTime);
            }
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
