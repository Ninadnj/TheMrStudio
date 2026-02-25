import { config } from "dotenv";
config();
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "./shared/schema.js";
import bcrypt from "bcryptjs";

neonConfig.webSocketConstructor = ws;

async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}

async function run() {
    if (!process.env.DATABASE_URL) {
        console.error("No DATABASE_URL found in .env");
        process.exit(1);
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    const adminPassword = process.env.ADMIN_PASSWORD || "admin";
    const hashedPassword = await hashPassword(adminPassword);

    console.log("Creating/Updating Admin User...");
    await db
        .insert(schema.users)
        .values({
            username: "admin",
            password: hashedPassword,
        })
        .onConflictDoUpdate({
            target: schema.users.username,
            set: { password: hashedPassword }
        });

    console.log("✅ Admin User guaranteed.");

    console.log("Checking for specialists (staff)...");
    const existingStaff = await db.select().from(schema.staff);

    if (existingStaff.length === 0) {
        console.log("No staff found. Creating default specialist...");
        await db.insert(schema.staff).values({
            name: "Nina Doinjashvili",
            serviceCategory: "General",
            calendarId: "", // Not synced to Google Calendar yet
            order: "1"
        });
        console.log("✅ Default specialist created. The booking page will now work.");
    } else {
        console.log(`✅ Found ${existingStaff.length} specialist(s).`);
    }

    console.log("Done checking database. It is ready for Render.");
    process.exit(0);
}

run().catch(console.error);
