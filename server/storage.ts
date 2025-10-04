import { 
  type User, type InsertUser, 
  type Booking, type InsertBooking,
  type HeroContent, type InsertHeroContent,
  type Service, type InsertService,
  type SiteSettings, type InsertSiteSettings
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByDate(date: string): Promise<Booking[]>;
  getAllBookings(): Promise<Booking[]>;
  
  getHeroContent(): Promise<HeroContent | undefined>;
  updateHeroContent(content: InsertHeroContent): Promise<HeroContent>;
  
  getAllServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;
  
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(settings: InsertSiteSettings): Promise<SiteSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private bookings: Map<string, Booking>;
  private heroContent: HeroContent | undefined;
  private services: Map<string, Service>;
  private siteSettings: SiteSettings | undefined;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.services = new Map();
    
    this.heroContent = {
      id: randomUUID(),
      mainTitle: "THE MR",
      subtitle: "Nail & Laser Studio",
      description: "Expert nail artistry and advanced laser treatments in an elegant, modern setting",
      tagline: "Where Beauty Meets Precision",
    };
    
    this.siteSettings = {
      id: randomUUID(),
      address: "123 Elegant Street, Tbilisi, Georgia",
      phone: "+995 555 123 456",
      email: "info@themrstudio.ge",
      hours: "Mon-Sat: 10:00 AM - 8:00 PM",
    };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = { 
      ...insertBooking, 
      id,
      notes: insertBooking.notes ?? null 
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getBookingsByDate(date: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.date === date,
    );
  }

  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getHeroContent(): Promise<HeroContent | undefined> {
    return this.heroContent;
  }

  async updateHeroContent(content: InsertHeroContent): Promise<HeroContent> {
    const id = this.heroContent?.id || randomUUID();
    this.heroContent = { ...content, id };
    return this.heroContent;
  }

  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values()).sort((a, b) => 
      a.order.localeCompare(b.order)
    );
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = randomUUID();
    const service: Service = { ...insertService, id };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: string, updates: Partial<InsertService>): Promise<Service | undefined> {
    const existing = this.services.get(id);
    if (!existing) return undefined;
    
    const updated: Service = { ...existing, ...updates };
    this.services.set(id, updated);
    return updated;
  }

  async deleteService(id: string): Promise<boolean> {
    return this.services.delete(id);
  }

  async getSiteSettings(): Promise<SiteSettings | undefined> {
    return this.siteSettings;
  }

  async updateSiteSettings(settings: InsertSiteSettings): Promise<SiteSettings> {
    const id = this.siteSettings?.id || randomUUID();
    this.siteSettings = { ...settings, id };
    return this.siteSettings;
  }
}

export const storage = new MemStorage();
