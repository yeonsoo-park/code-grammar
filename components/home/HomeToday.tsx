"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { isDue } from "@/lib/srs";
import { streak, useAppState } from "@/lib/store";
import { BottomCta } from "../BottomCta";
import { Illustration, UNIT_ART, type IllustrationName, type Tone } from "../Illustration";

type LessonInfo = { id: string; title: string; unit: string; unitId: string; minutes: number };

/** 홈: 오늘의 학습 대시보드 (한 화면에 끝나요) */
export function HomeToday({ lessons }: { lessons: LessonInfo[] }) {
  const state = useAppState();
  const router = useRouter();

  if (!state) return <HomeSkeleton />;

  const nextLesson = lessons.find((l) => !state.progress[l.id]?.completedAt);
  const dueCount = Object.values(state.reviews).filter((r) => isDue(r)).length;
  const days = streak(state.studyDays);
  const completed = lessons.filter((l) => state.progress[l.id]?.completedAt).length;
  const percent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
  const inProgress = nextLesson ? state.progress[nextLesson.id] : undefined;
  const minutes = (nextLesson?.minutes ?? 0) + dueCount;
  const art = nextLesson ? (UNIT_ART[nextLesson.unitId] ?? { name: "book" as const, tone: "violet" as const }) : { name: "trophy" as const, tone: "violet" as const };

  const target = nextLesson ? (inProgress?.step ? `/lesson/${nextLesson.id}/play` : `/lesson/${nextLesson.id}`) : dueCount ? "/review" : "/learn";
  const ctaLabel = nextLesson ? (inProgress?.step ? "이어서 학습하기" : "오늘 학습 시작") : dueCount ? "복습 시작" : "학습 목록 보기";

  return (
    <div>
      <p className="t-body-2 t-sub">{days > 0 ? `${days}일째 이어서 공부하고 있어요` : "오늘부터 시작해 볼까요?"}</p>
      <h1 className="t-title-1">오늘의 학습</h1>

      <section className="tile tint-violet mt-5 flex-row items-center gap-3 p-5" aria-labelledby="today-title">
        <div className="min-w-0 flex-1">
          {nextLesson ? (
            <>
              <p className="badge" style={{ background: "var(--bg)" }}>
                새 레슨 · {nextLesson.unit}
              </p>
              <h2 id="today-title" className="t-title-2 mt-2">
                {nextLesson.title}
              </h2>
              <p className="t-body-2 t-sub mt-0.5">5단계 · {nextLesson.minutes}분</p>
              {inProgress?.step ? (
                <div className="mt-3">
                  <div className="mini-track" aria-hidden="true">
                    <div className="stage-fill" style={{ width: `${Math.round((inProgress.step / inProgress.totalSteps) * 100)}%` }} />
                  </div>
                  <p className="t-caption t-sub mt-1">
                    {inProgress.step}&nbsp;/&nbsp;{inProgress.totalSteps} 화면까지 했어요
                  </p>
                </div>
              ) : null}
            </>
          ) : (
            <h2 id="today-title" className="t-title-2">
              준비된 새 레슨을 모두 끝냈어요
            </h2>
          )}
        </div>
        <Illustration name={art.name} tone={art.tone} size={84} className="flex-none" />
      </section>

      <dl className="mt-3 grid grid-cols-2 gap-3">
        <Tile art="clock" tone="green" label="오늘 예상 시간" value={`${minutes}분`} />
        <Tile art="flame" tone="orange" label="연속 학습" value={`${days}일`} />
        <Tile art="note" tone="pink" label="오늘 복습할 문제" value={`${dueCount}개`} href="/review" />
        <Tile art="trophy" tone="violet" label="전체 진도" value={`${percent}%`} href="/learn" sub={`${completed}/${lessons.length} 레슨`} />
      </dl>

      <BottomCta label={ctaLabel} onClick={() => router.push(target)} tabbed />
    </div>
  );
}

function Tile({ art, tone, label, value, href, sub }: { art: IllustrationName; tone: Tone; label: string; value: string; href?: string; sub?: string }) {
  const body = (
    <>
      <Illustration name={art} tone={tone} size={44} />
      <div className="mt-1 flex flex-col-reverse">
        <dd className="t-title-2 tabular-nums">
          {value}
          {sub && <span className="t-caption t-sub ml-1.5 font-normal">{sub}</span>}
        </dd>
        <dt className="t-caption t-sub">{label}</dt>
      </div>
    </>
  );
  return href ? (
    <Link href={href} className={`tile tint-${tone}`}>
      {body}
    </Link>
  ) : (
    <div className={`tile tint-${tone}`}>{body}</div>
  );
}

function HomeSkeleton() {
  return (
    <div aria-busy="true" aria-label="오늘의 학습을 불러오고 있어요">
      <div className="skeleton" style={{ height: "1.25rem", width: "45%" }} />
      <h1 className="t-title-1">오늘의 학습</h1>
      <div className="skeleton mt-5" style={{ height: "8.5rem", borderRadius: "var(--radius-card)" }} />
      <div className="mt-3 grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: "8rem", borderRadius: "var(--radius-card)" }} />
        ))}
      </div>
    </div>
  );
}
