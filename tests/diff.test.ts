/**
 * 첨삭 비교(diff) 테스트
 * 실행: npm run test:unit
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { diffLines, hasChanges } from "../lib/review/diff";

test("같은 코드면 바뀐 줄이 없어요", () => {
  const code = "a = 1\nprint(a)";
  assert.equal(hasChanges(diffLines(code, code)), false);
});

test("한 줄을 고치면 지운 줄 하나, 더한 줄 하나가 나와요", () => {
  const before = "unit_price = 24900\ntotal = unit_price * 2\nprint(total)";
  const after = "unit_price = 24900\nsubtotal = unit_price * 2\nprint(subtotal)";
  const d = diffLines(before, after);
  assert.equal(d[0].type, "same");
  assert.equal(d[0].text, "unit_price = 24900");
  assert.equal(d.filter((l) => l.type === "same").length, 1);
  assert.equal(d.filter((l) => l.type === "del").length, 2);
  assert.equal(d.filter((l) => l.type === "add").length, 2);
});

test("줄을 더하면 그 줄만 add 로 나와요", () => {
  const d = diffLines("a = 1\nprint(a)", "a = 1\nb = a * 2\nprint(a)");
  assert.deepEqual(d, [
    { type: "same", text: "a = 1" },
    { type: "add", text: "b = a * 2" },
    { type: "same", text: "print(a)" },
  ]);
});

test("끝 공백·마지막 빈 줄 차이는 바뀐 것으로 보지 않아요", () => {
  assert.equal(hasChanges(diffLines("a = 1  \nprint(a)\n", "a = 1\nprint(a)")), false);
});
