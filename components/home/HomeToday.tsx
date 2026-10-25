"use client";

import { useRouter } from "next/navigation";
import { isDue } from "@/lib/srs";
import { streak, useAppState } from "@/lib/store";
import { BottomCta } from "../BottomCta";
import { IconClock, IconFlame, IconNote } from "../icons";

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
      <h1 className="t-title-1">오늘의 학습</h1>
      <p className="t-body-2 t-sub mt-1">하루 15~20분이면 충분해요.</p>

      <section className="card mt-6" aria-labelledby="today-title">
        {nextLesson ? (
          <>
            <p className="badge">새 레슨</p>
            <h2 id="today-title" className="t-title-2 mt-3">
              {nextLesson.title}
            </h2>
            <p className="t-body-2 t-sub mt-1">{nextLesson.unit}</p>
            {inProgress?.step ? (
              <div className="mt-4">
                <div className="stage-track" aria-hidden="true">
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

        <dl className="mt-5 grid grid-cols-3 gap-2">
          <Stat icon={<IconClock size={20} />} label="예상 시간" value={`${minutes}분`} />
          <Stat icon={<IconNote size={20} />} label="복습 문제" value={`${dueCount}개`} />
          <Stat icon={<IconFlame size={20} />} label="연속 학습" value={`${days}일`} />
        </dl>
      </section>

      <section className="mt-6" aria-labelledby="progress-title">
        <h2 id="progress-title" className="t-title-3">
          전체 진도
        </h2>
        <div className="mt-3 flex items-center gap-3">
          <div className="stage-track min-w-0 flex-1" style={{ height: "0.5rem" }} aria-hidden="true">
            <div className="stage-fill" style={{ width: `${percent}%` }} />
          </div>
          <p className="t-body-2 flex-none">{percent}%</p>
        </div>
        <p className="t-caption t-sub mt-1">
          지금 열린 레슨 {lessons.length}개 중 {completed}개 완료
        </p>
      </section>

      <BottomCta label={ctaLabel} onClick={() => router.push(target)} tabbed />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card-sub flex min-w-0 flex-col gap-1 px-3 py-3">
      <dt className="t-caption t-sub flex flex-col items-start gap-1">
        <span className="flex-none" style={{ color: "var(--primary)" }}>
          {icon}
        </span>
        <span className="min-w-0">{label}</span>
      </dt>
      <dd className="t-title-3">{value}</dd>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div aria-busy="true" aria-label="오늘의 학습을 불러오고 있어요">
      <h1 className="t-title-1">오늘의 학습</h1>
      <p className="t-body-2 t-sub mt-1">하루 15~20분이면 충분해요.</p>
      <div className="skeleton mt-6" style={{ height: "15rem", borderRadius: "var(--radius-card)" }} />
      <div className="skeleton mt-6" style={{ height: "4.5rem" }} />
    </div>
  );
}
