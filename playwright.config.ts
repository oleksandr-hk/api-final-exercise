import "dotenv/config";
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./global.setup.ts",
  projects: [
    {
      name: "api-final-tests",
      use: {
        baseURL: process.env.BASE_URL || "http://localhost:3000",
      },
      fullyParallel: false,
      retries: 0,
    },
  ],
  reporter: [["html", { open: "never" }]],
});
