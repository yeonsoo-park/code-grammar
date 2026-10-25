/**
 * 스크롤 길이 측정 (390×844, 일반적인 휴대폰 크기)
 * 페이지 높이 ÷ 화면 높이를 재서 표로 남겨요. 1.0 이하면 스크롤이 없어요.
 * 목록·홈 같은 탐색 화면은 1.15 를 넘으면 실패로 봐요 (내용 화면은 기록만).
 */
import { expect, test } from "@playwright/test";

const LESSON = "py-01-variables";
const NAV_PAGES = ["/", "/learn", "/learn/python-basics", `/lesson/${LESSON}`, "/me"];
const LESSON_STEPS = 22;

test.use({ viewport: { width: 390, height: 844 } });

test("스크롤 길이", async ({ page }) => {
  const rows: string[] = [];
  const ratio = () => page.evaluate(() => document.documentElement.scrollHeight / window.innerHeight);

  for (const path of NAV_PAGES) {
    await page.goto(path);
    await page.waitForTimeout(500);
    const r = await ratio();
    rows.push(`${path.padEnd(28)} ${r.toFixed(2)}`);
    expect(r, `${path} 는 탐색 화면이라 한 화면에 들어와야 해요`).toBeLessThanOrEqual(1.15);
  }

  for (let step = 0; step < LESSON_STEPS; step++) {
    await page.goto("/");
    await page.evaluate(
      ([id, s]) => localStorage.setItem("cg:v1:state", JSON.stringify({ progress: { [id]: { step: s, totalSteps: 22 } }, reviews: {}, studyDays: [] })),
      [LESSON, step] as const,
    );
    await page.goto(`/lesson/${LESSON}/play`);
    await page.locator("main h2").first().waitFor();
    await page.waitForTimeout(300);
    rows.push(`레슨 ${String(step).padStart(2)}번 화면${" ".repeat(17)} ${(await ratio()).toFixed(2)}`);
  }
  console.log("\n화면                         높이/화면\n" + rows.join("\n"));
});
