import { defineConfig } from "@playwright/test";

// BASE_URL 을 주면 배포된 사이트를 검사해요 (예: BASE_URL=https://code-grammar.vercel.app npm run test:e2e)
const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
const remote = !!process.env.BASE_URL;

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts", // *.test.ts 는 Node 단위 테스트 (npm run test:unit)
  outputDir: "./tests/.results",
  timeout: 120_000,
  fullyParallel: true,
  // 로컬 개발 서버 하나가 여러 브라우저 요청을 받으면 느려져서, 로컬에서는 동시에 2개까지만 돌려요
  workers: remote ? 4 : 2,
  reporter: [["list"]],
  use: { baseURL, locale: "ko-KR" },
  webServer: remote
    ? undefined
    : { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true, timeout: 120_000 },
});
