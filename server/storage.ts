import { 
  type User, type InsertUser, 
  type Booking, type InsertBooking,
  type HeroContent, type InsertHeroContent,
  type Service, type InsertService,
  type SiteSettings, type InsertSiteSettings,
  type Staff, type InsertStaff,
  type GalleryImage, type InsertGalleryImage
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
  
  getAllGalleryImages(): Promise<GalleryImage[]>;
  getGalleryImagesByCategory(category: string): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  updateGalleryImage(id: string, updates: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined>;
  deleteGalleryImage(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private bookings: Map<string, Booking>;
  private heroContent: HeroContent | undefined;
  private services: Map<string, Service>;
  private siteSettings: SiteSettings | undefined;
  private staff: Map<string, Staff>;
  private galleryImages: Map<string, GalleryImage>;

  constructor() {
    this.users = new Map();
    this.bookings = new Map();
    this.services = new Map();
    this.staff = new Map();
    this.galleryImages = new Map();
    
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
      calendarId: "mari@themrstudio.ge",
      order: "1"
    };
    const staff2 = {
      id: randomUUID(),
      name: "Rita",
      serviceCategory: "Nail",
      calendarId: "rita@themrstudio.ge",
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
      name: "Laser",
      serviceCategory: "Epilation",
      calendarId: "laser@themrstudio.ge",
      order: "4"
    };
    
    this.staff.set(staff1.id, staff1);
    this.staff.set(staff2.id, staff2);
    this.staff.set(staff3.id, staff3);
    this.staff.set(staff4.id, staff4);
    
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
    
    epilationServices.forEach((service) => {
      const id = randomUUID();
      this.services.set(id, {
        id,
        category: "Epilation",
        name: service.name,
        description: "ლაზერული ეპილაცია / Laser Hair Removal",
        price: service.price,
        order: service.order,
      });
    });
    
    epilationMenServices.forEach((service) => {
      const id = randomUUID();
      this.services.set(id, {
        id,
        category: "Epilation",
        name: service.name,
        description: "ლაზერული ეპილაცია მამაკაცებისთვის / Laser Hair Removal for Men",
        price: service.price,
        order: service.order,
      });
    });
    
    manicureServices.forEach((service) => {
      const id = randomUUID();
      this.services.set(id, {
        id,
        category: "Nail",
        name: service.name,
        description: "მანიკიური / Manicure",
        price: service.price,
        order: service.order,
      });
    });
    
    pedicureServices.forEach((service) => {
      const id = randomUUID();
      this.services.set(id, {
        id,
        category: "Nail",
        name: service.name,
        description: "პედიკიური / Pedicure",
        price: service.price,
        order: service.order,
      });
    });
    
    designServices.forEach((service) => {
      const id = randomUUID();
      this.services.set(id, {
        id,
        category: "Nail",
        name: service.name,
        description: "ფრჩხილების დიზაინი / Nail Design",
        price: service.price,
        order: service.order,
      });
    });
    
    // Initialize gallery images for showcase
    const galleryImages = [
      {
        id: randomUUID(),
        category: "ფრჩხილები",
        imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop",
        order: "1"
      },
      {
        id: randomUUID(),
        category: "ლაზერი",
        imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop",
        order: "2"
      },
      {
        id: randomUUID(),
        category: "კოსმეტოლოგია",
        imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop",
        order: "3"
      },
      {
        id: randomUUID(),
        category: "ფრჩხილები",
        imageUrl: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800&auto=format&fit=crop",
        order: "4"
      },
      {
        id: randomUUID(),
        category: "კოსმეტოლოგია",
        imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&auto=format&fit=crop",
        order: "5"
      },
      {
        id: randomUUID(),
        category: "ფრჩხილები",
        imageUrl: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&auto=format&fit=crop",
        order: "6"
      },
      {
        id: randomUUID(),
        category: "ლაზერი",
        imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&auto=format&fit=crop",
        order: "7"
      },
      {
        id: randomUUID(),
        category: "კოსმეტოლოგია",
        imageUrl: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&auto=format&fit=crop",
        order: "8"
      },
      {
        id: randomUUID(),
        category: "ფრჩხილები",
        imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop",
        order: "9"
      },
      {
        id: randomUUID(),
        category: "ლაზერი",
        imageUrl: "https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800&auto=format&fit=crop",
        order: "10"
      },
      {
        id: randomUUID(),
        category: "კოსმეტოლოგია",
        imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&auto=format&fit=crop",
        order: "11"
      },
      {
        id: randomUUID(),
        category: "ფრჩხილები",
        imageUrl: "https://images.unsplash.com/photo-1599206676335-193c82b13c9e?w=800&auto=format&fit=crop",
        order: "12"
      }
    ];
    
    galleryImages.forEach(image => {
      this.galleryImages.set(image.id, image);
    });
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

  async getAllGalleryImages(): Promise<GalleryImage[]> {
    return Array.from(this.galleryImages.values()).sort((a, b) => 
      a.order.localeCompare(b.order)
    );
  }

  async getGalleryImagesByCategory(category: string): Promise<GalleryImage[]> {
    return Array.from(this.galleryImages.values())
      .filter(img => img.category === category)
      .sort((a, b) => a.order.localeCompare(b.order));
  }

  async createGalleryImage(insertImage: InsertGalleryImage): Promise<GalleryImage> {
    const id = randomUUID();
    const image: GalleryImage = { ...insertImage, id };
    this.galleryImages.set(id, image);
    return image;
  }

  async updateGalleryImage(id: string, updates: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined> {
    const existing = this.galleryImages.get(id);
    if (!existing) return undefined;
    
    const updated: GalleryImage = { ...existing, ...updates };
    this.galleryImages.set(id, updated);
    return updated;
  }

  async deleteGalleryImage(id: string): Promise<boolean> {
    return this.galleryImages.delete(id);
  }
}

export const storage = new MemStorage();
