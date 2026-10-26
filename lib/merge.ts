/**
 * 기기 기록과 서버 기록 합치기
 * 휴대폰·컴퓨터에서 따로 공부해도 기록이 사라지지 않게 규칙을 정해요.
 * - 레슨 진도: 더 최근에 바뀐 쪽. 단, 한쪽이라도 완료했으면 완료를 유지(가장 이른 완료 시각)
 * - 오답노트: 문제별로 더 최근에 푼 쪽
 * - 공부한 날: 합집합
 * 화면·저장소에 의존하지 않는 순수 함수라 테스트하기 쉬워요 (tests/merge.test.ts).
 */
import type { ReviewItem } from "./srs";

export type LessonProgress = { step: number; totalSteps: number; completedAt?: string; updatedAt?: string };

export type AppState = {
  progress: Record<string, LessonProgress>;
  reviews: Record<string, ReviewItem>;
  /** 공부한 날짜 (YYYY-MM-DD, 기기 시간 기준) */
  studyDays: string[];
};

const time = (iso?: string) => (iso ? Date.parse(iso) || 0 : 0);

function earliest(a?: string, b?: string) {
  if (!a) return b;
  if (!b) return a;
  return time(a) <= time(b) ? a : b;
}

export function mergeProgress(a: LessonProgress | undefined, b: LessonProgress | undefined): LessonProgress | undefined {
  if (!a) return b;
  if (!b) return a;
  const newer = time(b.updatedAt) > time(a.updatedAt) ? b : a;
  const completedAt = earliest(a.completedAt, b.completedAt);
  if (completedAt && !newer.completedAt) {
    // 완료 기록은 지우지 않아요. 완료한 쪽의 화면 수를 따라요.
    const done = a.completedAt ? a : b;
    return { ...done, completedAt, updatedAt: newer.updatedAt };
  }
  return { ...newer, completedAt };
}

export function mergeReview(a: ReviewItem | undefined, b: ReviewItem | undefined): ReviewItem | undefined {
  if (!a) return b;
  if (!b) return a;
  return time(b.lastAnsweredAt) > time(a.lastAnsweredAt) ? b : a;
}

export function mergeState(local: AppState, remote: AppState): AppState {
  const progress: AppState["progress"] = {};
  for (const id of new Set([...Object.keys(local.progress), ...Object.keys(remote.progress)])) {
    progress[id] = mergeProgress(local.progress[id], remote.progress[id])!;
  }
  const reviews: AppState["reviews"] = {};
  for (const id of new Set([...Object.keys(local.reviews), ...Object.keys(remote.reviews)])) {
    reviews[id] = mergeReview(local.reviews[id], remote.reviews[id])!;
  }
  const studyDays = [...new Set([...local.studyDays, ...remote.studyDays])].sort().slice(-400);
  return { progress, reviews, studyDays };
}

/** 내용이 같은지 (동기화가 필요한지 판단할 때 써요) */
export function sameState(a: AppState, b: AppState) {
  return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
}

function normalize(s: AppState) {
  const sortObj = <T,>(o: Record<string, T>) => Object.fromEntries(Object.entries(o).sort(([x], [y]) => x.localeCompare(y)));
  return { progress: sortObj(s.progress), reviews: sortObj(s.reviews), studyDays: [...s.studyDays].sort() };
}
