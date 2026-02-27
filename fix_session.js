import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(`
  CREATE TABLE if not exists "session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL,
    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
  ) WITH (OIDS=FALSE);
  CREATE INDEX if not exists "IDX_session_expire" ON "session" ("expire");
`).then(() => {
  console.log("Session table created");
  process.exit(0);
}).catch(err => {
  console.error("Error creating session table:", err);
  process.exit(1);
});
