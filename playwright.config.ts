import { defineConfig } from "@playwright/test";

// BASE_URL 을 주면 배포된 사이트를 검사해요 (예: BASE_URL=https://code-grammar.vercel.app npm run test:e2e)
const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
const remote = !!process.env.BASE_URL;

export default defineConfig({
  testDir: "./tests",
  outputDir: "./tests/.results",
  timeout: 120_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL, locale: "ko-KR" },
  webServer: remote
    ? undefined
    : { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true, timeout: 120_000 },
});
