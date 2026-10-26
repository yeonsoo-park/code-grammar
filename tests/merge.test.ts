/**
 * 기록 합치기 규칙 테스트 (Node 기본 테스트 도구)
 * 실행: npm run test:unit
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeProgress, mergeReview, mergeState, type AppState } from "../lib/merge";
import type { ReviewItem } from "../lib/srs";

const review = (over: Partial<ReviewItem>): ReviewItem => ({
  lessonId: "py-01",
  questionId: "q1",
  box: 0,
  due: "2026-10-27T19:00:00.000Z",
  wrongCount: 1,
  lastAnsweredAt: "2026-10-26T10:00:00.000Z",
  ...over,
});

test("진도: 더 최근에 바뀐 쪽을 따라요", () => {
  const phone = { step: 5, totalSteps: 22, updatedAt: "2026-10-26T09:00:00Z" };
  const laptop = { step: 12, totalSteps: 22, updatedAt: "2026-10-26T11:00:00Z" };
  assert.equal(mergeProgress(phone, laptop)!.step, 12);
  assert.equal(mergeProgress(laptop, phone)!.step, 12);
});

test("진도: 한쪽이라도 완료했으면 완료를 지키고, 가장 이른 완료 시각을 남겨요", () => {
  const done = { step: 22, totalSteps: 22, completedAt: "2026-10-25T10:00:00Z", updatedAt: "2026-10-25T10:00:00Z" };
  const redoing = { step: 3, totalSteps: 22, updatedAt: "2026-10-26T10:00:00Z" };
  const merged = mergeProgress(redoing, done)!;
  assert.equal(merged.completedAt, "2026-10-25T10:00:00Z");
  assert.equal(merged.step, 22);
  const both = mergeProgress({ ...done, completedAt: "2026-10-26T00:00:00Z" }, done)!;
  assert.equal(both.completedAt, "2026-10-25T10:00:00Z");
});

test("진도: 한쪽에만 있으면 그대로 가져와요", () => {
  const p = { step: 1, totalSteps: 22 };
  assert.deepEqual(mergeProgress(undefined, p), p);
  assert.deepEqual(mergeProgress(p, undefined), p);
});

test("오답노트: 더 최근에 푼 기록을 따라요", () => {
  const older = review({ box: 0 });
  const newer = review({ box: 1, lastAnsweredAt: "2026-10-27T10:00:00.000Z" });
  assert.equal(mergeReview(older, newer)!.box, 1);
  assert.equal(mergeReview(newer, older)!.box, 1);
});

test("전체: 공부한 날은 합치고, 문제·레슨은 하나도 잃지 않아요", () => {
  const local: AppState = {
    progress: { a: { step: 1, totalSteps: 22 } },
    reviews: { q1: review({}) },
    studyDays: ["2026-10-25", "2026-10-26"],
  };
  const remote: AppState = {
    progress: { b: { step: 2, totalSteps: 22 } },
    reviews: { q2: review({ questionId: "q2" }) },
    studyDays: ["2026-10-24", "2026-10-26"],
  };
  const m = mergeState(local, remote);
  assert.deepEqual(Object.keys(m.progress).sort(), ["a", "b"]);
  assert.deepEqual(Object.keys(m.reviews).sort(), ["q1", "q2"]);
  assert.deepEqual(m.studyDays, ["2026-10-24", "2026-10-25", "2026-10-26"]);
});
