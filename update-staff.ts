import { config } from "dotenv";
config();
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "./shared/schema.js";

neonConfig.webSocketConstructor = ws;

async function run() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });
    await db.update(schema.staff).set({ serviceCategory: "Nail" });
    console.log("Updated all staff to 'Nail' category");
    process.exit(0);
}

run().catch(console.error);
