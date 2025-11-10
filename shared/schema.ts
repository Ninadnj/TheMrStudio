import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const staff = pgTable("staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  serviceCategory: text("service_category").notNull(),
  calendarId: text("calendar_id"),
  order: text("order").notNull(),
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
});

export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staff.$inferSelect;

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  service: text("service").notNull(),
  staffId: varchar("staff_id"),
  staffName: text("staff_name"),
  date: date("date").notNull(),
  time: text("time").notNull(),
  duration: text("duration").notNull().default("90"),
  status: text("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  notes: text("notes"),
  calendarEventId: text("calendar_event_id"),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
  language: z.enum(["ka", "en"]).default("ka"),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const heroContent = pgTable("hero_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mainTitle: text("main_title").notNull(),
  subtitle: text("subtitle").notNull(),
  description: text("description").notNull(),
  tagline: text("tagline").notNull(),
  backgroundImage: text("background_image"),
});

export const insertHeroContentSchema = createInsertSchema(heroContent).omit({
  id: true,
});

export type InsertHeroContent = z.infer<typeof insertHeroContentSchema>;
export type HeroContent = typeof heroContent.$inferSelect;

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(),
  order: text("order").notNull(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  hours: text("hours").notNull(),
  adminEmail: text("admin_email"),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
});

export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;

export const galleryImages = pgTable("gallery_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  order: text("order").notNull(),
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
});

export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;
export type GalleryImage = typeof galleryImages.$inferSelect;

export const servicesSection = pgTable("services_section", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  categoryDescriptions: text("category_descriptions").notNull(),
});

export const insertServicesSectionSchema = createInsertSchema(servicesSection).omit({
  id: true,
});

export type InsertServicesSection = z.infer<typeof insertServicesSectionSchema>;
export type ServicesSection = typeof servicesSection.$inferSelect;

export const specialOffers = pgTable("special_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  message: text("message").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  expiryDate: date("expiry_date"),
  link: text("link"),
});

export const insertSpecialOfferSchema = createInsertSchema(specialOffers).omit({
  id: true,
});

export type InsertSpecialOffer = z.infer<typeof insertSpecialOfferSchema>;
export type SpecialOffer = typeof specialOffers.$inferSelect;

export const trends = pgTable("trends", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  order: text("order").notNull(),
});

export const insertTrendSchema = createInsertSchema(trends).omit({
  id: true,
});

export type InsertTrend = z.infer<typeof insertTrendSchema>;
export type Trend = typeof trends.$inferSelect;

export const trendsSection = pgTable("trends_section", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
});

export const insertTrendsSectionSchema = createInsertSchema(trendsSection).omit({
  id: true,
});

export type InsertTrendsSection = z.infer<typeof insertTrendsSectionSchema>;
export type TrendsSection = typeof trendsSection.$inferSelect;
