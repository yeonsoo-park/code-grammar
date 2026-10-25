"use client";

import { useState, useSyncExternalStore } from "react";
import { resetAll, streak, useAppState } from "@/lib/store";
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

/** 내 정보: 테마 설정, 학습 기록. 알림 설정은 M5에서 여기에 붙어요. */
export function MePanel() {
  const state = useAppState();
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "system" as Theme);
  const [confirming, setConfirming] = useState(false);

  return (
    <div>
      <h1 className="t-title-1">내 정보</h1>

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
        <p className="t-body-2 t-sub mt-3">지금은 이 기기에만 저장돼요. 로그인 기능이 생기면 다른 기기에서도 이어서 볼 수 있어요.</p>

        <div className="mt-4">
          {confirming ? (
            <div className="card-sub" role="alertdialog" aria-labelledby="reset-q">
              <p id="reset-q" className="t-body-1">진도와 오답노트를 모두 지울까요? 되돌릴 수 없어요.</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <button type="button" className="btn-text" onClick={() => setConfirming(false)}>취소</button>
                <button
                  type="button"
                  className="btn-text"
                  style={{ color: "var(--wrong-strong)" }}
                  onClick={() => {
                    resetAll();
                    setConfirming(false);
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
