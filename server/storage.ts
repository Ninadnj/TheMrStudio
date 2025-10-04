import { 
  type User, type InsertUser, 
  type Booking, type InsertBooking,
  type HeroContent, type InsertHeroContent,
  type Service, type InsertService,
  type SiteSettings, type InsertSiteSettings,
  type Staff, type InsertStaff
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
  
  getAllStaff(): Promise<Staff[]>;
  getStaffById(id: string): Promise<Staff | undefined>;
  getStaffByCategory(category: string): Promise<Staff[]>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: string, staff: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaff(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private bookings: Map<string, Booking>;
  private heroContent: HeroContent | undefined;
  private services: Map<string, Service>;
  private siteSettings: SiteSettings | undefined;
  private staff: Map<string, Staff>;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.services = new Map();
    this.staff = new Map();
    
    this.heroContent = {
      id: randomUUID(),
      mainTitle: "THE MR",
      subtitle: "Nail & Laser Studio",
      description: "Expert nail artistry and advanced laser treatments in an elegant, modern setting",
      tagline: "Where Beauty Meets Precision",
    };
    
    this.siteSettings = {
      id: randomUUID(),
      address: "თბილისი, დიდი დიღომი, ასმათის ქუჩა",
      phone: "+995 599 999 999",
      email: "info@themrstudio.ge",
      hours: "Mon-Sat: 10:00 AM - 8:00 PM",
    };
    
    const staff1 = {
      id: randomUUID(),
      name: "Mari",
      serviceCategory: "Nail",
      calendarId: null,
      order: "1"
    };
    const staff2 = {
      id: randomUUID(),
      name: "User 1",
      serviceCategory: "Nail",
      calendarId: null,
      order: "2"
    };
    const staff3 = {
      id: randomUUID(),
      name: "User 2",
      serviceCategory: "Cosmetology",
      calendarId: null,
      order: "3"
    };
    const staff4 = {
      id: randomUUID(),
      name: "User 3",
      serviceCategory: "Epilation",
      calendarId: null,
      order: "4"
    };
    
    this.staff.set(staff1.id, staff1);
    this.staff.set(staff2.id, staff2);
    this.staff.set(staff3.id, staff3);
    this.staff.set(staff4.id, staff4);
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
      notes: insertBooking.notes ?? null,
      staffId: insertBooking.staffId ?? null,
      staffName: insertBooking.staffName ?? null
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

  async getAllStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values()).sort((a, b) => 
      a.order.localeCompare(b.order)
    );
  }

  async getStaffById(id: string): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async getStaffByCategory(category: string): Promise<Staff[]> {
    return Array.from(this.staff.values())
      .filter(s => s.serviceCategory === category)
      .sort((a, b) => a.order.localeCompare(b.order));
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = randomUUID();
    const staffMember: Staff = { 
      ...insertStaff, 
      id,
      calendarId: insertStaff.calendarId ?? null 
    };
    this.staff.set(id, staffMember);
    return staffMember;
  }

  async updateStaff(id: string, updates: Partial<InsertStaff>): Promise<Staff | undefined> {
    const existing = this.staff.get(id);
    if (!existing) return undefined;
    
    const updated: Staff = { ...existing, ...updates };
    this.staff.set(id, updated);
    return updated;
  }

  async deleteStaff(id: string): Promise<boolean> {
    return this.staff.delete(id);
  }
}

export const storage = new MemStorage();
