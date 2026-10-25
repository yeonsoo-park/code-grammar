"use client";

import Link from "next/link";
import { useAppState } from "@/lib/store";
import { IconCheck, IconChevron } from "../icons";

export type UnitView = {
  id: string;
  title: string;
  lessons: { id: string; title: string; minutes?: number; open: boolean }[];
};

/** 학습 탭: 유닛별 레슨 목록. 레슨 제목은 잘려도 의미가 유지돼서 말줄임을 써요 (전체 제목은 레슨 화면에) */
export function LearnList({ units }: { units: UnitView[] }) {
  const state = useAppState();
  return (
    <div>
      <h1 className="t-title-1">학습</h1>
      <p className="t-body-2 t-sub mt-1">모든 레슨은 같은 쇼핑몰 주문·결제 데이터를 써요.</p>
      <div className="mt-8 flex flex-col gap-10">
        {units.map((u, ui) => (
          <section key={u.id} aria-labelledby={`unit-${u.id}`}>
            <p className="eyebrow">유닛&nbsp;{ui + 1}</p>
            <h2 id={`unit-${u.id}`} className="t-title-3">
              {u.title}
            </h2>
            <ul className="divided mt-3 border-y" style={{ borderColor: "var(--border)" }}>
              {u.lessons.map((l, li) => {
                const p = state?.progress[l.id];
                const status = !l.open ? "곧 열려요" : p?.completedAt ? "완료" : p?.step ? "학습 중" : `${l.minutes}분`;
                const body = (
                  <>
                    <span className="w-6 flex-none text-center t-caption t-sub tabular-nums" aria-hidden="true">
                      {p?.completedAt ? <IconCheck size={18} className="inline result-label-correct" /> : li + 1}
                    </span>
                    <span className="t-body-1 min-w-0 flex-1 truncate" style={{ wordBreak: "normal" }} title={l.title}>
                      {l.title}
                    </span>
                    <span className="t-caption t-sub flex-none">{status}</span>
                    {l.open && <IconChevron size={18} className="flex-none t-sub" />}
                  </>
                );
                const row = "flex min-h-12 items-center gap-3 px-1 py-2.5";
                return (
                  <li key={l.id}>
                    {l.open ? (
                      <Link href={`/lesson/${l.id}`} className={`${row} rounded-md no-underline hover:bg-[var(--bg-sub)]`} style={{ color: "var(--text-strong)" }}>
                        {body}
                      </Link>
                    ) : (
                      <div className={row} style={{ color: "var(--text-sub)" }} aria-disabled="true">
                        {body}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
