/**
 * 오답노트 간격 반복 (1일 → 3일 → 7일 → 14일)
 * 틀리면 1일 뒤로 돌아가고, 맞히면 다음 간격으로 넘어가요. 14일 뒤 문제까지 맞히면 '졸업'이에요.
 */

export const INTERVALS = [1, 3, 7, 14] as const;

export type ReviewItem = {
  lessonId: string;
  questionId: string;
  /** 다음 간격 단계 (0 = 1일 뒤, 3 = 14일 뒤, 4 = 졸업) */
  box: number;
  due: string; // ISO 시각
  wrongCount: number;
  lastAnsweredAt: string;
};

function addDays(from: Date, days: number) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  d.setHours(4, 0, 0, 0); // 새벽 4시 기준으로 '그날'이 바뀌어요
  return d.toISOString();
}

export function nextReview(prev: ReviewItem | undefined, correct: boolean, lessonId: string, questionId: string, now = new Date()): ReviewItem {
  const box = correct ? Math.min((prev?.box ?? 0) + 1, INTERVALS.length) : 0;
  return {
    lessonId,
    questionId,
    box,
    due: box >= INTERVALS.length ? "" : addDays(now, INTERVALS[box]),
    wrongCount: (prev?.wrongCount ?? 0) + (correct ? 0 : 1),
    lastAnsweredAt: now.toISOString(),
  };
}

export const isGraduated = (r: ReviewItem) => r.box >= INTERVALS.length;
export const isDue = (r: ReviewItem, now = new Date()) => !isGraduated(r) && new Date(r.due) <= now;
