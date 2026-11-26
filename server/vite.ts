import compression from "compression";
import express, { type Express } from "express";
import fs from "fs";
import type { Server } from "http";
import { nanoid } from "nanoid";
import path from "path";

let viteLogger: any;

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const { createServer: createViteServer, createLogger } = await import("vite");
  const viteConfig = (await import("../vite.config")).default;
  viteLogger = createLogger();

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg: string, options: any) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(import.meta.dirname, "..", "client", "index.html");

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

const YEAR = 31_536_000;
const WEEK = 604_800;

/**
 * Production static files. Compression and caching live here (not only in Caddy), so the
 * site is fast whatever the proxy does:
 * - gzip/brotli for text (images and video are already compressed and are skipped);
 * - hashed build files in /assets are immutable for a year;
 * - HTML is always revalidated, so a deploy shows up on the next visit;
 * - other public files (images, fonts, icons) are cached for a week.
 */
export function serveStatic(app: Express, distPath = path.resolve(import.meta.dirname, "public")) {
  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
  }

  app.use(compression());
  app.use(
    express.static(distPath, {
      setHeaders(res, filePath) {
        const rel = path.relative(distPath, filePath).split(path.sep).join("/");
        if (rel.startsWith("assets/")) {
          res.setHeader("Cache-Control", `public, max-age=${YEAR}, immutable`);
        } else if (rel.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache");
        } else {
          res.setHeader("Cache-Control", `public, max-age=${WEEK}`);
        }
      },
    }),
  );

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
