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
  insertGalleryImageSchema
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/admin/login", loginHandler);
  app.post("/api/admin/logout", logoutHandler);
  app.get("/api/admin/check", checkAuthHandler);
  // Create a new booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      
      // Create Google Calendar event if staff has calendar integration
      if (booking.staffId) {
        const staff = await storage.getStaffById(booking.staffId);
        
        if (staff?.calendarId) {
          try {
            // Parse booking date and time
            const [year, month, day] = booking.date.split('-');
            const [hours, minutes] = booking.time.split(':');
            
            // Convert Tbilisi local time to UTC instant
            // Tbilisi is UTC+4, so subtract 4 hours to get UTC
            const offsetMinutes = 4 * 60;
            const startUtc = Date.UTC(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
              parseInt(hours),
              parseInt(minutes)
            ) - offsetMinutes * 60 * 1000;
            
            // Add 2 hours for end time
            const endUtc = startUtc + 2 * 60 * 60 * 1000;
            
            // Convert to ISO strings - Google Calendar will display in Asia/Tbilisi timezone
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
            
            console.log(`Calendar event created for ${staff.name} (${staff.calendarId})`);
          } catch (calendarError) {
            console.error('Failed to create calendar event:', calendarError);
            // Don't fail the booking if calendar creation fails
          }
        }
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
      const bookedTimes = bookings.map((booking) => booking.time);
      
      res.json({ bookedTimes });
    } catch (error) {
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
      const service = await storage.updateService(id, req.body);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to update service" });
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
      const staffMember = await storage.updateStaff(id, req.body);
      if (!staffMember) {
        return res.status(404).json({ error: "Staff member not found" });
      }
      res.json(staffMember);
    } catch (error) {
      res.status(500).json({ error: "Failed to update staff member" });
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

  // Public services route
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
