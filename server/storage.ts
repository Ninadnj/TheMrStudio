import {
  type User, type InsertUser,
  type Booking, type InsertBooking,
  type HeroContent, type InsertHeroContent,
  type Service, type InsertService,
  type SiteSettings, type InsertSiteSettings,
  type Staff, type InsertStaff,
  type GalleryImage, type InsertGalleryImage,
  type ServicesSection, type InsertServicesSection,
  type SpecialOffer, type InsertSpecialOffer,
  type Trend, type InsertTrend,
  type TrendsSection, type InsertTrendsSection,
  users as usersTable,
  staff as staffTable,
  bookings as bookingsTable,
  heroContent as heroContentTable,
  services as servicesTable,
  siteSettings as siteSettingsTable,
  servicesSection as servicesSectionTable,
  specialOffers as specialOffersTable,
  galleryImages as galleryImagesTable,
  trends as trendsTable,
  trendsSection as trendsSectionTable
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByDate(date: string): Promise<Booking[]>;
  getAllBookings(): Promise<Booking[]>;
  getBookingById(id: string): Promise<Booking | undefined>;
  getPendingBookings(): Promise<Booking[]>;
  getConfirmedBookings(): Promise<Booking[]>;
  approveBooking(id: string, calendarEventId?: string): Promise<Booking | undefined>;
  rejectBooking(id: string, reason?: string): Promise<Booking | undefined>;
  modifyBooking(id: string, updates: { time?: string; duration?: string }): Promise<Booking | undefined>;
  deleteBooking(id: string): Promise<boolean>;

  getHeroContent(): Promise<HeroContent | undefined>;
  updateHeroContent(content: Partial<InsertHeroContent>): Promise<HeroContent>;

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

  getAllGalleryImages(): Promise<GalleryImage[]>;
  getGalleryImagesByCategory(category: string): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  updateGalleryImage(id: string, updates: Partial<InsertGalleryImage>): Partial<GalleryImage | undefined> | Promise<GalleryImage | undefined>;
  deleteGalleryImage(id: string): Promise<boolean>;

  getServicesSection(): Promise<ServicesSection | undefined>;
  updateServicesSection(content: InsertServicesSection): Promise<ServicesSection>;

  getAllSpecialOffers(): Promise<SpecialOffer[]>;
  getActiveSpecialOffer(): Promise<SpecialOffer | undefined>;
  createSpecialOffer(offer: InsertSpecialOffer): Promise<SpecialOffer>;
  updateSpecialOffer(id: string, updates: Partial<InsertSpecialOffer>): Promise<SpecialOffer | undefined>;
  deleteSpecialOffer(id: string): Promise<boolean>;

  getAllTrends(): Promise<Trend[]>;
  getTrendsByCategory(category: string): Promise<Trend[]>;
  createTrend(trend: InsertTrend): Promise<Trend>;
  updateTrend(id: string, updates: Partial<InsertTrend>): Promise<Trend | undefined>;
  deleteTrend(id: string): Promise<boolean>;

  getTrendsSection(): Promise<TrendsSection | undefined>;
  updateTrendsSection(content: InsertTrendsSection): Promise<TrendsSection>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(usersTable).values(insertUser).returning();
    return user;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookingsTable).values(insertBooking).returning();
    return booking;
  }

  async getBookingsByDate(date: string): Promise<Booking[]> {
    return await db.select().from(bookingsTable).where(eq(bookingsTable.date, date));
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookingsTable);
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
    return booking;
  }

  async getPendingBookings(): Promise<Booking[]> {
    return await db.select().from(bookingsTable).where(eq(bookingsTable.status, "pending"));
  }

  async getConfirmedBookings(): Promise<Booking[]> {
    return await db.select().from(bookingsTable).where(eq(bookingsTable.status, "confirmed"));
  }

  async approveBooking(id: string, calendarEventId?: string): Promise<Booking | undefined> {
    const updateData: any = { status: "confirmed", rejectionReason: null };
    if (calendarEventId) {
      updateData.calendarEventId = calendarEventId;
    }
    const [updated] = await db.update(bookingsTable)
      .set(updateData)
      .where(eq(bookingsTable.id, id))
      .returning();
    return updated;
  }

  async rejectBooking(id: string, reason?: string): Promise<Booking | undefined> {
    const [updated] = await db.update(bookingsTable)
      .set({ status: "rejected", rejectionReason: reason ?? null })
      .where(eq(bookingsTable.id, id))
      .returning();
    return updated;
  }

  async modifyBooking(id: string, updates: { time?: string; duration?: string }): Promise<Booking | undefined> {
    const updateData: Partial<Booking> = {};
    if (updates.time !== undefined) updateData.time = updates.time;
    if (updates.duration !== undefined) updateData.duration = updates.duration;

    const [updated] = await db.update(bookingsTable)
      .set(updateData)
      .where(eq(bookingsTable.id, id))
      .returning();
    return updated;
  }

  async deleteBooking(id: string): Promise<boolean> {
    const result = await db.delete(bookingsTable).where(eq(bookingsTable.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getHeroContent(): Promise<HeroContent | undefined> {
    const [heroContent] = await db.select().from(heroContentTable).limit(1);
    return heroContent;
  }

  async updateHeroContent(content: Partial<InsertHeroContent>): Promise<HeroContent> {
    const existing = await this.getHeroContent();
    if (existing) {
      const [updated] = await db.update(heroContentTable)
        .set(content)
        .where(eq(heroContentTable.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(heroContentTable).values(content as InsertHeroContent).returning();
      return created;
    }
  }

  async getAllServices(): Promise<Service[]> {
    const services = await db.select().from(servicesTable);
    return services.sort((a, b) => a.order.localeCompare(b.order));
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(servicesTable).values(insertService).returning();
    return service;
  }

  async updateService(id: string, updates: Partial<InsertService>): Promise<Service | undefined> {
    const [updated] = await db.update(servicesTable)
      .set(updates)
      .where(eq(servicesTable.id, id))
      .returning();
    return updated;
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await db.delete(servicesTable).where(eq(servicesTable.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const [settings] = await db.select().from(siteSettingsTable).limit(1);
    return settings;
  }

  async updateSiteSettings(settings: InsertSiteSettings): Promise<SiteSettings> {
    const existing = await this.getSiteSettings();
    if (existing) {
      const [updated] = await db.update(siteSettingsTable)
        .set(settings)
        .where(eq(siteSettingsTable.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(siteSettingsTable).values(settings).returning();
      return created;
    }
  }

  async getAllStaff(): Promise<Staff[]> {
    const staff = await db.select().from(staffTable);
    return staff.sort((a, b) => a.order.localeCompare(b.order));
  }

  async getStaffById(id: string): Promise<Staff | undefined> {
    const [staff] = await db.select().from(staffTable).where(eq(staffTable.id, id));
    return staff;
  }

  async getStaffByCategory(category: string): Promise<Staff[]> {
    const staff = await db.select().from(staffTable).where(eq(staffTable.serviceCategory, category));
    return staff.sort((a, b) => a.order.localeCompare(b.order));
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const [staff] = await db.insert(staffTable).values(insertStaff).returning();
    return staff;
  }

  async updateStaff(id: string, updates: Partial<InsertStaff>): Promise<Staff | undefined> {
    const [updated] = await db.update(staffTable)
      .set(updates)
      .where(eq(staffTable.id, id))
      .returning();
    return updated;
  }

  async deleteStaff(id: string): Promise<boolean> {
    const result = await db.delete(staffTable).where(eq(staffTable.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAllGalleryImages(): Promise<GalleryImage[]> {
    const images = await db.select().from(galleryImagesTable);
    return images.sort((a, b) => a.order.localeCompare(b.order));
  }

  async getGalleryImagesByCategory(category: string): Promise<GalleryImage[]> {
    const images = await db.select().from(galleryImagesTable).where(eq(galleryImagesTable.category, category));
    return images.sort((a, b) => a.order.localeCompare(b.order));
  }

  async createGalleryImage(insertImage: InsertGalleryImage): Promise<GalleryImage> {
    const [image] = await db.insert(galleryImagesTable).values(insertImage).returning();
    return image;
  }

  async updateGalleryImage(id: string, updates: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined> {
    const [updated] = await db.update(galleryImagesTable)
      .set(updates)
      .where(eq(galleryImagesTable.id, id))
      .returning();
    return updated;
  }

  async deleteGalleryImage(id: string): Promise<boolean> {
    const result = await db.delete(galleryImagesTable).where(eq(galleryImagesTable.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getServicesSection(): Promise<ServicesSection | undefined> {
    const [section] = await db.select().from(servicesSectionTable).limit(1);
    return section;
  }

  async updateServicesSection(content: InsertServicesSection): Promise<ServicesSection> {
    const existing = await this.getServicesSection();
    if (existing) {
      const [updated] = await db.update(servicesSectionTable)
        .set(content)
        .where(eq(servicesSectionTable.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(servicesSectionTable).values(content).returning();
      return created;
    }
  }

  async getAllSpecialOffers(): Promise<SpecialOffer[]> {
    return await db.select().from(specialOffersTable);
  }

  async getActiveSpecialOffer(): Promise<SpecialOffer | undefined> {
    const now = new Date();
    const offers = await db.select().from(specialOffersTable).where(eq(specialOffersTable.isActive, true));
    return offers.find(offer => {
      if (offer.expiryDate) {
        const expiryDate = new Date(offer.expiryDate);
        return expiryDate >= now;
      }
      return true;
    });
  }

  async createSpecialOffer(insertOffer: InsertSpecialOffer): Promise<SpecialOffer> {
    const [offer] = await db.insert(specialOffersTable).values(insertOffer).returning();
    return offer;
  }

  async updateSpecialOffer(id: string, updates: Partial<InsertSpecialOffer>): Promise<SpecialOffer | undefined> {
    const [updated] = await db.update(specialOffersTable)
      .set(updates)
      .where(eq(specialOffersTable.id, id))
      .returning();
    return updated;
  }

  async deleteSpecialOffer(id: string): Promise<boolean> {
    const result = await db.delete(specialOffersTable).where(eq(specialOffersTable.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAllTrends(): Promise<Trend[]> {
    const trends = await db.select().from(trendsTable);
    return trends.sort((a, b) => a.order.localeCompare(b.order));
  }

  async getTrendsByCategory(category: string): Promise<Trend[]> {
    const trends = await db.select().from(trendsTable).where(eq(trendsTable.category, category));
    return trends.sort((a, b) => a.order.localeCompare(b.order));
  }

  async createTrend(insertTrend: InsertTrend): Promise<Trend> {
    const [trend] = await db.insert(trendsTable).values(insertTrend).returning();
    return trend;
  }

  async updateTrend(id: string, updates: Partial<InsertTrend>): Promise<Trend | undefined> {
    const [updated] = await db.update(trendsTable)
      .set(updates)
      .where(eq(trendsTable.id, id))
      .returning();
    return updated;
  }

  async deleteTrend(id: string): Promise<boolean> {
    const result = await db.delete(trendsTable).where(eq(trendsTable.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getTrendsSection(): Promise<TrendsSection | undefined> {
    const [section] = await db.select().from(trendsSectionTable).limit(1);
    return section;
  }

  async updateTrendsSection(content: InsertTrendsSection): Promise<TrendsSection> {
    const existing = await this.getTrendsSection();
    if (existing) {
      const [updated] = await db.update(trendsSectionTable)
        .set(content)
        .where(eq(trendsSectionTable.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(trendsSectionTable).values(content).returning();
      return created;
    }
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private services: Map<string, Service> = new Map();
  private staff: Map<string, Staff> = new Map();
  private galleryImages: Map<string, GalleryImage> = new Map();
  private trends: Map<string, Trend> = new Map();
  private specialOffers: Map<string, SpecialOffer> = new Map();
  private heroContent: HeroContent | undefined;
  private siteSettings: SiteSettings | undefined;
  private servicesSection: ServicesSection | undefined;
  private trendsSection: TrendsSection | undefined;

  constructor() {
    this.seed();
  }

  private seed() {
    this.heroContent = {
      id: "1",
      mainTitle: "THE MR",
      subtitle: "Nail & Laser Studio",
      description: "Expert nail artistry and advanced laser treatments in an elegant, modern setting",
      tagline: "Where Beauty Meets Precision",
      backgroundImage: null,
    };

    this.siteSettings = {
      id: "1",
      address: "თბილისი, დიდი დიღომი, ასმათის ქუჩა",
      phone: "+995 599 999 999",
      email: "info@themrstudio.ge",
      hours: "Mon-Sat: 10:00 AM - 8:00 PM",
      adminEmail: null,
    };

    const staffData: InsertStaff[] = [
      { name: "მარიამი", serviceCategory: "Nail", calendarId: "1", order: "1" },
      { name: "რიტა", serviceCategory: "Nail", calendarId: "2", order: "2" },
      { name: "სალომე", serviceCategory: "Epilation", calendarId: "3", order: "3" },
    ];
    staffData.forEach((s, i) => {
      const id = (i + 1).toString();
      this.staff.set(id, { ...s, id, calendarId: s.calendarId ?? null });
    });

    const servicesData: { category: string, name: string, price: string, order: string }[] = [
      // Manicure & Pedicure
      { category: "მანიკური / პედიკური", name: "გელ-ლაქი ნუნების მოწესრიგებით", price: "35 ₾", order: "A01" },
      { category: "მანიკური / პედიკური", name: "გელ-ლაქი ნუნების აწევით", price: "25 ₾", order: "A02" },
      { category: "მანიკური / პედიკური", name: "გამაგრება", price: "45 ₾", order: "A03" },
      { category: "მანიკური / პედიკური", name: "გამაგრების მოხსნა + გამაგრება", price: "55 ₾", order: "A04" },
      { category: "მანიკური / პედიკური", name: "დაგრძელება", price: "80 ₾", order: "A05" },
      { category: "მანიკური / პედიკური", name: "დაგრძელების კორექცია", price: "70 ₾", order: "A06" },
      { category: "მანიკური / პედიკური", name: "გელ-ლაქის მოხსნა", price: "5 ₾", order: "A07" },
      { category: "მანიკური / პედიკური", name: "გამაგრების მოხსნა", price: "10 ₾", order: "A08" },
      { category: "მანიკური / პედიკური", name: "პედიკური კლასიკური", price: "40 ₾", order: "A09" },
      { category: "მანიკური / პედიკური", name: "პედიკური გელ-ლაქით", price: "55 ₾", order: "A10" },
      { category: "მანიკური / პედიკური", name: "ფრენჩი", price: "+5 ₾", order: "A11" },
      { category: "მანიკური / პედიკური", name: "ქრომი", price: "10 ₾", order: "A12" },

      // Laser Epilation - Women
      { category: "ლაზერული ეპილაცია - ქალი", name: "მთლიანი სახე", price: "25 ₾", order: "B01" },
      { category: "ლაზერული ეპილაცია - ქალი", name: "იღლიები", price: "10 ₾", order: "B02" },
      { category: "ლაზერული ეპილაცია - ქალი", name: "ხელები მთლიანად", price: "25 ₾", order: "B03" },
      { category: "ლაზერული ეპილაცია - ქალი", name: "ფეხები მთლიანად", price: "40 ₾", order: "B04" },
      { category: "ლაზერული ეპილაცია - ქალი", name: "ღრმა ბიკინი", price: "25 ₾", order: "B05" },
      { category: "ლაზერული ეპილაცია - ქალი", name: "მუცელი", price: "15 ₾", order: "B06" },
      { category: "ლაზერული ეპილაცია - ქალი", name: "ზურგი მთლიანად", price: "25 ₾", order: "B07" },

      // Laser Epilation - Men
      { category: "ლაზერული ეპილაცია - კაცი", name: "სახე", price: "30 ₾", order: "C01" },
      { category: "ლაზერული ეპილაცია - კაცი", name: "იღლიები", price: "15 ₾", order: "C02" },
      { category: "ლაზერული ეპილაცია - კაცი", name: "გულ-მკერდი", price: "30 ₾", order: "C03" },
      { category: "ლაზერული ეპილაცია - კაცი", name: "ზურგი მთლიანად", price: "50 ₾", order: "C04" },
      { category: "ლაზერული ეპილაცია - კაცი", name: "ფეხები მთლიანად", price: "60 ₾", order: "C05" },

      // Economy Packages
      { category: "ეკონომ პაკეტები", name: "მთლიანი სხეული", price: "75 ₾", order: "D01" },
      { category: "ეკონომ პაკეტები", name: "მთლიანი სხეული + სახე", price: "85 ₾", order: "D02" },
      { category: "ეკონომ პაკეტები", name: "4 ზონა (ხელი, ფეხი, ბიკინი, იღლია)", price: "55 ₾", order: "D03" },

      // Cosmetology
      { category: "კოსმეტოლოგია", name: "ფილერი Juvederm", price: "500 ₾", order: "E01" },
      { category: "კოსმეტოლოგია", name: "ფილერი ReMedium / Replengen", price: "250 ₾", order: "E02" },
      { category: "კოსმეტოლოგია", name: "ბოტოქსი (NABOTA / Botox)", price: "250 ₾", order: "E03" },
      { category: "კოსმეტოლოგია", name: "ბუსტერი Karisma", price: "500 ₾", order: "E04" },
    ];

    servicesData.forEach((s, i) => {
      const id = `s${i}`;
      this.services.set(id, {
        id,
        category: s.category,
        name: s.name,
        description: s.category,
        price: s.price,
        order: s.order
      });
    });

    this.servicesSection = {
      id: "1",
      title: "ჩვენი სერვისები",
      subtitle: "Professional Services",
      categoryDescriptions: JSON.stringify({
        "მანიკური / პედიკური": "პროფესიონალური ფრჩხილების მოვლა პრემიუმ გელ-ლაქებითა და თანამედროვე ტექნიკებით. ჩვენი მანიკური და პედიკური მოიცავს ფრჩხილების გამაგრებას, დაგრძელებას და მხატვრულ დიზაინებს. / Professional nail care using premium gel polishes and advanced techniques. Our manicure and pedicure services include nail strengthening, extensions, and artistic designs.",
        "ლაზერული ეპილაცია - ქალი": "განვითარებული ლაზერული ეპილაციის ტექნოლოგია უსაფრთხო და ეფექტური პროცედურებით ქალბატონებისთვის. / Advanced laser hair removal technology with safe and effective treatments for women.",
        "ლაზერული ეპილაცია - კაცი": "განვითარებული ლაზერული ეპილაციის ტექნოლოგია უსაფრთხო და ეფექტური პროცედურებით მამაკაცებისთვის. / Advanced laser hair removal technology with safe and effective treatments for men.",
        "ეკონომ პაკეტები": "სპეციალური ფასები და ეკონომიური შეთავაზებები კომპლექსურ ზონებზე. / Special prices and economy offers for combined treatment zones.",
        "კოსმეტოლოგია": "პროფესიონალური კანის მოვლა და სილამაზის პროცედურები თანამედროვე ტექნიკებითა და მაღალი ხარისხის პროდუქტებით. / Professional skincare and beauty treatments using modern techniques and high-quality products."
      })
    };
  }

  async getUser(id: string) { return this.users.get(id); }
  async getUserByUsername(username: string) { return Array.from(this.users.values()).find(u => u.username === username); }
  async createUser(u: InsertUser) {
    const id = Math.random().toString(36).substr(2, 9);
    const user = { ...u, id };
    this.users.set(id, user);
    return user;
  }
  async createBooking(b: InsertBooking) {
    const id = Math.random().toString(36).substr(2, 9);
    const booking: Booking = {
      ...b,
      id,
      duration: b.duration ?? "90",
      status: b.status ?? "pending",
      staffId: b.staffId ?? null,
      staffName: b.staffName ?? null,
      notes: b.notes ?? null,
      calendarEventId: null,
      rejectionReason: null
    };
    this.bookings.set(id, booking);
    return booking;
  }
  async getBookingsByDate(date: string) { return Array.from(this.bookings.values()).filter(b => b.date === date); }
  async getAllBookings() { return Array.from(this.bookings.values()); }
  async getBookingById(id: string) { return this.bookings.get(id); }
  async getPendingBookings() { return Array.from(this.bookings.values()).filter(b => b.status === "pending"); }
  async getConfirmedBookings() { return Array.from(this.bookings.values()).filter(b => b.status === "confirmed"); }
  async approveBooking(id: string, calendarEventId?: string) {
    const b = this.bookings.get(id);
    if (!b) return undefined;
    b.status = "confirmed";
    if (calendarEventId) b.calendarEventId = calendarEventId;
    return b;
  }
  async rejectBooking(id: string, reason?: string) {
    const b = this.bookings.get(id);
    if (!b) return undefined;
    b.status = "rejected";
    b.rejectionReason = reason ?? null;
    return b;
  }
  async modifyBooking(id: string, updates: { time?: string; duration?: string }) {
    const b = this.bookings.get(id);
    if (!b) return undefined;
    if (updates.time) b.time = updates.time;
    if (updates.duration) b.duration = updates.duration;
    return b;
  }
  async deleteBooking(id: string) { return this.bookings.delete(id); }
  async getHeroContent() { return this.heroContent; }
  async updateHeroContent(c: Partial<InsertHeroContent>) {
    this.heroContent = { ...this.heroContent, ...c } as HeroContent;
    return this.heroContent;
  }
  async getAllServices() { return Array.from(this.services.values()).sort((a, b) => a.order.localeCompare(b.order)); }
  async createService(s: InsertService) {
    const id = Math.random().toString(36).substr(2, 9);
    const service = { ...s, id };
    this.services.set(id, service);
    return service;
  }
  async updateService(id: string, s: Partial<InsertService>) {
    const existing = this.services.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...s };
    this.services.set(id, updated);
    return updated;
  }
  async deleteService(id: string) { return this.services.delete(id); }
  async getSiteSettings() { return this.siteSettings; }
  async updateSiteSettings(s: InsertSiteSettings) {
    this.siteSettings = { ...this.siteSettings, ...s } as SiteSettings;
    return this.siteSettings;
  }
  async getAllStaff() { return Array.from(this.staff.values()).sort((a, b) => a.order.localeCompare(b.order)); }
  async getStaffById(id: string) { return this.staff.get(id); }
  async getStaffByCategory(c: string) { return Array.from(this.staff.values()).filter(s => s.serviceCategory === c).sort((a, b) => a.order.localeCompare(b.order)); }
  async createStaff(s: InsertStaff) {
    const id = Math.random().toString(36).substr(2, 9);
    const staff = { ...s, id, calendarId: s.calendarId ?? null };
    this.staff.set(id, staff as Staff);
    return staff as Staff;
  }
  async updateStaff(id: string, s: Partial<InsertStaff>) {
    const existing = this.staff.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...s, calendarId: s.calendarId ?? existing.calendarId ?? null };
    this.staff.set(id, updated as Staff);
    return updated as Staff;
  }
  async deleteStaff(id: string) { return this.staff.delete(id); }
  async getAllGalleryImages() { return Array.from(this.galleryImages.values()).sort((a, b) => a.order.localeCompare(b.order)); }
  async getGalleryImagesByCategory(c: string) { return Array.from(this.galleryImages.values()).filter(i => i.category === c).sort((a, b) => a.order.localeCompare(b.order)); }
  async createGalleryImage(i: InsertGalleryImage) {
    const id = Math.random().toString(36).substr(2, 9);
    const image = { ...i, id };
    this.galleryImages.set(id, image);
    return image;
  }
  async updateGalleryImage(id: string, i: Partial<InsertGalleryImage>) {
    const existing = this.galleryImages.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...i };
    this.galleryImages.set(id, updated);
    return updated;
  }
  async deleteGalleryImage(id: string) { return this.galleryImages.delete(id); }
  async getServicesSection() { return this.servicesSection; }
  async updateServicesSection(s: InsertServicesSection) {
    this.servicesSection = { ...this.servicesSection, ...s } as ServicesSection;
    return this.servicesSection;
  }
  async getAllSpecialOffers() { return Array.from(this.specialOffers.values()); }
  async getActiveSpecialOffer() { return Array.from(this.specialOffers.values()).find(o => o.isActive); }
  async createSpecialOffer(o: InsertSpecialOffer) {
    const id = Math.random().toString(36).substr(2, 9);
    const offer = { ...o, id, isActive: o.isActive ?? true };
    this.specialOffers.set(id, offer as SpecialOffer);
    return offer as SpecialOffer;
  }
  async updateSpecialOffer(id: string, o: Partial<InsertSpecialOffer>) {
    const existing = this.specialOffers.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...o };
    this.specialOffers.set(id, updated as SpecialOffer);
    return updated as SpecialOffer;
  }
  async deleteSpecialOffer(id: string) { return this.specialOffers.delete(id); }
  async getAllTrends() { return Array.from(this.trends.values()).sort((a, b) => a.order.localeCompare(b.order)); }
  async getTrendsByCategory(c: string) { return Array.from(this.trends.values()).filter(t => t.category === c).sort((a, b) => a.order.localeCompare(b.order)); }
  async createTrend(t: InsertTrend) {
    const id = Math.random().toString(36).substr(2, 9);
    const trend = { ...t, id };
    this.trends.set(id, trend);
    return trend;
  }
  async updateTrend(id: string, t: Partial<InsertTrend>) {
    const existing = this.trends.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...t };
    this.trends.set(id, updated);
    return updated;
  }
  async deleteTrend(id: string) { return this.trends.delete(id); }
  async getTrendsSection() { return this.trendsSection; }
  async updateTrendsSection(t: InsertTrendsSection) {
    this.trendsSection = { ...this.trendsSection, ...t } as TrendsSection;
    return this.trendsSection;
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
