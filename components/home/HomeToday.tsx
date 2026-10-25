"use client";

import { useRouter } from "next/navigation";
import { isDue } from "@/lib/srs";
import { streak, useAppState } from "@/lib/store";
import { BottomCta } from "../BottomCta";

type LessonInfo = { id: string; title: string; unit: string; minutes: number };

/** 홈: 오늘의 학습 카드 (신규 레슨 1개 + 복습 문제) */
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

  const target = nextLesson ? `/lesson/${nextLesson.id}` : dueCount ? "/review" : "/learn";
  const ctaLabel = nextLesson ? (inProgress?.step ? "이어서 학습하기" : "오늘 학습 시작") : dueCount ? "복습 시작" : "학습 목록 보기";

  return (
    <div>
      <p className="eyebrow">{days > 0 ? `${days}일째 이어서 공부하고 있어요` : "오늘부터 시작해 볼까요"}</p>
      <h1 className="t-title-1 mt-1">오늘의 학습</h1>

      <section className="card mt-6" aria-labelledby="today-title">
        {nextLesson ? (
          <>
            <p className="eyebrow">새 레슨 · {nextLesson.unit}</p>
            <h2 id="today-title" className="t-title-2 mt-1">
              {nextLesson.title}
            </h2>
            {inProgress?.step ? (
              <div className="mt-4">
                <div className="stage-track" aria-hidden="true">
                  <div className="stage-fill" style={{ width: `${Math.round((inProgress.step / inProgress.totalSteps) * 100)}%` }} />
                </div>
                <p className="t-caption t-sub mt-1.5">
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

        <dl className="mt-5 grid grid-cols-3 border-t pt-4" style={{ borderColor: "var(--border)" }}>
          <Stat label="예상 시간" value={`${minutes}분`} />
          <Stat label="복습 문제" value={`${dueCount}개`} />
          <Stat label="연속 학습" value={`${days}일`} />
        </dl>
      </section>

      <section className="mt-10" aria-labelledby="progress-title">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="progress-title" className="section-title mb-0">
            전체 진도
          </h2>
          <p className="t-caption t-sub tabular-nums">
            {completed}&nbsp;/&nbsp;{lessons.length} 레슨 · {percent}%
          </p>
        </div>
        <div className="stage-track mt-2" aria-hidden="true">
          <div className="stage-fill" style={{ width: `${percent}%` }} />
        </div>
      </section>

      <BottomCta label={ctaLabel} onClick={() => router.push(target)} tabbed />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="t-caption t-sub">{label}</dt>
      <dd className="t-title-3 mt-0.5 tabular-nums">{value}</dd>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div aria-busy="true" aria-label="오늘의 학습을 불러오고 있어요">
      <div className="skeleton" style={{ height: "1.25rem", width: "45%" }} />
      <h1 className="t-title-1 mt-1">오늘의 학습</h1>
      <div className="skeleton mt-6" style={{ height: "11rem", borderRadius: "var(--radius-card)" }} />
      <div className="skeleton mt-10" style={{ height: "2.5rem" }} />
    </div>
  );
}
