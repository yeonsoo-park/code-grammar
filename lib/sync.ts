"use client";

/**
 * 기기 기록 ↔ Supabase 동기화
 * - 로그인하면: 서버 기록을 받아 기기 기록과 합치고(lib/merge.ts), 합친 결과를 다시 올려요.
 * - 공부하는 동안: 기록이 바뀔 때마다 1.5초 모아서 서버에 올려요.
 * - 오프라인: 기기에만 저장해 두고, 다시 연결되면 올려요.
 * Supabase 환경변수가 없으면 아무것도 하지 않아요(기기 저장만).
 */
import { useSyncExternalStore } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { mergeState, sameState, type AppState } from "./merge";
import { getState, onUserChange, replaceStateFromSync, resetAll } from "./store";
import { getSupabase } from "./supabase";

export type SyncStatus =
  | { kind: "off" } // Supabase 설정 없음
  | { kind: "signed-out" }
  | { kind: "syncing"; email: string }
  | { kind: "synced"; email: string; at: string }
  | { kind: "pending"; email: string } // 오프라인이라 올릴 게 남아 있음
  | { kind: "error"; email: string; message: string };

const OFF: SyncStatus = { kind: "off" };
let status: SyncStatus = OFF;
const statusListeners = new Set<() => void>();
function setStatus(s: SyncStatus) {
  status = s;
  statusListeners.forEach((l) => l());
}

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(
    (l) => {
      statusListeners.add(l);
      return () => statusListeners.delete(l);
    },
    () => status,
    () => OFF, // 서버 렌더링용 값은 항상 같은 객체여야 해요 (새 객체면 무한 반복 경고)
  );
}

let started = false;
let userId: string | null = null;
let email = "";
let timer: ReturnType<typeof setTimeout> | null = null;

/** 앱이 열릴 때 한 번 불러요 (components/SyncStarter.tsx) */
export function startSync() {
  if (started) return;
  started = true;
  const sb = getSupabase();
  if (!sb) return setStatus(OFF);
  setStatus({ kind: "signed-out" });

  sb.auth.onAuthStateChange((event, session) => {
    const nextId = session?.user.id ?? null;
    if (!nextId) {
      userId = null;
      return setStatus({ kind: "signed-out" });
    }
    const changedUser = nextId !== userId;
    userId = nextId;
    email = session?.user.email ?? "";
    // 로그인 직후·앱 첫 실행에만 전체 동기화 (토큰 갱신 때는 하지 않아요)
    if (changedUser || event === "SIGNED_IN") {
      // onAuthStateChange 안에서 바로 Supabase를 부르면 막힐 수 있어서 한 박자 미뤄요
      setTimeout(() => void fullSync(sb), 0);
    }
  });

  onUserChange(() => schedulePush());
  window.addEventListener("online", () => schedulePush(0));
}

function schedulePush(delay = 1500) {
  if (!userId) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void pushNow(), delay);
}

async function pushNow() {
  const sb = getSupabase();
  if (!sb || !userId) return;
  if (!navigator.onLine) return setStatus({ kind: "pending", email });
  setStatus({ kind: "syncing", email });
  try {
    await push(sb, userId, getState());
    setStatus({ kind: "synced", email, at: new Date().toISOString() });
  } catch (e) {
    setStatus(navigator.onLine ? { kind: "error", email, message: errorText(e) } : { kind: "pending", email });
  }
}

async function fullSync(sb: SupabaseClient) {
  if (!userId) return;
  setStatus({ kind: "syncing", email });
  try {
    const remote = await pull(sb);
    const local = getState();
    const merged = mergeState(local, remote);
    if (!sameState(merged, local)) replaceStateFromSync(merged);
    if (!sameState(merged, remote)) await push(sb, userId, merged);
    setStatus({ kind: "synced", email, at: new Date().toISOString() });
  } catch (e) {
    setStatus(navigator.onLine ? { kind: "error", email, message: errorText(e) } : { kind: "pending", email });
  }
}

async function pull(sb: SupabaseClient): Promise<AppState> {
  const [p, r, d] = await Promise.all([
    sb.from("lesson_progress").select("lesson_id, step, total_steps, completed_at, updated_at"),
    sb.from("review_items").select("question_id, lesson_id, box, due, wrong_count, last_answered_at"),
    sb.from("study_days").select("day"),
  ]);
  for (const res of [p, r, d]) if (res.error) throw res.error;
  return {
    progress: Object.fromEntries(
      (p.data ?? []).map((x) => [
        x.lesson_id,
        { step: x.step, totalSteps: x.total_steps, completedAt: x.completed_at ?? undefined, updatedAt: x.updated_at },
      ]),
    ),
    reviews: Object.fromEntries(
      (r.data ?? []).map((x) => [
        x.question_id,
        { lessonId: x.lesson_id, questionId: x.question_id, box: x.box, due: x.due ?? "", wrongCount: x.wrong_count, lastAnsweredAt: x.last_answered_at },
      ]),
    ),
    studyDays: (d.data ?? []).map((x) => x.day as string),
  };
}

async function push(sb: SupabaseClient, uid: string, s: AppState) {
  const progress = Object.entries(s.progress).map(([lesson_id, p]) => ({
    user_id: uid,
    lesson_id,
    step: p.step,
    total_steps: p.totalSteps,
    completed_at: p.completedAt ?? null,
    updated_at: p.updatedAt ?? new Date(0).toISOString(),
  }));
  const reviews = Object.values(s.reviews).map((r) => ({
    user_id: uid,
    question_id: r.questionId,
    lesson_id: r.lessonId,
    box: r.box,
    due: r.due || null,
    wrong_count: r.wrongCount,
    last_answered_at: r.lastAnsweredAt,
  }));
  const days = s.studyDays.map((day) => ({ user_id: uid, day }));
  const results = await Promise.all([
    progress.length ? sb.from("lesson_progress").upsert(progress, { onConflict: "user_id,lesson_id" }) : null,
    reviews.length ? sb.from("review_items").upsert(reviews, { onConflict: "user_id,question_id" }) : null,
    days.length ? sb.from("study_days").upsert(days, { onConflict: "user_id,day", ignoreDuplicates: true }) : null,
  ]);
  for (const res of results) if (res?.error) throw res.error;
}

/** 로그인 메일 보내기. 메일의 링크를 누르거나, 메일에 적힌 6자리 코드를 입력하면 돼요. */
export async function sendLoginEmail(address: string) {
  const sb = getSupabase();
  if (!sb) throw new Error("not-configured");
  const { error } = await sb.auth.signInWithOtp({
    email: address,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw error;
}

export async function verifyLoginCode(address: string, code: string) {
  const sb = getSupabase();
  if (!sb) throw new Error("not-configured");
  const { error } = await sb.auth.verifyOtp({ email: address, token: code, type: "email" });
  if (error) throw error;
}

export async function signOut() {
  await getSupabase()?.auth.signOut();
}

/** 기록 초기화: 로그인했다면 서버 기록도 함께 지워요 (안 그러면 다음 동기화 때 되살아나요) */
export async function resetEverywhere() {
  const sb = getSupabase();
  if (sb && userId) {
    const results = await Promise.all([
      sb.from("lesson_progress").delete().eq("user_id", userId),
      sb.from("review_items").delete().eq("user_id", userId),
      sb.from("study_days").delete().eq("user_id", userId),
    ]);
    for (const res of results) if (res.error) throw res.error;
  }
  resetAll();
}

function errorText(e: unknown) {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: unknown }).message);
  return String(e);
}
