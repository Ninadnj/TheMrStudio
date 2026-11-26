// Production static serving: compression + caching. Real HTTP against an in-process server.
import fs from "node:fs";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import express from "express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { serveStatic } from "../../server/vite";

const dist = fs.mkdtempSync(path.join(os.tmpdir(), "mr-dist-"));
fs.mkdirSync(path.join(dist, "assets"));
fs.mkdirSync(path.join(dist, "images"));
fs.writeFileSync(path.join(dist, "index.html"), `<!doctype html><title>x</title>${"<p>hi</p>".repeat(400)}`);
fs.writeFileSync(path.join(dist, "assets", "index-abc123.js"), `console.log(${JSON.stringify("x".repeat(4000))});`);
fs.writeFileSync(path.join(dist, "images", "hero-768.webp"), Buffer.alloc(2048, 1));

let base = "";
let server: ReturnType<express.Express["listen"]>;

beforeAll(async () => {
  const app = express();
  app.get("/api/ping", (_req, res) => res.json({ ok: true }));
  serveStatic(app, dist);
  await new Promise<void>((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server.close();
  fs.rmSync(dist, { recursive: true, force: true });
});

const get = (url: string, encoding = "br, gzip") => fetch(base + url, { headers: { "accept-encoding": encoding } });

describe("serveStatic", () => {
  it("compresses text assets for browsers that accept it", async () => {
    expect((await get("/assets/index-abc123.js")).headers.get("content-encoding")).toMatch(/^(br|gzip)$/);
    expect((await get("/assets/index-abc123.js", "gzip")).headers.get("content-encoding")).toBe("gzip");
    expect((await get("/", "gzip")).headers.get("content-encoding")).toBe("gzip");
  });

  it("does not compress already-compressed images", async () => {
    expect((await get("/images/hero-768.webp")).headers.get("content-encoding")).toBeNull();
  });

  it("caches hashed build assets for a year, immutably", async () => {
    expect((await get("/assets/index-abc123.js")).headers.get("cache-control")).toBe(
      "public, max-age=31536000, immutable",
    );
  });

  it("always revalidates the HTML, so a deploy shows up immediately", async () => {
    expect((await get("/")).headers.get("cache-control")).toBe("no-cache");
    expect((await get("/some/client/route")).headers.get("cache-control")).toBe("no-cache");
  });

  it("caches other public files for a week", async () => {
    expect((await get("/images/hero-768.webp")).headers.get("cache-control")).toBe("public, max-age=604800");
  });

  it("serves index.html for client routes and leaves API routes alone", async () => {
    expect(await (await get("/admin/login")).text()).toContain("<title>x</title>");
    expect(await (await get("/api/ping")).json()).toEqual({ ok: true });
  });
});
