/**
 * First-run content for the owner-editable tables: the price list and studio
 * details exactly as the site showed them before they moved into the admin.
 * Used only when the tables are empty; after that the admin is the source.
 */
import type { InsertPriceGroup, InsertPriceItem } from "@shared/schema";

type SeedGroup = InsertPriceGroup & { id: string; items: Omit<InsertPriceItem, "groupId">[] };

export const seedPriceMenu: SeedGroup[] = [
  {
    id: "nails",
    titleKa: "ფრჩხილები",
    titleEn: "Nails — Manicure & Pedicure",
    shortKa: "ფრჩხილები",
    shortEn: "Nails",
    position: 0,
    items: [
      {
        nameKa: "გელ-ლაქი + კუტიკულის მოვლა",
        nameEn: "Gel Polish + Cuticle Care",
        price: 35,
        booking: "Manicure",
        position: 0
      },
      {
        nameKa: "გელ-ლაქი + კუტიკულის მოცილება",
        nameEn: "Gel Polish + Cuticle Removal",
        price: 25,
        booking: "Manicure",
        position: 1
      },
      {
        nameKa: "გამაგრება (გელი)",
        nameEn: "Strengthening (Gel)",
        price: 45,
        booking: "Manicure",
        position: 2
      },
      {
        nameKa: "დაგრძელება",
        nameEn: "Extension",
        price: 80,
        booking: "Manicure",
        position: 3
      },
      {
        nameKa: "კორექცია",
        nameEn: "Correction",
        price: 70,
        booking: "Manicure",
        position: 4
      },
      {
        nameKa: "გელის მოხსნა",
        nameEn: "Gel Removal",
        price: 5,
        booking: "Manicure",
        position: 5
      },
      {
        nameKa: "პედიკური (კლასიკური)",
        nameEn: "Pedicure (Classic)",
        price: 40,
        booking: "Pedicure",
        position: 6
      },
      {
        nameKa: "პედიკური (გელ-ლაქი)",
        nameEn: "Pedicure (Gel Polish)",
        price: 55,
        booking: "Pedicure",
        position: 7
      }
    ]
  },
  {
    id: "laser-women",
    titleKa: "ლაზერი — ქალბატონები",
    titleEn: "Laser hair removal — Women",
    shortKa: "ლაზერი · ქალი",
    shortEn: "Laser · Women",
    position: 1,
    items: [
      {
        nameKa: "მთლიანი სხეული (ეკონომ პაკეტი)",
        nameEn: "Full Body (Economy Package)",
        price: 75,
        booking: "Epilation",
        position: 0
      },
      {
        nameKa: "მთლიანი სხეული + სახე",
        nameEn: "Full Body + Face",
        price: 85,
        booking: "Epilation",
        position: 1
      },
      {
        nameKa: "მთლიანი სახე",
        nameEn: "Full Face",
        price: 20,
        booking: "Epilation",
        position: 2
      },
      {
        nameKa: "ფეხები (მთლიანი)",
        nameEn: "Full Legs",
        price: 30,
        booking: "Epilation",
        position: 3
      },
      {
        nameKa: "ხელები (მთლიანი)",
        nameEn: "Full Arms",
        price: 25,
        booking: "Epilation",
        position: 4
      },
      {
        nameKa: "ბიკინი (ღრმა)",
        nameEn: "Deep Bikini",
        price: 25,
        booking: "Epilation",
        position: 5
      },
      {
        nameKa: "იღლიები",
        nameEn: "Armpits",
        price: 10,
        booking: "Epilation",
        position: 6
      }
    ]
  },
  {
    id: "laser-men",
    titleKa: "ლაზერი — მამაკაცები",
    titleEn: "Laser hair removal — Men",
    shortKa: "ლაზერი · კაცი",
    shortEn: "Laser · Men",
    position: 2,
    items: [
      {
        nameKa: "მთლიანი სხეული",
        nameEn: "Full Body",
        price: 75,
        booking: "Epilation",
        position: 0
      },
      {
        nameKa: "ზურგი (მთლიანი)",
        nameEn: "Full Back",
        price: 50,
        booking: "Epilation",
        position: 1
      },
      {
        nameKa: "მკერდი",
        nameEn: "Chest",
        price: 30,
        booking: "Epilation",
        position: 2
      },
      {
        nameKa: "მუცელი",
        nameEn: "Abdomen",
        price: 30,
        booking: "Epilation",
        position: 3
      },
      {
        nameKa: "ფეხები",
        nameEn: "Legs",
        price: 50,
        booking: "Epilation",
        position: 4
      },
      {
        nameKa: "სახე / წვერის კონტური",
        nameEn: "Face / Beard Line",
        price: 30,
        booking: "Epilation",
        position: 5
      }
    ]
  },
  {
    id: "cosmetology",
    titleKa: "კოსმეტოლოგია",
    titleEn: "Cosmetology — Skin & Injectables",
    shortKa: "კოსმეტოლოგია",
    shortEn: "Cosmetology",
    position: 3,
    items: [
      {
        nameKa: "ჯუვედერმ ფილერი",
        nameEn: "Juvederm Filler",
        price: 500,
        booking: "Cosmetology",
        position: 0
      },
      {
        nameKa: "რიმედიუმ ფილერი",
        nameEn: "ReMedium Filler",
        price: 250,
        booking: "Cosmetology",
        position: 1
      },
      {
        nameKa: "ბოტოქსი (NABOTA)",
        nameEn: "Botox (NABOTA)",
        price: 250,
        booking: "Cosmetology",
        position: 2
      },
      {
        nameKa: "ბიორევიტალიზაცია",
        nameEn: "Biorevitalization",
        price: 100,
        booking: "Cosmetology",
        position: 3
      },
      {
        nameKa: "მეზოთერაპია",
        nameEn: "Mesotherapy",
        price: 100,
        booking: "Cosmetology",
        position: 4
      },
      {
        nameKa: "სახის პილინგი",
        nameEn: "Face Peeling",
        price: 100,
        booking: "Cosmetology",
        position: 5
      }
    ]
  }
];

export { defaultStudioInfo as seedStudioInfo } from "@shared/studioDefaults";
