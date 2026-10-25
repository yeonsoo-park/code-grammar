"use client";

import Link from "next/link";
import type { UnitSummary } from "@/lib/content/curriculum";
import { useAppState } from "@/lib/store";
import { IconBack, IconCheck, IconChevron } from "../icons";
import { Illustration, UNIT_ART, UNIT_TINT } from "../Illustration";

/** 학습 탭 2단계: 유닛 하나의 레슨 목록 */
export function UnitDetail({ unit }: { unit: UnitSummary }) {
  const state = useAppState();
  const art = UNIT_ART[unit.id] ?? { name: "book", tone: "violet" };
  const done = unit.lessons.filter((l) => state?.progress[l.id]?.completedAt).length;

  return (
    <div>
      <Link href="/learn" className="icon-btn -ml-3 -mt-3" aria-label="유닛 목록으로">
        <IconBack />
      </Link>

      <header className={`tile tint-${UNIT_TINT[unit.id] ?? "violet"} mt-1 flex-row items-center gap-4 p-5`}>
        <Illustration name={art.name} tone={art.tone} size={76} className="flex-none" />
        <div className="min-w-0">
          <p className="t-caption t-sub">유닛&nbsp;{unit.order}</p>
          <h1 className="t-title-2">{unit.title}</h1>
          <p className="t-body-2 t-sub mt-0.5">
            레슨 {unit.lessons.length}개 · {done}개 완료
          </p>
        </div>
      </header>

      <h2 className="section-title mt-6">레슨</h2>
      <ul className="flex flex-col gap-2">
        {unit.lessons.map((l) => {
          const p = state?.progress[l.id];
          const status = !l.open ? "곧 열려요" : p?.completedAt ? "완료" : p?.step ? "학습 중" : `${l.minutes}분`;
          const body = (
            <>
              <span className="num-badge" aria-hidden="true" style={p?.completedAt ? { background: "var(--correct-weak)", color: "var(--correct-strong)" } : undefined}>
                {p?.completedAt ? <IconCheck size={18} /> : l.order}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="t-body-1 truncate font-semibold" style={{ wordBreak: "normal" }} title={l.title}>
                  {l.title}
                </span>
                <span className="t-caption t-sub">{status}</span>
              </span>
              {l.open && <IconChevron size={20} className="t-sub flex-none" />}
            </>
          );
          return (
            <li key={l.id}>
              {l.open ? (
                <Link href={`/lesson/${l.id}`} className="row-card">
                  {body}
                </Link>
              ) : (
                <div className="row-card" aria-disabled="true">
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
