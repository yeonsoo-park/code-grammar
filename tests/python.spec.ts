/**
 * 작문 단계에서 Python이 실제로 실행·채점되는지 확인해요 (Pyodide를 CDN에서 받아와요)
 */
import { expect, test } from "@playwright/test";

const LESSON = "py-01-variables";
const TRANSLATE_STEP = 20; // 작문 2단계: 번역하기

test("번역 과제: 정답 코드가 실제 Python으로 실행되고 모든 기준을 통과해요", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(
    ([id, s]) => localStorage.setItem("cg:v1:state", JSON.stringify({ progress: { [id]: { step: s, totalSteps: 22 } }, reviews: {}, studyDays: [] })),
    [LESSON, TRANSLATE_STEP] as const,
  );
  await page.goto(`/lesson/${LESSON}/play`);

  const editor = page.locator(".cm-content");
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText(
    ["unit_price = 24900", "quantity = 2", "coupon_discount = 5000", "total_amount = unit_price * quantity - coupon_discount", "print(total_amount)"].join("\n"),
  );
  await page.getByRole("button", { name: "실행하고 채점하기" }).click();

  // 처음엔 Pyodide를 내려받느라 시간이 걸려요
  await expect(page.locator("#sheet-title")).toHaveText(/통과했어요/, { timeout: 60_000 });
  await expect(page.locator(".sheet .output-block").first()).toHaveText("44800");
});
