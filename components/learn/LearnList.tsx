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
      <div className="mt-6 flex flex-col gap-8">
        {units.map((u, ui) => (
          <section key={u.id} aria-labelledby={`unit-${u.id}`}>
            <h2 id={`unit-${u.id}`} className="t-title-3">
              <span className="t-sub">유닛&nbsp;{ui + 1}</span> {u.title}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {u.lessons.map((l, li) => {
                const p = state?.progress[l.id];
                const status = !l.open ? "곧 열려요" : p?.completedAt ? "완료" : p?.step ? "학습 중" : `${l.minutes}분`;
                const body = (
                  <>
                    <span
                      className="choice-mark"
                      aria-hidden="true"
                      style={p?.completedAt ? { background: "var(--primary)", borderColor: "var(--primary)", color: "var(--on-primary)" } : undefined}
                    >
                      {p?.completedAt ? <IconCheck size={16} /> : li + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="t-body-1 block truncate" style={{ wordBreak: "normal" }} title={l.title}>
                        {l.title}
                      </span>
                      <span className="t-caption t-sub">{status}</span>
                    </span>
                    {l.open && <IconChevron size={20} className="flex-none t-sub" />}
                  </>
                );
                return (
                  <li key={l.id}>
                    {l.open ? (
                      <Link href={`/lesson/${l.id}`} className="choice items-center no-underline" style={{ color: "var(--text-strong)" }}>
                        {body}
                      </Link>
                    ) : (
                      <div className="choice items-center" style={{ color: "var(--text-sub)" }} aria-disabled="true">
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
