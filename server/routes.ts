import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBookingSchema, 
  chatRequestSchema,
  insertHeroContentSchema,
  insertServiceSchema,
  insertSiteSettingsSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { chatWithGemini } from "./gemini-chat";
import { 
  loginHandler, 
  logoutHandler, 
  checkAuthHandler, 
  requireAuth 
} from "./auth";

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
      res.status(201).json(booking);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
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

  const httpServer = createServer(app);

  return httpServer;
}
