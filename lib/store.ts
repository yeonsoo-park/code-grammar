"use client";

/**
 * 기기 안(localStorage)에 학습 기록을 저장해요.
 * M3에서 Supabase로 옮길 때도 이 파일의 함수 모양은 그대로 두고, 안쪽만 바꿀 예정이에요.
 * 저장이 막힌 환경(사생활 보호 모드 등)에서도 앱이 멈추지 않게 모든 접근을 try/catch로 감싸요.
 */
import { useSyncExternalStore } from "react";
import { nextReview, type ReviewItem } from "./srs";

const KEY = "cg:v1:state";

export type LessonProgress = { step: number; totalSteps: number; completedAt?: string };

export type AppState = {
  progress: Record<string, LessonProgress>;
  reviews: Record<string, ReviewItem>;
  /** 공부한 날짜 (YYYY-MM-DD, 기기 시간 기준) */
  studyDays: string[];
};

const EMPTY: AppState = { progress: {}, reviews: {}, studyDays: [] };

let cache: AppState | null = null;
const listeners = new Set<() => void>();

function read(): AppState {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache!;
}

function write(next: AppState) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // 저장이 막혀 있어도 이번 방문 동안은 메모리에서 계속 써요
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

/** 서버 렌더링 중에는 null → 화면은 스켈레톤을 보여줘요 */
export function useAppState(): AppState | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function today(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function markStudied(s: AppState): AppState {
  const t = today();
  return s.studyDays.includes(t) ? s : { ...s, studyDays: [...s.studyDays, t].slice(-400) };
}

export function saveProgress(lessonId: string, step: number, totalSteps: number, completed = false) {
  const s = read();
  const prev = s.progress[lessonId];
  const p: LessonProgress = {
    step: Math.max(step, completed ? totalSteps : 0),
    totalSteps,
    completedAt: completed ? new Date().toISOString() : prev?.completedAt,
  };
  write(markStudied({ ...s, progress: { ...s.progress, [lessonId]: p } }));
}

/** 문제를 풀 때마다 불러요. 틀리면 오답노트에 넣고, 오답노트 문제를 맞히면 다음 복습일을 미뤄요. */
export function recordAnswer(lessonId: string, questionId: string, correct: boolean) {
  const s = read();
  const prev = s.reviews[questionId];
  if (!prev && correct) return write(markStudied(s));
  const next = nextReview(prev, correct, lessonId, questionId);
  write(markStudied({ ...s, reviews: { ...s.reviews, [questionId]: next } }));
}

export function resetAll() {
  write(EMPTY);
}

/** 오늘까지 연속으로 공부한 날 수. 오늘 아직 안 했어도 어제까지 이어졌으면 유지돼요. */
export function streak(days: string[]): number {
  const set = new Set(days);
  const d = new Date();
  if (!set.has(today(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(today(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
