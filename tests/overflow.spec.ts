/**
 * 디자인 규칙 4-4 검증
 * - 5개 화면 폭 × 모든 화면에서 페이지 전체 가로 넘침이 없는지
 *   (document.documentElement.scrollWidth > window.innerWidth 이면 실패)
 * - 200% 확대(= CSS 폭 절반), 시스템 글자 크기 최대(= 기본 글자 200%)
 * - 화면마다 스크린샷을 tests/screenshots/ 에 저장
 */
import { expect, test, type Page } from "@playwright/test";

const WIDTHS = [320, 360, 390, 768, 1440];
const LESSON = "py-01-variables";
const LESSON_STEPS = 17; // 개념 5 + 문제 4 + 독해 1 + 독해 문제 4 + 작문 3 (완료 화면 제외)

const PAGES = ["/", "/learn", "/review", "/me", "/dev/stress"];

async function noOverflow(page: Page, label: string) {
  await page.waitForLoadState("load");
  await page.waitForTimeout(300);
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  expect(r.sw, `${label}: scrollWidth ${r.sw} > innerWidth ${r.iw}`).toBeLessThanOrEqual(r.iw);
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `tests/screenshots/${name}.png`, fullPage: true });
}

/** 저장된 진도를 n번째 화면으로 맞춰서 레슨 중간 화면을 바로 열어요 */
async function openLessonStep(page: Page, step: number) {
  await page.goto("/");
  await page.evaluate(
    ([id, s, total]) =>
      localStorage.setItem("cg:v1:state", JSON.stringify({ progress: { [id]: { step: s, totalSteps: total } }, reviews: {}, studyDays: [] })),
    [LESSON, step, LESSON_STEPS] as const,
  );
  await page.goto(`/lesson/${LESSON}`);
  await page.locator("main h2").first().waitFor();
}

for (const width of WIDTHS) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test("탭 화면 + 넘침 검사용 화면", async ({ page }) => {
      for (const path of PAGES) {
        await page.goto(path);
        await noOverflow(page, `${width} ${path}`);
        await shot(page, `${width}${path === "/" ? "-home" : path.replaceAll("/", "-")}`);
      }
      // 긴 선택지 채점 → 해설 시트
      await page.goto("/dev/stress");
      await page.locator("label.choice").nth(1).click();
      await page.getByRole("button", { name: "확인하기" }).click();
      await page.locator("#sheet-title").waitFor();
      await noOverflow(page, `${width} stress 채점 후`);
      await shot(page, `${width}-dev-stress-graded`);
    });

    test("레슨 모든 화면", async ({ page }) => {
      for (let step = 0; step < LESSON_STEPS; step++) {
        await openLessonStep(page, step);
        await noOverflow(page, `${width} 레슨 ${step}번 화면`);
        await shot(page, `${width}-lesson-${String(step).padStart(2, "0")}`);
      }
    });
  });
}

test.describe("확대·글자 크기", () => {
  // 브라우저 200% 확대 = 같은 화면에서 CSS 폭이 절반
  for (const width of [180, 720]) {
    test(`200% 확대 (원래 폭 ${width * 2}px)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 600 });
      for (const path of ["/", "/dev/stress"]) {
        await page.goto(path);
        await noOverflow(page, `zoom200 ${width} ${path}`);
        await shot(page, `zoom200-${width * 2}${path === "/" ? "-home" : path.replaceAll("/", "-")}`);
      }
      for (const step of [1, 5, 9, 15]) {
        await openLessonStep(page, step);
        await noOverflow(page, `zoom200 ${width} 레슨 ${step}`);
        await shot(page, `zoom200-${width * 2}-lesson-${step}`);
      }
    });
  }

  test("시스템 글자 크기 최대 (360px, 기본 글자 200%)", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    const bigText = () => page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    for (const path of ["/", "/learn", "/dev/stress"]) {
      await page.goto(path);
      await bigText();
      await noOverflow(page, `큰 글자 ${path}`);
      await shot(page, `bigtext-360${path === "/" ? "-home" : path.replaceAll("/", "-")}`);
    }
    for (const step of [1, 5, 9, 15]) {
      await openLessonStep(page, step);
      await bigText();
      await noOverflow(page, `큰 글자 레슨 ${step}`);
      await shot(page, `bigtext-360-lesson-${step}`);
    }
  });

  test("다크 모드 (390px)", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.setViewportSize({ width: 390, height: 800 });
    for (const step of [0, 5, 9]) {
      await openLessonStep(page, step);
      await noOverflow(page, `다크 레슨 ${step}`);
      await shot(page, `dark-390-lesson-${step}`);
    }
  });
});
