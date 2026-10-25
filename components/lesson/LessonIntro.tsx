"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Meta } from "@/lib/content/schema";
import { useAppState } from "@/lib/store";
import { BottomCta } from "../BottomCta";
import { IconBack } from "../icons";
import { Illustration, STAGE_ART, UNIT_ART } from "../Illustration";
import { STAGES } from "../StageBar";

const COUNT_UNIT = ["화면", "문제", "줄", "문제", "과제"];

/** 레슨 소개: 무엇을, 얼마나, 어떤 순서로 배우는지 한 화면에 */
export function LessonIntro({ meta, counts }: { meta: Meta; counts: number[] }) {
  const router = useRouter();
  const state = useAppState();
  const p = state?.progress[meta.id];
  const questions = counts[1] + counts[3];
  const art = UNIT_ART[meta.unit.id] ?? { name: "book", tone: "violet" };
  const label = p?.completedAt ? "다시 학습하기" : p?.step ? "이어서 학습하기" : "학습 시작";

  return (
    <div className="min-h-dvh">
      <div className="pb-6" style={{ background: "var(--violet-50)" }}>
        <div className="content pt-2">
          <Link href={`/learn/${meta.unit.id}`} className="icon-btn -ml-3" aria-label={`${meta.unit.title} 레슨 목록으로`}>
            <IconBack />
          </Link>
          <div className="flex flex-col items-center text-center">
            <Illustration name={art.name} tone={art.tone} size={96} />
            <p className="badge mt-2" style={{ background: "var(--bg)" }}>
              {meta.unit.title} · {meta.order}과
            </p>
            <h1 className="t-title-1 mt-2">{meta.title}</h1>
            <p className="t-body-2 t-sub mt-1 max-w-[30rem]">{meta.summary}</p>
          </div>
        </div>
      </div>

      <main className="content -mt-4">
        <dl className="grid grid-cols-3 gap-2">
          <Stat tone="violet" value="5" unit="단계" />
          <Stat tone="pink" value={String(questions)} unit="문제" />
          <Stat tone="orange" value={String(meta.minutes)} unit="분" />
        </dl>

        <h2 className="section-title mt-6">이렇게 배워요</h2>
        <ol className="flex flex-col gap-1.5">
          {STAGES.map((s, i) => (
            <li key={s.name} className="row-card min-h-14 py-2">
              <Illustration name={STAGE_ART[i].name} tone={STAGE_ART[i].tone} size={36} className="flex-none" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="t-body-2 font-semibold">
                  {i + 1}. {s.name}
                </span>
                <span className="t-caption t-sub">영어의 {s.english}</span>
              </span>
              <span className="t-caption t-sub flex-none tabular-nums">
                {counts[i]}
                {COUNT_UNIT[i]}
              </span>
            </li>
          ))}
        </ol>
      </main>

      <BottomCta label={label} onClick={() => router.push(`/lesson/${meta.id}/play`)} />
    </div>
  );
}

function Stat({ tone, value, unit }: { tone: "violet" | "pink" | "orange"; value: string; unit: string }) {
  return (
    <div className="tile flex-col-reverse items-center gap-0 py-3 text-center" style={{ background: "var(--bg)", boxShadow: "var(--shadow-card)" }}>
      <dt className="t-caption t-sub">{unit}</dt>
      <dd className="t-title-2 tabular-nums" style={{ color: tone === "violet" ? "var(--primary-strong)" : undefined }}>
        <span aria-hidden="true" className="mr-1.5 inline-block size-2 rounded-full align-middle" style={{ background: `var(--${tone}-400)` }} />
        {value}
      </dd>
    </div>
  );
}
