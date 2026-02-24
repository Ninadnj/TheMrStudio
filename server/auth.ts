import { storage } from "./storage";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";

export async function initializeAdmin() {
  const adminUsername = "admin";
  const existingAdmin = await storage.getUserByUsername(adminUsername);

  if (!existingAdmin) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.warn("⚠️  ADMIN_PASSWORD not set - skipping admin user creation");
      console.warn("⚠️  Set ADMIN_PASSWORD environment variable to create admin user");
      return;
    }
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await storage.createUser({
      username: adminUsername,
      password: hashedPassword,
    });
    console.log("✅ Admin user created with username: admin");
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const user = await storage.getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.userId = user.id;
    req.session.isAdmin = user.username === "admin";

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.username === "admin"
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
}

export async function logoutHandler(req: Request, res: Response) {
  req.session.destroy((err: any) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ success: true });
  });
}

export async function checkAuthHandler(req: Request, res: Response) {
  if (req.session.userId && req.session.isAdmin) {
    const user = await storage.getUser(req.session.userId);
    if (user) {
      return res.json({
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          isAdmin: true
        }
      });
    }
  }

  res.json({ authenticated: false });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId || !req.session.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}
