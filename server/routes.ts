import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertBookingSchema,
  chatRequestSchema,
  insertHeroContentSchema,
  insertServiceSchema,
  insertSiteSettingsSchema,
  insertStaffSchema,
  insertGalleryImageSchema,
  insertServicesSectionSchema,
  insertSpecialOfferSchema,
  insertTrendSchema,
  insertTrendsSectionSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { chatWithGemini } from "./gemini-chat";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import {
  loginHandler,
  logoutHandler,
  checkAuthHandler,
  requireAuth
} from "./auth";
import { createCalendarEvent } from "./google-calendar";
import {
  sendNewBookingNotification,
  sendBookingConfirmationToClient,
  sendBookingRejectionToClient
} from "./email-notifications";
import { ObjectPermission } from "./objectAcl";
// Define uploadDir globally so the static file handler can access it
const uploadDir = process.env.PRIVATE_OBJECT_DIR || ".local/storage/uploads";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup flexible local/cloud upload storage
  let storageConfig;

  if (process.env.CLOUDINARY_URL) {
    // If Cloudinary URL is defined (e.g., on Render), save direct to cloud
    console.log("[Upload Config] CLOUDINARY_URL detected. Using Cloudinary for image storage.");

    try {
      // Bulletproof manual parsing to prevent SDK auto-hydration crashes
      const urlMatches = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
      if (urlMatches) {
        cloudinary.config({
          api_key: urlMatches[1],
          api_secret: urlMatches[2],
          cloud_name: urlMatches[3]
        });
        console.log("[Upload Config] Configured Cloudinary explicitly.");
      } else {
        // Fallback to letting the SDK try and parse it if regex fails
        cloudinary.config(true);
      }
    } catch (e) {
      console.error("[Upload Config] Failed to parse Cloudinary URL for explicit config", e);
    }

    storageConfig = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'the-mr-studio-uploads', // The folder name in your Cloudinary account
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'heic'],
        public_id: (req: any, file: any) => Date.now() + '-' + Math.round(Math.random() * 1E9),
      } as any, // Cast to any to handle type mismatch in @types
    });
  } else {
    // Local development fallback
    console.log("[Upload Config] No CLOUDINARY_URL detected. Falling back to local disk storage.");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    storageConfig = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, uploadDir);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      }
    });
  }

  const upload = multer({ storage: storageConfig });
  // Auth routes
  app.post("/api/admin/login", loginHandler);
  app.post("/api/admin/logout", logoutHandler);
  app.get("/api/admin/check", checkAuthHandler);
  // Create a new booking (pending status by default)
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);

      // No calendar event is created here - it happens only on admin approval

      // Send email notification to admin if configured
      const settings = await storage.getSiteSettings();
      if (settings?.adminEmail) {
        await sendNewBookingNotification(booking, settings.adminEmail);
      }

      res.status(201).json(booking);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        console.error('Booking creation error:', error);
        res.status(500).json({ error: "Failed to create booking" });
      }
    }
  });

  // Get available time slots for a specific date
  app.get("/api/bookings/availability", async (req, res) => {
    try {
      const { date, staffId } = req.query;

      if (!date || typeof date !== "string") {
        return res.status(400).json({ error: "Date parameter is required" });
      }

      const bookings = await storage.getBookingsByDate(date);

      // Calculate all blocked time slots based on booking duration
      const bookedTimesSet = new Set<string>();

      // IMPORTANT: Find all staff members who share the same calendar
      // This handles cases where multiple staff entries (e.g., Manicure/Pedicure) share one calendar
      let staffIdsWithSameCalendar: string[] = [];
      if (staffId && typeof staffId === "string") {
        const selectedStaff = await storage.getStaffById(staffId);
        if (selectedStaff?.calendarId) {
          // Find all staff with the same calendar ID
          const allStaff = await storage.getAllStaff();
          staffIdsWithSameCalendar = allStaff
            .filter(s => s.calendarId === selectedStaff.calendarId)
            .map(s => s.id);

          console.log(`Staff ${selectedStaff.name} shares calendar with ${staffIdsWithSameCalendar.length} staff member(s)`);
        } else {
          staffIdsWithSameCalendar = [staffId];
        }
      }

      // IMPORTANT: Only count PENDING and CONFIRMED bookings from database
      // This ensures if Google Calendar isn't synced, the local system still works perfectly
      // (The Set data structure automatically prevents duplicate double-counting if Google Calendar is active)
      const relevantBookings = bookings.filter(b => {
        const isBlocking = b.status === 'pending' || b.status === 'confirmed';
        const matchesStaff = staffId && typeof staffId === "string"
          ? staffIdsWithSameCalendar.includes(b.staffId ?? '')
          : true;
        return isBlocking && matchesStaff;
      });

      for (const booking of relevantBookings) {
        try {
          const [hours, minutes] = booking.time.split(':').map(Number);
          const durationMinutes = parseInt(booking.duration);

          // Validate duration is a valid number
          if (isNaN(durationMinutes) || durationMinutes <= 0) {
            console.error(`Invalid duration for booking ${booking.id}: ${booking.duration}`);
            continue;
          }

          // Calculate which 30-minute slots this booking overlaps
          const startMinutes = hours * 60 + (minutes || 0);
          const endMinutes = startMinutes + durationMinutes;

          // Block all 30-minute slots from start to end
          // Round down to nearest 30-minute slot for start
          const firstSlotMinutes = Math.floor(startMinutes / 30) * 30;
          // Round up to include the slot where booking ends
          const lastSlotMinutes = Math.ceil(endMinutes / 30) * 30;

          for (let slotMinutes = firstSlotMinutes; slotMinutes < lastSlotMinutes; slotMinutes += 30) {
            const slotHours = Math.floor(slotMinutes / 60);
            const slotMins = slotMinutes % 60;
            const slotTime = `${slotHours.toString().padStart(2, '0')}:${slotMins.toString().padStart(2, '0')}`;
            bookedTimesSet.add(slotTime);
          }
        } catch (bookingError) {
          console.error(`Error processing booking ${booking.id}:`, bookingError);
          continue;
        }
      }

      // Check Google Calendar - only for the selected staff member if provided
      try {
        let calendarIds: string[] = [];

        if (staffId && typeof staffId === "string") {
          // Only check the selected staff member's calendar
          const selectedStaff = await storage.getStaffById(staffId);
          if (selectedStaff?.calendarId) {
            calendarIds = [selectedStaff.calendarId];
          }
        } else {
          // No staff selected - check all calendars (fallback for compatibility)
          const staff = await storage.getAllStaff();
          calendarIds = staff
            .filter(s => s.calendarId)
            .map(s => s.calendarId as string);
        }

        if (calendarIds.length > 0) {
          const { getCalendarBusySlots } = await import('./google-calendar.js');
          const calendarBusySlots = await getCalendarBusySlots(calendarIds, date);

          // Merge calendar busy slots with database bookings
          calendarBusySlots.forEach(slot => bookedTimesSet.add(slot));

          console.log(`Checked ${calendarIds.length} Google Calendars, found ${calendarBusySlots.size} busy slots`);
        }
      } catch (calendarError) {
        // Log error but don't fail the request - fallback to database bookings only
        console.error('Error checking Google Calendar availability:', calendarError);
      }

      const bookedTimes = Array.from(bookedTimesSet);

      res.json({ bookedTimes });
    } catch (error) {
      console.error('Availability endpoint error:', error);
      res.status(500).json({ error: "Failed to fetch availability" });
    }
  });

  // Get all bookings (optional, for admin/debugging)
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Admin booking management routes (protected)
  app.get("/api/admin/bookings/pending", requireAuth, async (req, res) => {
    try {
      const bookings = await storage.getPendingBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending bookings" });
    }
  });

  app.get("/api/admin/bookings/confirmed", requireAuth, async (req, res) => {
    try {
      const bookings = await storage.getConfirmedBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch confirmed bookings" });
    }
  });

  app.post("/api/admin/bookings/:id/approve", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;

      // Get booking first to check staff
      const existingBooking = await storage.getBookingById(id);
      if (!existingBooking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      let calendarEventId: string | undefined;

      // Create Google Calendar event before approving
      if (existingBooking.staffId) {
        const staff = await storage.getStaffById(existingBooking.staffId);

        if (staff?.calendarId) {
          try {
            const [year, month, day] = existingBooking.date.split('-');
            const [hours, minutes] = existingBooking.time.split(':');

            const offsetMinutes = 4 * 60;
            const startUtc = Date.UTC(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
              parseInt(hours),
              parseInt(minutes)
            ) - offsetMinutes * 60 * 1000;

            const durationMs = parseInt(existingBooking.duration) * 60 * 1000;
            const endUtc = startUtc + durationMs;

            const startDateTime = new Date(startUtc).toISOString();
            const endDateTime = new Date(endUtc).toISOString();

            const summary = `${existingBooking.service} - ${existingBooking.fullName}`;
            const description = `
Booking Details:
Client: ${existingBooking.fullName}
Phone: ${existingBooking.phone}
Email: ${existingBooking.email}
Service: ${existingBooking.service}
Staff: ${existingBooking.staffName}
Duration: ${existingBooking.duration} minutes
${existingBooking.notes ? `Notes: ${existingBooking.notes}` : ''}
            `.trim();

            const calendarEvent = await createCalendarEvent(
              staff.calendarId,
              summary,
              description,
              startDateTime,
              endDateTime,
              existingBooking.email
            );

            if (calendarEvent?.id) {
              calendarEventId = calendarEvent.id;
            }

            console.log(`Calendar event ${calendarEventId} created for approved booking ${id}`);
          } catch (calendarError) {
            console.error('Failed to create calendar event:', calendarError);
          }
        }
      }

      // Approve booking and store calendar event ID
      const booking = await storage.approveBooking(id, calendarEventId);

      if (booking) {
        // Notify client
        await sendBookingConfirmationToClient(booking);
      }

      res.json(booking);
    } catch (error) {
      console.error('Approve booking error:', error);
      res.status(500).json({ error: "Failed to approve booking" });
    }
  });

  app.post("/api/admin/bookings/:id/reject", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const booking = await storage.rejectBooking(id, reason);

      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Notify client
      if (booking) {
        await sendBookingRejectionToClient(booking, reason);
      }

      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject booking" });
    }
  });

  app.put("/api/admin/bookings/:id/modify", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { time, duration } = req.body;
      const booking = await storage.modifyBooking(id, { time, duration });

      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to modify booking" });
    }
  });

  app.delete("/api/admin/bookings/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;

      // Get booking details before deleting
      const booking = await storage.getBookingById(id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // If booking is confirmed, delete the calendar event
      if (booking.status === 'confirmed' && booking.calendarEventId && booking.staffId) {
        const staff = await storage.getStaffById(booking.staffId);
        if (staff?.calendarId) {
          try {
            const { deleteCalendarEvent } = await import('./google-calendar.js');
            await deleteCalendarEvent(staff.calendarId, booking.calendarEventId);
            console.log(`Deleted calendar event ${booking.calendarEventId} for booking ${id}`);
          } catch (calendarError) {
            console.error('Failed to delete calendar event:', calendarError);
            // Continue with booking deletion even if calendar deletion fails
          }
        }
      }

      // Delete booking from database
      const deleted = await storage.deleteBooking(id);
      if (!deleted) {
        return res.status(500).json({ error: "Failed to delete booking" });
      }

      res.json({ success: true, message: "Booking deleted successfully" });
    } catch (error) {
      console.error('Delete booking error:', error);
      res.status(500).json({ error: "Failed to delete booking" });
    }
  });

  // Chat with Gemini assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const validatedData = chatRequestSchema.parse(req.body);
      const response = await chatWithGemini(validatedData.messages, validatedData.language);
      res.json({ response });
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        console.error("Chat error:", error);
        res.status(500).json({ error: "Failed to get chat response" });
      }
    }
  });

  // Admin content management routes (protected)

  // Hero content
  app.get("/api/admin/hero-content", requireAuth, async (req, res) => {
    try {
      const content = await storage.getHeroContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hero content" });
    }
  });

  app.put("/api/admin/hero-content", requireAuth, async (req, res) => {
    try {
      const validatedData = insertHeroContentSchema.parse(req.body);
      const content = await storage.updateHeroContent(validatedData);
      res.json(content);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to update hero content" });
      }
    }
  });

  // Services
  app.get("/api/admin/services", requireAuth, async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.post("/api/admin/services", requireAuth, async (req, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData);
      res.status(201).json(service);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to create service" });
      }
    }
  });

  app.put("/api/admin/services/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(id, validatedData);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        console.error("Service update validation error:", validationError.message);
        res.status(400).json({ error: validationError.message });
      } else {
        console.error("Service update error:", error);
        res.status(500).json({ error: "Failed to update service" });
      }
    }
  });

  app.delete("/api/admin/services/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteService(id);
      if (!deleted) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete service" });
    }
  });

  // Site settings
  app.get("/api/admin/settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/admin/settings", requireAuth, async (req, res) => {
    try {
      const validatedData = insertSiteSettingsSchema.parse(req.body);
      const settings = await storage.updateSiteSettings(validatedData);
      res.json(settings);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to update settings" });
      }
    }
  });

  // Staff management
  app.get("/api/admin/staff", requireAuth, async (req, res) => {
    try {
      const staff = await storage.getAllStaff();
      res.json(staff);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff" });
    }
  });

  app.get("/api/staff", async (req, res) => {
    try {
      const staff = await storage.getAllStaff();
      res.json(staff);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff" });
    }
  });

  app.get("/api/staff/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const staff = await storage.getStaffByCategory(category);
      res.json(staff);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff by category" });
    }
  });

  app.post("/api/admin/staff", requireAuth, async (req, res) => {
    try {
      const validatedData = insertStaffSchema.parse(req.body);
      const staffMember = await storage.createStaff(validatedData);
      res.status(201).json(staffMember);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to create staff member" });
      }
    }
  });

  app.put("/api/admin/staff/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;

      // Validate the update data - partial schema since not all fields required for update
      const validatedData = insertStaffSchema.partial().parse(req.body);

      const staffMember = await storage.updateStaff(id, validatedData);
      if (!staffMember) {
        return res.status(404).json({ error: "Staff member not found" });
      }
      res.json(staffMember);
    } catch (error: any) {
      console.error("Error updating staff member:", error);
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to update staff member" });
      }
    }
  });

  app.delete("/api/admin/staff/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteStaff(id);
      if (!deleted) {
        return res.status(404).json({ error: "Staff member not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete staff member" });
    }
  });

  // Gallery management
  app.get("/api/gallery", async (req, res) => {
    try {
      const images = await storage.getAllGalleryImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gallery images" });
    }
  });

  app.get("/api/admin/gallery", requireAuth, async (req, res) => {
    try {
      const images = await storage.getAllGalleryImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gallery images" });
    }
  });

  app.post("/api/admin/gallery", requireAuth, async (req, res) => {
    try {
      console.log("[Gallery POST] Creating gallery image with data:", req.body);
      const validatedData = insertGalleryImageSchema.parse(req.body);
      const image = await storage.createGalleryImage(validatedData);
      console.log("[Gallery POST] Created gallery image:", image);
      res.status(201).json(image);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        console.error("[Gallery POST] Error:", error);
        res.status(500).json({ error: "Failed to create gallery image" });
      }
    }
  });

  app.put("/api/admin/gallery/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const image = await storage.updateGalleryImage(id, req.body);
      if (!image) {
        return res.status(404).json({ error: "Gallery image not found" });
      }
      res.json(image);
    } catch (error) {
      res.status(500).json({ error: "Failed to update gallery image" });
    }
  });

  app.delete("/api/admin/gallery/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteGalleryImage(id);
      if (!deleted) {
        return res.status(404).json({ error: "Gallery image not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete gallery image" });
    }
  });

  // Services section content
  app.get("/api/services-section", async (req, res) => {
    try {
      const content = await storage.getServicesSection();
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services section content" });
    }
  });

  app.get("/api/admin/services-section", requireAuth, async (req, res) => {
    try {
      const content = await storage.getServicesSection();
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services section content" });
    }
  });

  app.put("/api/admin/services-section", requireAuth, async (req, res) => {
    try {
      const validatedData = insertServicesSectionSchema.parse(req.body);
      const content = await storage.updateServicesSection(validatedData);
      res.json(content);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to update services section content" });
      }
    }
  });

  // Public services route
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  // Special offers routes
  app.get("/api/special-offers/active", async (req, res) => {
    try {
      const offer = await storage.getActiveSpecialOffer();
      res.json(offer || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active special offer" });
    }
  });

  app.get("/api/admin/special-offers", requireAuth, async (req, res) => {
    try {
      const offers = await storage.getAllSpecialOffers();
      res.json(offers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch special offers" });
    }
  });

  app.post("/api/admin/special-offers", requireAuth, async (req, res) => {
    try {
      const validatedData = insertSpecialOfferSchema.parse(req.body);
      const offer = await storage.createSpecialOffer(validatedData);
      res.status(201).json(offer);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to create special offer" });
      }
    }
  });

  app.put("/api/admin/special-offers/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const offer = await storage.updateSpecialOffer(id, req.body);
      if (!offer) {
        return res.status(404).json({ error: "Special offer not found" });
      }
      res.json(offer);
    } catch (error) {
      res.status(500).json({ error: "Failed to update special offer" });
    }
  });

  app.delete("/api/admin/special-offers/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSpecialOffer(id);
      if (!deleted) {
        return res.status(404).json({ error: "Special offer not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete special offer" });
    }
  });

  // Trends management
  app.get("/api/trends", async (req, res) => {
    try {
      const trends = await storage.getAllTrends();
      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trends" });
    }
  });

  app.get("/api/admin/trends", requireAuth, async (req, res) => {
    try {
      const trends = await storage.getAllTrends();
      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trends" });
    }
  });

  app.post("/api/admin/trends", requireAuth, async (req, res) => {
    try {
      const validatedData = insertTrendSchema.parse(req.body);
      const trend = await storage.createTrend(validatedData);
      res.status(201).json(trend);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to create trend" });
      }
    }
  });

  app.put("/api/admin/trends/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const trend = await storage.updateTrend(id, req.body);
      if (!trend) {
        return res.status(404).json({ error: "Trend not found" });
      }
      res.json(trend);
    } catch (error) {
      res.status(500).json({ error: "Failed to update trend" });
    }
  });

  app.delete("/api/admin/trends/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTrend(id);
      if (!deleted) {
        return res.status(404).json({ error: "Trend not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete trend" });
    }
  });

  // Trends section heading management
  app.get("/api/trends-section", async (req, res) => {
    try {
      const section = await storage.getTrendsSection();
      res.json(section || { title: "რა არის ახლა ტრენდში", subtitle: "What's Trendy Now" });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trends section" });
    }
  });

  app.put("/api/admin/trends-section", requireAuth, async (req, res) => {
    try {
      const validatedData = insertTrendsSectionSchema.parse(req.body);
      const section = await storage.updateTrendsSection(validatedData);
      res.json(section);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to update trends section" });
      }
    }
  });

  // Object Storage Routes - Replaced Replit sidecar logic with standard local upload

  // Handle direct file uploads from admin
  app.post("/api/objects/upload", requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Return the URL path to access the file
      let objectPath = "";

      // Cloudinary returns the full absolute URL in req.file.path
      // Local multer returns the absolute disk path in req.file.path and just the filename in req.file.filename
      if (req.file.path && req.file.path.startsWith('http')) {
        objectPath = req.file.path;
      } else {
        const objectId = req.file.filename;
        objectPath = `/objects/uploads/${objectId}`;
      }

      console.log(`[Upload] File saved directly: ${objectPath}`);
      res.json({ uploadURL: objectPath, success: true });
    } catch (error) {
      console.error("Error processing local upload:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Serve uploaded images directly from local storage
  app.get("/objects/uploads/:objectId", (req, res) => {
    const objectId = req.params.objectId;
    const filePath = path.join(process.cwd(), uploadDir, objectId);

    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send("File not found");
    }
  });

  // Set ACL policy after image upload (for gallery images - Mocked for local disk)
  app.put("/api/admin/gallery-images/:id/image", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body;

      console.log(`[ACL Route] Setting ACL for gallery image ${id}, imageUrl:`, imageUrl);

      if (!imageUrl) {
        return res.status(400).json({ error: "imageUrl is required" });
      }

      // Update gallery image in database directly
      const galleryImage = await storage.updateGalleryImage(id, { imageUrl });
      console.log(`[ACL Route] Database updated, galleryImage:`, galleryImage);

      if (!galleryImage) {
        return res.status(404).json({ error: "Gallery image not found" });
      }

      res.json({ objectPath: imageUrl, galleryImage });
    } catch (error) {
      console.error("Error setting gallery image:", error);
      res.status(500).json({ error: "Failed to set gallery image" });
    }
  });

  // Set ACL policy after image upload (for hero background - Mocked for local disk)
  app.put("/api/admin/hero/background-image", requireAuth, async (req, res) => {
    try {
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ error: "imageUrl is required" });
      }

      // Update hero content in database directly
      const heroContent = await storage.getHeroContent();
      if (heroContent) {
        const updated = await storage.updateHeroContent({ backgroundImage: imageUrl });
        res.json({ objectPath: imageUrl, heroContent: updated });
      } else {
        res.status(404).json({ error: "Hero content not found" });
      }
    } catch (error) {
      console.error("Error setting hero background image:", error);
      res.status(500).json({ error: "Failed to set hero background image" });
    }
  });

  // Set ACL policy after image upload (for trend images - Mocked for local disk)
  app.put("/api/admin/trends/:id/image", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ error: "imageUrl is required" });
      }

      // Update trend in database directly
      const trend = await storage.updateTrend(id, { imageUrl });
      if (!trend) {
        return res.status(404).json({ error: "Trend not found" });
      }

      res.json({ objectPath: imageUrl, trend });
    } catch (error) {
      console.error("Error setting trend image:", error);
      res.status(500).json({ error: "Failed to set trend image" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
