import path from "node:path";
import { defineConfig } from "vitest/config";

// Separate from vite.config.ts so tests don't load the Replit dev plugins.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client/src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      // Ratchet: modules listed here must stay at or above the thresholds. Add each module
      // you write tests for; never remove one to make the gate pass.
      include: [
        "client/src/lib/sanitizeText.ts",
        "client/src/lib/serviceMenu.ts",
        "client/src/lib/studio.ts",
        "shared/studioDefaults.ts",
      ],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
      reporter: ["text", "json-summary", "lcov"],
    },
  },
});
