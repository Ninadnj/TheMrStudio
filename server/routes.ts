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
  insertTrendSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { chatWithGemini } from "./gemini-chat";
import { 
  loginHandler, 
  logoutHandler, 
  checkAuthHandler, 
  requireAuth 
} from "./auth";
import { createCalendarEvent } from "./google-calendar";
import { sendNewBookingNotification } from "./email-notifications";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";

export async function registerRoutes(app: Express): Promise<Server> {
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
      const { date } = req.query;
      
      if (!date || typeof date !== "string") {
        return res.status(400).json({ error: "Date parameter is required" });
      }

      const bookings = await storage.getBookingsByDate(date);
      
      // Calculate all blocked time slots based on booking duration
      const bookedTimesSet = new Set<string>();
      
      for (const booking of bookings) {
        try {
          const [hours, minutes] = booking.time.split(':').map(Number);
          const durationMinutes = parseInt(booking.duration);
          
          // Validate duration is a valid number
          if (isNaN(durationMinutes) || durationMinutes <= 0) {
            console.error(`Invalid duration for booking ${booking.id}: ${booking.duration}`);
            continue;
          }
          
          // Calculate which hourly slots this booking overlaps
          const startMinutes = hours * 60 + (minutes || 0);
          const endMinutes = startMinutes + durationMinutes;
          
          // Find first and last hour slots that this booking touches
          const startHour = Math.floor(startMinutes / 60);
          const endHour = Math.floor((endMinutes - 1) / 60);
          
          // Block all hours from start to end (inclusive)
          for (let hour = startHour; hour <= endHour; hour++) {
            const slotTime = `${hour.toString().padStart(2, '0')}:00`;
            bookedTimesSet.add(slotTime);
          }
        } catch (bookingError) {
          console.error(`Error processing booking ${booking.id}:`, bookingError);
          continue;
        }
      }
      
      // Also check Google Calendar for all staff members
      try {
        const staff = await storage.getAllStaff();
        const calendarIds = staff
          .filter(s => s.calendarId)
          .map(s => s.calendarId as string);
        
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
      const booking = await storage.approveBooking(id);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Create Google Calendar event when approved
      if (booking.staffId) {
        const staff = await storage.getStaffById(booking.staffId);
        
        if (staff?.calendarId) {
          try {
            const [year, month, day] = booking.date.split('-');
            const [hours, minutes] = booking.time.split(':');
            
            const offsetMinutes = 4 * 60;
            const startUtc = Date.UTC(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
              parseInt(hours),
              parseInt(minutes)
            ) - offsetMinutes * 60 * 1000;
            
            const durationMs = parseInt(booking.duration) * 60 * 1000;
            const endUtc = startUtc + durationMs;
            
            const startDateTime = new Date(startUtc).toISOString();
            const endDateTime = new Date(endUtc).toISOString();
            
            const summary = `${booking.service} - ${booking.fullName}`;
            const description = `
Booking Details:
Client: ${booking.fullName}
Phone: ${booking.phone}
Email: ${booking.email}
Service: ${booking.service}
Staff: ${booking.staffName}
Duration: ${booking.duration} minutes
${booking.notes ? `Notes: ${booking.notes}` : ''}
            `.trim();
            
            await createCalendarEvent(
              staff.calendarId,
              summary,
              description,
              startDateTime,
              endDateTime,
              booking.email
            );
            
            console.log(`Calendar event created for approved booking ${id}`);
          } catch (calendarError) {
            console.error('Failed to create calendar event:', calendarError);
          }
        }
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
      const validatedData = insertGalleryImageSchema.parse(req.body);
      const image = await storage.createGalleryImage(validatedData);
      res.status(201).json(image);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
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

  // Object Storage Routes - Reference: javascript_object_storage blueprint
  
  // Get upload URL for admin image uploads (protected)
  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Serve uploaded images with ACL check
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      console.error("Error serving object:", error);
      return res.sendStatus(500);
    }
  });

  // Set ACL policy after image upload (for gallery images)
  app.put("/api/admin/gallery-images/:id/image", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ error: "imageUrl is required" });
      }

      // Get admin user ID from session
      const userId = req.session.userId || "admin";

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        imageUrl,
        {
          owner: userId,
          visibility: "public", // Gallery images are publicly accessible
        }
      );

      // Update gallery image in database
      const galleryImage = await storage.updateGalleryImage(id, { imageUrl: objectPath });
      if (!galleryImage) {
        return res.status(404).json({ error: "Gallery image not found" });
      }

      res.json({ objectPath, galleryImage });
    } catch (error) {
      console.error("Error setting gallery image:", error);
      res.status(500).json({ error: "Failed to set gallery image" });
    }
  });

  // Set ACL policy after image upload (for hero background)
  app.put("/api/admin/hero/background-image", requireAuth, async (req, res) => {
    try {
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ error: "imageUrl is required" });
      }

      // Get admin user ID from session
      const userId = req.session.userId || "admin";

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        imageUrl,
        {
          owner: userId,
          visibility: "public", // Hero images are publicly accessible
        }
      );

      // Update hero content in database
      const heroContent = await storage.getHeroContent();
      if (heroContent) {
        const updated = await storage.updateHeroContent({ backgroundImage: objectPath });
        res.json({ objectPath, heroContent: updated });
      } else {
        res.status(404).json({ error: "Hero content not found" });
      }
    } catch (error) {
      console.error("Error setting hero background image:", error);
      res.status(500).json({ error: "Failed to set hero background image" });
    }
  });

  // Set ACL policy after image upload (for trend images)
  app.put("/api/admin/trends/:id/image", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ error: "imageUrl is required" });
      }

      // Get admin user ID from session
      const userId = req.session.userId || "admin";

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        imageUrl,
        {
          owner: userId,
          visibility: "public", // Trend images are publicly accessible
        }
      );

      // Update trend in database
      const trend = await storage.updateTrend(id, { imageUrl: objectPath });
      if (!trend) {
        return res.status(404).json({ error: "Trend not found" });
      }

      res.json({ objectPath, trend });
    } catch (error) {
      console.error("Error setting trend image:", error);
      res.status(500).json({ error: "Failed to set trend image" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
