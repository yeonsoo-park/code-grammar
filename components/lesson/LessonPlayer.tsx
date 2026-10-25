"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lesson } from "@/lib/content/schema";
import { preloadPython } from "@/lib/runners/python";
import { recordAnswer, saveProgress, useAppState } from "@/lib/store";
import { BottomCta } from "../BottomCta";
import { ChoiceQuestionView } from "../ChoiceQuestionView";
import { IconBack, IconCheck } from "../icons";
import { STAGES, StageBar } from "../StageBar";
import { ConceptView } from "./ConceptView";
import { ReadingView } from "./ReadingView";
import { CodeTaskView, FillTaskView } from "./WritingTaskView";

type Step =
  | { stage: 0; kind: "concept"; index: number }
  | { stage: 1 | 3; kind: "question"; index: number }
  | { stage: 2; kind: "reading" }
  | { stage: 4; kind: "writing"; index: number }
  | { stage: 5; kind: "finish" };

function buildSteps(l: Lesson): Step[] {
  return [
    ...l.concept.screens.map((_, index) => ({ stage: 0 as const, kind: "concept" as const, index })),
    ...l.quiz.questions.map((_, index) => ({ stage: 1 as const, kind: "question" as const, index })),
    { stage: 2 as const, kind: "reading" as const },
    ...l.readingQuiz.questions.map((_, index) => ({ stage: 3 as const, kind: "question" as const, index })),
    ...l.writing.tasks.map((_, index) => ({ stage: 4 as const, kind: "writing" as const, index })),
    { stage: 5 as const, kind: "finish" as const },
  ];
}

/** 레슨 진행: 저장된 진도를 읽은 뒤에 시작해요 (그 전에는 스켈레톤) */
export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const state = useAppState();
  const steps = useMemo(() => buildSteps(lesson), [lesson]);
  if (!state) return <LessonSkeleton />;
  const saved = state.progress[lesson.meta.id];
  const start = saved && !saved.completedAt ? Math.min(saved.step, steps.length - 2) : 0;
  return <Player lesson={lesson} steps={steps} initialStep={start} />;
}

function Player({ lesson, steps, initialStep }: { lesson: Lesson; steps: Step[]; initialStep: number }) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(initialStep);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const topRef = useRef<HTMLHeadingElement>(null);
  const step = steps[stepIndex];
  const id = lesson.meta.id;

  // 단계 안에서 몇 번째인지 (진행 바 채우기용)
  const { inStage, stageSize } = useMemo(() => {
    const same = steps.filter((s) => s.stage === step.stage);
    return { inStage: same.indexOf(step), stageSize: same.length };
  }, [steps, step]);

  useEffect(() => {
    saveProgress(id, stepIndex, steps.length - 1, step.kind === "finish");
    // 독해 단계에 오면 Python을 미리 내려받아 둬요 (작문 단계에서 기다리지 않게)
    if (step.stage >= 2) preloadPython(lesson.meta.packages);
    window.scrollTo({ top: 0 });
    topRef.current?.focus({ preventScroll: true });
  }, [id, stepIndex, steps.length, step.kind, step.stage, lesson.meta.packages]);

  const next = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const back = () => (stepIndex > 0 ? setStepIndex((i) => i - 1) : router.push("/learn"));
  const onAnswered = (questionId: string) => (correct: boolean) => {
    recordAnswer(id, questionId, correct);
    setScore((s) => (correct ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 }));
  };

  const stage = Math.min(step.stage, 4);
  const stageInfo = STAGES[stage];

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20" style={{ background: "var(--bg)" }}>
        <div className="content flex items-center gap-2 py-2">
          <button type="button" className="icon-btn -ml-2" onClick={back} aria-label={stepIndex > 0 ? "이전 화면" : "학습 목록으로"}>
            <IconBack />
          </button>
          <div className="min-w-0 flex-1">
            <StageBar stage={step.kind === "finish" ? 5 : stage} fraction={stageSize ? (inStage + 1) / stageSize : 1} />
          </div>
        </div>
      </header>

      <main className="content pb-6 pt-5">
        <h2 ref={topRef} tabIndex={-1} className="t-caption t-sub mb-3 flex flex-wrap items-baseline justify-between gap-x-3 outline-none">
          {step.kind === "finish" ? (
            lesson.meta.title
          ) : (
            <>
              <span className="min-w-0">
                {stage + 1}단계&nbsp;{stageInfo.name}
                <span aria-hidden="true"> · </span>
                <span className="sr-only">, </span>영어의 {stageInfo.english}
              </span>
              {stageSize > 1 && (
                <span className="tabular-nums">
                  <span className="sr-only">진행 </span>
                  {inStage + 1}&nbsp;/&nbsp;{stageSize}
                </span>
              )}
            </>
          )}
        </h2>

        <StepView key={stepIndex} lesson={lesson} step={step} next={next} onAnswered={onAnswered} score={score} />
      </main>
    </div>
  );
}

function StepView({
  lesson,
  step,
  next,
  onAnswered,
  score,
}: {
  lesson: Lesson;
  step: Step;
  next: () => void;
  onAnswered: (questionId: string) => (correct: boolean) => void;
  score: { correct: number; wrong: number };
}) {
  switch (step.kind) {
    case "concept": {
      const screens = lesson.concept.screens;
      const last = step.index === screens.length - 1;
      return (
        <>
          <ConceptView screen={screens[step.index]} />
          <BottomCta label={last ? "문제 풀러 가기" : "다음"} onClick={next} />
        </>
      );
    }
    case "question": {
      const list = step.stage === 1 ? lesson.quiz.questions : lesson.readingQuiz.questions;
      const q = list[step.index];
      const last = step.index === list.length - 1;
      return (
        <ChoiceQuestionView
          question={q}
          onAnswered={onAnswered(q.id)}
          onNext={next}
          nextLabel={last ? (step.stage === 1 ? "독해하러 가기" : "작문하러 가기") : "다음 문제"}
        />
      );
    }
    case "reading":
      return (
        <>
          <ReadingView reading={lesson.reading} />
          <BottomCta label="독해 문제 풀기" onClick={next} />
        </>
      );
    case "writing": {
      const task = lesson.writing.tasks[step.index];
      return task.kind === "fill" ? (
        <FillTaskView task={task} packages={lesson.meta.packages} onNext={next} />
      ) : (
        <CodeTaskView task={task} packages={lesson.meta.packages} onNext={next} />
      );
    }
    case "finish":
      return <FinishView lesson={lesson} score={score} />;
  }
}

function FinishView({ lesson, score }: { lesson: Lesson; score: { correct: number; wrong: number } }) {
  const router = useRouter();
  const total = score.correct + score.wrong;
  return (
    <div>
      <p className="result-label-correct t-body-2 flex items-center gap-1.5">
        <IconCheck size={18} /> 레슨을 끝냈어요
      </p>
      <h1 className="t-title-1 mt-2">{lesson.meta.title}</h1>
      <p className="t-body-1 t-sub mt-2">{lesson.meta.summary}</p>

      {total > 0 && (
        <dl className="mt-8 grid grid-cols-2 border-y py-4" style={{ borderColor: "var(--border)" }}>
          <div>
            <dt className="t-caption t-sub">맞힌 문제</dt>
            <dd className="t-title-2 mt-0.5 tabular-nums">
              {score.correct}&nbsp;/&nbsp;{total}
            </dd>
          </div>
          <div>
            <dt className="t-caption t-sub">오답노트에 담은 문제</dt>
            <dd className="t-title-2 mt-0.5 tabular-nums">{score.wrong}개</dd>
          </div>
        </dl>
      )}

      <section className="mt-8">
        <h2 className="section-title">이번 레슨의 단어장</h2>
        <dl className="divided">
          {lesson.meta.keywords.map((k) => (
            <div key={k.term} className="grid gap-x-4 gap-y-0.5 py-3 sm:grid-cols-[7rem_1fr]">
              <dt>
                <code className="inline-code">{k.term}</code>
              </dt>
              <dd className="t-body-2 t-sub">{k.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>

      {score.wrong > 0 && (
        <p className="t-body-2 mt-6">
          틀린 문제는 내일 <Link href="/review">오답노트</Link>에서 다시 만나요.
        </p>
      )}

      <BottomCta label="홈으로" onClick={() => router.push("/")} />
    </div>
  );
}

export function LessonSkeleton() {
  return (
    <div aria-busy="true" aria-label="레슨을 불러오고 있어요">
      <div className="content py-4">
        <div className="skeleton" style={{ height: "2.25rem" }} />
      </div>
      <div className="content flex flex-col gap-4 pt-6">
        <div className="skeleton" style={{ height: "1rem", width: "40%" }} />
        <div className="skeleton" style={{ height: "2.25rem", width: "80%" }} />
        <div className="skeleton" style={{ height: "6rem" }} />
        <div className="skeleton" style={{ height: "9rem" }} />
      </div>
    </div>
  );
}
