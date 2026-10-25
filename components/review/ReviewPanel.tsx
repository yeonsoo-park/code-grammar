"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ChoiceQuestion } from "@/lib/content/schema";
import { INTERVALS, isDue, isGraduated, type ReviewItem } from "@/lib/srs";
import { recordAnswer, useAppState } from "@/lib/store";
import { BottomCta } from "../BottomCta";
import { ChoiceQuestionView } from "../ChoiceQuestionView";
import { IconCheck } from "../icons";
import { RichText } from "../RichText";

export type ReviewQuestion = { lessonId: string; lessonTitle: string; question: ChoiceQuestion };

function dueLabel(r: ReviewItem) {
  if (isGraduated(r)) return "다 외웠어요";
  if (isDue(r)) return "오늘 복습";
  const days = Math.max(1, Math.ceil((new Date(r.due).getTime() - Date.now()) / 86_400_000));
  return `${days}일 뒤 복습`;
}

/** 오답노트: 틀린 문제를 1·3·7·14일 간격으로 다시 풀어요 */
export function ReviewPanel({ questions }: { questions: Record<string, ReviewQuestion> }) {
  const state = useAppState();
  const router = useRouter();
  const [session, setSession] = useState<string[] | null>(null);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);

  if (!state) {
    return (
      <div aria-busy="true" aria-label="오답노트를 불러오고 있어요">
        <h1 className="t-title-1">오답노트</h1>
        <div className="skeleton mt-6" style={{ height: "5rem" }} />
        <div className="skeleton mt-3" style={{ height: "5rem" }} />
      </div>
    );
  }

  const items = Object.values(state.reviews).filter((r) => questions[r.questionId]);
  const due = items.filter((r) => isDue(r));

  // 복습 세션 진행 중
  if (session) {
    if (index >= session.length) {
      const ok = results.filter(Boolean).length;
      return (
        <div>
          <p className="result-label-correct t-title-3 flex items-center gap-2">
            <IconCheck /> 오늘 복습을 끝냈어요
          </p>
          <h1 className="t-title-1 mt-2">
            {session.length}문제 중 {ok}문제를 맞혔어요
          </h1>
          <p className="t-body-1 t-sub mt-3">맞힌 문제는 다음 간격({INTERVALS.join("·")}일)으로 넘어가고, 틀린 문제는 내일 다시 나와요.</p>
          <BottomCta
            label="오답노트로 돌아가기"
            onClick={() => {
              setSession(null);
              setIndex(0);
              setResults([]);
            }}
            tabbed
          />
        </div>
      );
    }
    const qid = session[index];
    const rq = questions[qid];
    return (
      <div>
        <p className="t-caption t-sub mb-4">
          복습 {index + 1}/{session.length} · {rq.lessonTitle}
        </p>
        <ChoiceQuestionView
          key={qid}
          question={rq.question}
          onAnswered={(correct) => {
            recordAnswer(rq.lessonId, qid, correct);
            setResults((r) => [...r, correct]);
          }}
          onNext={() => setIndex((i) => i + 1)}
          nextLabel={index === session.length - 1 ? "복습 마치기" : "다음 문제"}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <h1 className="t-title-1">오답노트</h1>
        <div className="card-sub mt-6 text-center">
          <p className="t-title-3">아직 틀린 문제가 없어요</p>
          <p className="t-body-2 t-sub mt-2">레슨에서 틀린 문제는 여기에 모여요. 1일·3일·7일·14일 뒤에 다시 풀면서 오래 기억하게 돼요.</p>
        </div>
        <BottomCta label="레슨 풀러 가기" onClick={() => router.push("/learn")} tabbed />
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => Number(isDue(b)) - Number(isDue(a)) || (a.due || "z").localeCompare(b.due || "z"));

  return (
    <div>
      <h1 className="t-title-1">오답노트</h1>
      <p className="t-body-2 t-sub mt-1">
        {due.length ? `오늘 복습할 문제가 ${due.length}개 있어요.` : "오늘 복습할 문제는 없어요. 다음 복습일에 다시 알려 드릴게요."}
      </p>
      <ul className="mt-6 flex flex-col gap-2">
        {sorted.map((r) => {
          const rq = questions[r.questionId];
          return (
            <li key={r.questionId} className="card-sub flex flex-col gap-1">
              <p className="t-caption t-sub">
                {rq.lessonTitle} · 틀린 횟수 {r.wrongCount}번
              </p>
              <p className="t-body-1">
                <RichText text={rq.question.prompt.join(" ")} />
              </p>
              <p className={`t-caption ${isDue(r) ? "result-label-wrong" : "t-sub"}`}>{dueLabel(r)}</p>
            </li>
          );
        })}
      </ul>
      <BottomCta
        label={due.length ? `복습 시작 (${due.length}문제)` : "복습할 문제가 없어요"}
        onClick={() => setSession(due.map((r) => r.questionId))}
        disabled={!due.length}
        disabledReason="오늘은 쉬어도 돼요. 다음 복습일에 문제가 열려요."
        tabbed
      />
    </div>
  );
}
