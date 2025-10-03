import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, chatRequestSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { chatWithGemini } from "./gemini-chat";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);

  return httpServer;
}
