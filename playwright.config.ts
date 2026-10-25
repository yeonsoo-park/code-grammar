import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  outputDir: "./tests/.results",
  timeout: 120_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3000", locale: "ko-KR" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
