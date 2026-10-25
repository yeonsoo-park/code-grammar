"use client";

import Link from "next/link";
import type { UnitSummary } from "@/lib/content/curriculum";
import { useAppState } from "@/lib/store";
import { Illustration, UNIT_ART, UNIT_TINT } from "../Illustration";

/** 학습 탭 1단계: 유닛 격자 (2열, 한 화면에 모두 보여요) */
export function UnitGrid({ units }: { units: UnitSummary[] }) {
  const state = useAppState();
  return (
    <div>
      <h1 className="t-title-1">학습</h1>
      <p className="t-body-2 t-sub mt-1">유닛을 골라 주세요. 모든 레슨은 같은 쇼핑몰 데이터를 써요.</p>

      <ul className="mt-6 grid grid-cols-2 gap-3">
        {units.map((u) => {
          const open = u.lessons.filter((l) => l.open).length;
          const done = u.lessons.filter((l) => state?.progress[l.id]?.completedAt).length;
          const art = UNIT_ART[u.id] ?? { name: "book", tone: "violet" };
          return (
            <li key={u.id} className="min-w-0">
              <Link href={`/learn/${u.id}`} className={`tile tint-${UNIT_TINT[u.id] ?? "violet"} h-full`}>
                <Illustration name={art.name} tone={art.tone} size={52} />
                <span className="t-caption t-sub mt-1">유닛&nbsp;{u.order}</span>
                <span className="t-title-3 -mt-1.5">{u.title}</span>
                <span className="mt-auto pt-2">
                  <span className="mini-track block" aria-hidden="true">
                    <span className="stage-fill block" style={{ width: `${(done / u.lessons.length) * 100}%` }} />
                  </span>
                  <span className="t-caption t-sub mt-1.5 block">
                    {open ? `${done}/${u.lessons.length} 완료` : `${u.lessons.length}개 레슨 · 곧 열려요`}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
