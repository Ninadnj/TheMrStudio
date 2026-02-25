import { config } from "dotenv";
config();
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeAdmin } from "./auth";

// Configure WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const isProduction = process.env.NODE_ENV === "production";

// Ensure SESSION_SECRET is set for security
if (!process.env.SESSION_SECRET) {
  if (isProduction) {
    console.error("❌ FATAL: SESSION_SECRET must be set in production!");
    process.exit(1);
  }
  console.warn("⚠️  WARNING: SESSION_SECRET not set! Using default (insecure for production)");
}

// Security headers middleware
app.use((req, res, next) => {
  // Strict Transport Security (HTTPS only in production)
  if (isProduction) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  // Prevent MIME-type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",      // Vite HMR needs unsafe-eval in dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com https://fonts.cdnfonts.com",
      "img-src 'self' data: blob: https://storage.googleapis.com",
      "connect-src 'self' https://*.neon.tech wss://*.neon.tech",
      "frame-ancestors 'self'",
    ].join("; ")
  );
  next();
});

// Session store will be initialized inside the async block
let sessionStore: any;

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Setup session store
  if (process.env.DATABASE_URL) {
    const PgSession = connectPgSimple(session);
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    sessionStore = new PgSession({
      pool,
      tableName: 'session',
      createTableIfMissing: true,
    });
  } else {
    const MemoryStore = (await import("memorystore")).default(session);
    sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction, // HTTPS only in production
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Initialize admin user (works for both Database and MemStorage)
  await initializeAdmin();
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT from environment for deployment platforms, default to 5002 (avoid MacOS AirPlay on 5000)
  const port = parseInt(process.env.PORT || "5002", 10);
  server.listen({
    port,
    host: "0.0.0.0",  // Accept external connections
  }, () => {
    log(`serving on port ${port}`);
  });
})();
