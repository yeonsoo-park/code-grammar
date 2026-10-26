"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { streak, useAppState } from "@/lib/store";
import { resetEverywhere, signOut, useSyncStatus, type SyncStatus } from "@/lib/sync";
import { IconAlert, IconCheck } from "../icons";
import { Illustration } from "../Illustration";

type Theme = "system" | "light" | "dark";
const THEMES: { value: Theme; label: string }[] = [
  { value: "system", label: "시스템" },
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
];

const themeListeners = new Set<() => void>();

function readTheme(): Theme {
  try {
    const s = localStorage.getItem("cg:theme");
    return s === "light" || s === "dark" ? s : "system";
  } catch {
    return "system";
  }
}

function subscribeTheme(l: () => void) {
  themeListeners.add(l);
  return () => themeListeners.delete(l);
}

function applyTheme(t: Theme) {
  try {
    if (t === "system") localStorage.removeItem("cg:theme");
    else localStorage.setItem("cg:theme", t);
  } catch {}
  const dark = t === "dark" || (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  themeListeners.forEach((l) => l());
}

/** 내 정보: 계정·동기화, 테마, 학습 기록. 알림 설정은 M5에서 여기에 붙어요. */
export function MePanel() {
  const state = useAppState();
  const sync = useSyncStatus();
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "system" as Theme);
  const [confirming, setConfirming] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const signedIn = sync.kind !== "off" && sync.kind !== "signed-out";

  return (
    <div>
      <h1 className="t-title-1">내 정보</h1>

      {sync.kind !== "off" && <AccountCard sync={sync} />}

      <section className="mt-6" aria-labelledby="theme-title">
        <h2 id="theme-title" className="section-title">화면 테마</h2>
        <fieldset className="grid grid-cols-3 gap-2">
          <legend className="sr-only">화면 테마</legend>
          {THEMES.map((t) => (
            <label key={t.value} className="choice min-h-12 flex-col items-center justify-center gap-1 p-3 text-center t-body-2" data-selected={theme === t.value}>
              <input
                type="radio"
                name="theme"
                className="sr-only"
                checked={theme === t.value}
                onChange={() => applyTheme(t.value)}
              />
              <span>{t.label}</span>
            </label>
          ))}
        </fieldset>
      </section>

      <section className="mt-10" aria-labelledby="record-title">
        <h2 id="record-title" className="section-title">학습 기록</h2>
        {state ? (
          <dl className="grid grid-cols-2 gap-3">
            <div className="tile tint-orange">
              <Illustration name="flame" tone="orange" size={40} />
              <div className="flex flex-col-reverse">
                <dd className="t-title-2 tabular-nums">{streak(state.studyDays)}일</dd>
                <dt className="t-caption t-sub">연속 학습</dt>
              </div>
            </div>
            <div className="tile tint-violet">
              <Illustration name="clock" tone="violet" size={40} />
              <div className="flex flex-col-reverse">
                <dd className="t-title-2 tabular-nums">{state.studyDays.length}일</dd>
                <dt className="t-caption t-sub">공부한 날</dt>
              </div>
            </div>
          </dl>
        ) : (
          <div className="skeleton" style={{ height: "5rem" }} />
        )}
        <p className="t-body-2 t-sub mt-3">
          {signedIn ? "이 기기와 계정에 함께 저장돼요. 다른 기기에서 로그인해도 이어서 볼 수 있어요." : "지금은 이 기기에만 저장돼요."}
        </p>

        <div className="mt-4">
          {confirming ? (
            <div className="card-sub" role="alertdialog" aria-labelledby="reset-q">
              <p id="reset-q" className="t-body-1">
                진도와 오답노트를 모두 지울까요? {signedIn ? "계정에 저장된 기록도 함께 지워져요. " : ""}되돌릴 수 없어요.
              </p>
              {resetError && (
                <p className="t-body-2 mt-1" role="alert" style={{ color: "var(--wrong-strong)" }}>
                  {resetError}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-1">
                <button type="button" className="btn-text" onClick={() => setConfirming(false)}>취소</button>
                <button
                  type="button"
                  className="btn-text"
                  style={{ color: "var(--wrong-strong)" }}
                  onClick={async () => {
                    try {
                      setResetError(null);
                      await resetEverywhere();
                      setConfirming(false);
                    } catch {
                      setResetError("계정의 기록을 지우지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.");
                    }
                  }}
                >
                  모두 지우기
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn-text -ml-3" onClick={() => setConfirming(true)}>
              학습 기록 초기화
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function statusLine(sync: SyncStatus) {
  switch (sync.kind) {
    case "syncing":
      return { text: "기록을 맞추는 중이에요", ok: true };
    case "synced":
      return { text: `${new Date(sync.at).toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" })}에 저장했어요`, ok: true };
    case "pending":
      return { text: "인터넷이 연결되면 올릴게요", ok: true };
    case "error":
      return { text: "기록을 올리지 못했어요", ok: false };
    default:
      return { text: "", ok: true };
  }
}

/** 계정 카드: 로그인 전엔 로그인 안내, 로그인 후엔 이메일과 저장 상태 */
function AccountCard({ sync }: { sync: SyncStatus }) {
  if (sync.kind === "signed-out" || sync.kind === "off") {
    return (
      <section className="tile tint-violet mt-5 p-5" aria-labelledby="account-title">
        <div className="flex items-center gap-3">
          <Illustration name="note" tone="violet" size={48} className="flex-none" />
          <div className="min-w-0">
            <h2 id="account-title" className="t-title-3">
              기록을 계정에 저장해요
            </h2>
            <p className="t-body-2 t-sub">로그인하면 휴대폰과 컴퓨터에서 이어서 공부할 수 있어요.</p>
          </div>
        </div>
        <Link href="/login" className="btn-primary mt-3 no-underline">
          이메일로 로그인
        </Link>
      </section>
    );
  }
  const line = statusLine(sync);
  return (
    <section className="card mt-5" aria-labelledby="account-title">
      <p className="t-caption t-sub">로그인한 계정</p>
      <h2 id="account-title" className="t-title-3 break-all">
        {sync.email}
      </h2>
      <p className={`t-body-2 mt-1 flex items-center gap-1.5 ${line.ok ? "t-sub" : "result-label-wrong"}`} role="status">
        {line.ok ? <IconCheck size={16} className="flex-none" /> : <IconAlert size={16} className="flex-none" />}
        {line.text}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {sync.kind === "error" && (
          <button type="button" className="btn-text btn-text-strong -ml-3" onClick={() => location.reload()}>
            다시 시도
          </button>
        )}
        <button type="button" className={`btn-text ${sync.kind === "error" ? "" : "-ml-3"}`} onClick={() => void signOut()}>
          로그아웃
        </button>
      </div>
    </section>
  );
}
