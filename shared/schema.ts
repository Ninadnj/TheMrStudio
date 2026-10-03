import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, boolean, integer } from "drizzle-orm/pg-core";
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

export const insertBookingSchema = createInsertSchema(bookings, {
  duration: z.string().default("90"),
  status: z.string().default("pending"),
}).omit({
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

/* ---------- Price menu (edited by the owner in the admin) ---------- */

/** The four bookable services. Each treatment says which one it belongs to (and so which specialists do it). */
export const BOOKING_CATEGORIES = ["Manicure", "Pedicure", "Epilation", "Cosmetology"] as const;

export const priceGroups = pgTable("price_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titleKa: text("title_ka").notNull(),
  titleEn: text("title_en").notNull(),
  /** Short label for the price-list filter and the booking list, e.g. "ლაზერი · ქალი". */
  shortKa: text("short_ka").notNull(),
  shortEn: text("short_en").notNull(),
  position: integer("position").notNull().default(0),
});

const requiredText = (label: string) => z.string().trim().min(1, label);

export const insertPriceGroupSchema = createInsertSchema(priceGroups, {
  titleKa: requiredText("ჩაწერეთ სათაური ქართულად"),
  titleEn: requiredText("ჩაწერეთ სათაური ინგლისურად"),
  shortKa: requiredText("ჩაწერეთ მოკლე სახელი ქართულად"),
  shortEn: requiredText("ჩაწერეთ მოკლე სახელი ინგლისურად"),
  position: z.number().int().min(0).optional(),
}).omit({ id: true });

export type InsertPriceGroup = z.infer<typeof insertPriceGroupSchema>;
export type PriceGroup = typeof priceGroups.$inferSelect;

export const priceItems = pgTable("price_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull(),
  nameKa: text("name_ka").notNull(),
  nameEn: text("name_en").notNull(),
  price: integer("price").notNull(),
  /** Optional; shown next to the price when set. */
  durationMin: integer("duration_min"),
  booking: text("booking").notNull(),
  position: integer("position").notNull().default(0),
});

export const insertPriceItemSchema = createInsertSchema(priceItems, {
  groupId: requiredText("აირჩიეთ ჯგუფი"),
  nameKa: requiredText("ჩაწერეთ სახელი ქართულად"),
  nameEn: requiredText("ჩაწერეთ სახელი ინგლისურად"),
  price: z.number({ invalid_type_error: "ჩაწერეთ ფასი" }).int("ფასი მთელი რიცხვი უნდა იყოს").min(0, "ფასი არ შეიძლება იყოს უარყოფითი"),
  durationMin: z.number().int().positive().nullable().optional(),
  booking: z.enum(BOOKING_CATEGORIES, { errorMap: () => ({ message: "აირჩიეთ სერვისი" }) }),
  position: z.number().int().min(0).optional(),
}).omit({ id: true });

export type InsertPriceItem = z.infer<typeof insertPriceItemSchema>;
export type PriceItem = typeof priceItems.$inferSelect;
export type PriceMenuGroup = PriceGroup & { items: PriceItem[] };

/* ---------- Studio info shown on the site (edited by the owner) ---------- */

export const studioInfo = pgTable("studio_info", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  addressKa: text("address_ka").notNull(),
  addressEn: text("address_en").notNull(),
  /** What Google Maps searches for to place the pin. */
  mapQuery: text("map_query").notNull(),
  hoursKa: text("hours_ka").notNull().default(""),
  hoursEn: text("hours_en").notNull().default(""),
  instagram: text("instagram").notNull().default(""),
  facebook: text("facebook").notNull().default(""),
});

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\//.test(v), "ბმული უნდა იწყებოდეს https://-ით");

export const insertStudioInfoSchema = createInsertSchema(studioInfo, {
  phone: requiredText("ჩაწერეთ ტელეფონი"),
  email: z.string().trim().email("შეამოწმეთ ელ. ფოსტა"),
  addressKa: requiredText("ჩაწერეთ მისამართი ქართულად"),
  addressEn: requiredText("ჩაწერეთ მისამართი ინგლისურად"),
  mapQuery: requiredText("ჩაწერეთ რუკის მისამართი"),
  hoursKa: z.string().trim(),
  hoursEn: z.string().trim(),
  instagram: optionalUrl,
  facebook: optionalUrl,
}).omit({ id: true });

export type InsertStudioInfo = z.infer<typeof insertStudioInfoSchema>;
export type StudioInfo = typeof studioInfo.$inferSelect;
