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
  users as usersTable,
  staff as staffTable,
  bookings as bookingsTable,
  heroContent as heroContentTable,
  services as servicesTable,
  siteSettings as siteSettingsTable,
  servicesSection as servicesSectionTable,
  specialOffers as specialOffersTable,
  galleryImages as galleryImagesTable,
  trends as trendsTable
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

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
  approveBooking(id: string): Promise<Booking | undefined>;
  rejectBooking(id: string, reason?: string): Promise<Booking | undefined>;
  modifyBooking(id: string, updates: { time?: string; duration?: string }): Promise<Booking | undefined>;
  
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
  updateGalleryImage(id: string, updates: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined>;
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
}

export class MemStorage implements IStorage {
  constructor() {
    this.seedDatabase();
  }

  private async seedDatabase() {
    try {
      const existingHero = await db.select().from(heroContentTable).limit(1);
      if (existingHero.length > 0) {
        return;
      }

      await db.insert(heroContentTable).values({
        mainTitle: "THE MR",
        subtitle: "Nail & Laser Studio",
        description: "Expert nail artistry and advanced laser treatments in an elegant, modern setting",
        tagline: "Where Beauty Meets Precision",
      });

      await db.insert(siteSettingsTable).values({
        address: "თბილისი, დიდი დიღომი, ასმათის ქუჩა",
        phone: "+995 599 999 999",
        email: "info@themrstudio.ge",
        hours: "Mon-Sat: 10:00 AM - 8:00 PM",
        adminEmail: null,
      });

      await db.insert(staffTable).values([
        {
          name: "მარიამი",
          serviceCategory: "Nail",
          calendarId: "5a628b97225c40af603e9c5080f8fc88f8a7fcadbd61c7df1657af6cf7e20311@group.calendar.google.com",
          order: "1"
        },
        {
          name: "რიტა",
          serviceCategory: "Nail",
          calendarId: "be60a59a51dee66edc5846a870e1aa11bd454898854ea78763b704e1e2754b83@group.calendar.google.com",
          order: "2"
        },
        {
          name: "სალომე",
          serviceCategory: "Epilation",
          calendarId: "d9df0557df5863cbcd507d62463b61fd15d746bf42d71f1fc66e191d04af0130@group.calendar.google.com",
          order: "3"
        },
        {
          name: "ComingSoon",
          serviceCategory: "Cosmetology",
          calendarId: "7b14cf445638512bbfc3cbcbd7eb457be404170b14f605d3646380a4a8b2e033@group.calendar.google.com",
          order: "4"
        }
      ]);
    
    // Initialize services with real pricing
    const epilationServices = [
      { name: "მთლიანი სახე / Full Face", price: "20 ₾", order: "01" },
      { name: "მთლიანი სახე+ყელი / Full Face+Neck", price: "25 ₾", order: "02" },
      { name: "შუბლი / Forehead", price: "10 ₾", order: "03" },
      { name: "ნიკაპი / Chin", price: "5 ₾", order: "04" },
      { name: "ღაბაბი / Under Chin", price: "5 ₾", order: "05" },
      { name: "ნიკაპი+ღაბაბი / Chin+Under Chin", price: "8 ₾", order: "06" },
      { name: "ზედა ტუჩი / Upper Lip", price: "5 ₾", order: "07" },
      { name: "ბაკები / Sideburns", price: "10 ₾", order: "08" },
      { name: "ლოყები / Cheeks", price: "10 ₾", order: "09" },
      { name: "წარბის გადაბმის ზონა / Eyebrow Adhesion", price: "5 ₾", order: "10" },
      { name: "ცხვირის ნესტო + ყურები / Nose+Ears", price: "10 ₾", order: "11" },
      { name: "კისერი (უკნიდან) / Neck (back)", price: "10 ₾", order: "12" },
      { name: "ყელი / Neck (front)", price: "10 ₾", order: "13" },
      { name: "კეფა / Between Head and Neck", price: "10 ₾", order: "14" },
      { name: "გულ-მკერდი / Chest", price: "20 ₾", order: "15" },
      { name: "დვრილები / Breastfeeding part", price: "5 ₾", order: "16" },
      { name: "მკერდის შუა ხაზი / Middle Line of Breast", price: "10 ₾", order: "17" },
      { name: "მუცელი / Abdomen", price: "18 ₾", order: "18" },
      { name: "მუცლის თეთრი ხაზი / Abdomen Line", price: "8 ₾", order: "19" },
      { name: "ზედაპირული ბიკინი / Bikini", price: "10 ₾", order: "20" },
      { name: "ღრმა ბიკინი / Full Bikini", price: "25 ₾", order: "21" },
      { name: "დუნდულები / Buttocks", price: "15 ₾", order: "22" },
      { name: "უკანა ტანი (ანუსი) / Anus", price: "5 ₾", order: "23" },
      { name: "მთლიანი ფეხები / Full Legs", price: "30 ₾", order: "24" },
      { name: "ზურგი / Full Back", price: "25 ₾", order: "25" },
      { name: "წელი / Lower Back", price: "18 ₾", order: "26" },
      { name: "ხელები სრულად / Full Hands", price: "25 ₾", order: "27" },
      { name: "ნახევარი ხელი / Half Hand", price: "15 ₾", order: "28" },
      { name: "იღლიები / Armpit", price: "10 ₾", order: "29" },
      { name: "ხელის მტევნები+თითები / Hands+Fingers", price: "8 ₾", order: "30" },
      { name: "მთლიანი სხეული / Full Body", price: "75 ₾", order: "31" },
    ];
    
    const epilationMenServices = [
      { name: "მთლიანი ზურგი (კაცები) / Full Back (Men)", price: "50 ₾", order: "40" },
      { name: "კისერი (კაცები) / Neck (Men)", price: "15 ₾", order: "41" },
      { name: "ყელი (კაცები) / Throat (Men)", price: "12 ₾", order: "42" },
      { name: "ღაწვი (კაცები) / Jaw (Men)", price: "15 ₾", order: "43" },
      { name: "ხელი + იღლია (კაცები) / Hand+Armpit (Men)", price: "40 ₾", order: "44" },
      { name: "გულ-მკერდი (კაცები) / Chest (Men)", price: "30 ₾", order: "45" },
      { name: "ბეჭები (კაცები) / Calves (Men)", price: "30 ₾", order: "46" },
      { name: "მხრები (კაცები) / Shoulders (Men)", price: "20 ₾", order: "47" },
      { name: "მუცელი (კაცები) / Abdomen (Men)", price: "30 ₾", order: "48" },
      { name: "წელი (კაცები) / Waist (Men)", price: "30 ₾", order: "49" },
      { name: "ფეხები (კაცები) / Legs (Men)", price: "50 ₾", order: "50" },
      { name: "სახე (კაცები) / Face (Men)", price: "30 ₾", order: "51" },
      { name: "შუბლი (კაცები) / Forehead (Men)", price: "15 ₾", order: "52" },
      { name: "წარბებს შორის (კაცები) / Between Eyebrows (Men)", price: "5 ₾", order: "53" },
    ];
    
    const manicureServices = [
      { name: "გელ-ლაქი ნუნების მოწესრიგებით / Gel Polish with Nail Trim", price: "35 ₾", order: "60" },
      { name: "გელ ლაქი ნუნების აწევით / Gel Polish with Nail Lift", price: "25 ₾", order: "61" },
      { name: "გამაგრება / Strengthening", price: "45 ₾", order: "62" },
      { name: "გამაგრების მოხსნა, გამაგრება / Removal+Strengthening", price: "55 ₾", order: "63" },
      { name: "დაგრძელება / Extension", price: "80 ₾", order: "64" },
      { name: "დაგრძელების კორექცია / Extension Correction", price: "70 ₾", order: "65" },
      { name: "გელ-ლაქის მოხსნა / Gel Polish Removal", price: "5 ₾", order: "66" },
      { name: "გამაგრების მოხსნა / Strengthening Removal", price: "10 ₾", order: "67" },
      { name: "1 ფრჩხილის გამაგრება / 1 Nail Strengthening", price: "4 ₾", order: "68" },
      { name: "1 ფრჩხილის დაგრძელება / 1 Nail Extension", price: "7 ₾", order: "69" },
    ];
    
    const pedicureServices = [
      { name: "პედიკური კლასიკური / Classic Pedicure", price: "40 ₾", order: "70" },
      { name: "პედიკური გელ-ლაქით / Pedicure with Gel Polish", price: "55 ₾", order: "71" },
      { name: "გელ-ლაქის მოხსნა და ფორმის მოცემა / Gel Removal+Shape", price: "10 ₾", order: "72" },
      { name: "გელ-ლაქის გადასმა ნუნების აწევით / Gel Reapplication with Lift", price: "30 ₾", order: "73" },
    ];
    
    const designServices = [
      { name: "ფრენჩი / French", price: "5 ₾", order: "80" },
      { name: "ქრომი / Chrome", price: "10 ₾", order: "81" },
      { name: "სტიკრები / Stickers", price: "1+ ₾", order: "82" },
    ];

      const servicesData = [
        ...epilationServices.map(s => ({
          category: "Epilation",
          name: s.name,
          description: "ლაზერული ეპილაცია / Laser Hair Removal",
          price: s.price,
          order: s.order,
        })),
        ...epilationMenServices.map(s => ({
          category: "Epilation",
          name: s.name,
          description: "ლაზერული ეპილაცია მამაკაცებისთვის / Laser Hair Removal for Men",
          price: s.price,
          order: s.order,
        })),
        ...manicureServices.map(s => ({
          category: "Nail",
          name: s.name,
          description: "მანიკიური / Manicure",
          price: s.price,
          order: s.order,
        })),
        ...pedicureServices.map(s => ({
          category: "Nail",
          name: s.name,
          description: "პედიკიური / Pedicure",
          price: s.price,
          order: s.order,
        })),
        ...designServices.map(s => ({
          category: "Nail",
          name: s.name,
          description: "ფრჩხილების დიზაინი / Nail Design",
          price: s.price,
          order: s.order,
        }))
      ];

      await db.insert(servicesTable).values(servicesData);
    
      await db.insert(servicesSectionTable).values({
        title: "ჩვენი სერვისები",
        subtitle: "Our Services",
        categoryDescriptions: JSON.stringify({
          "მანიკური / პედიკური": "Professional nail care using premium gel polishes and advanced techniques. Our manicure and pedicure services include nail strengthening, extensions, and artistic designs.",
          "ლაზერული ეპილაცია": "Advanced laser hair removal technology with safe and effective treatments. Our laser systems provide long-lasting results with minimal discomfort.",
          "კოსმეტოლოგია": "Professional skincare and beauty treatments using modern techniques and high-quality products for optimal results."
        })
      });
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }

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

  async approveBooking(id: string): Promise<Booking | undefined> {
    const [updated] = await db.update(bookingsTable)
      .set({ status: "confirmed", rejectionReason: null })
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
      // For creation, we need all required fields
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
}

export const storage = new MemStorage();
