"use client";

import { useId, useState } from "react";
import { QUESTION_KIND_LABEL, type ChoiceQuestion } from "@/lib/content/schema";
import { BottomCta } from "./BottomCta";
import { BottomSheet } from "./BottomSheet";
import { CodeBlock } from "./CodeBlock";
import { IconCheck, IconX } from "./icons";
import { Paragraphs, RichText } from "./RichText";

const LETTERS = ["A", "B", "C", "D", "E"];

/**
 * 객관식 문제 한 개 (한 화면에 문제 하나)
 * 고르기 → 확인하기 → 정답/오답 표시(아이콘+문구+색) → 해설 시트(정답 이유 → 오답 이유)
 */
export function ChoiceQuestionView({
  question,
  onAnswered,
  onNext,
  nextLabel = "다음",
  header,
}: {
  question: ChoiceQuestion;
  onAnswered: (correct: boolean) => void;
  onNext: () => void;
  nextLabel?: string;
  header?: React.ReactNode;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [graded, setGraded] = useState(false);
  const name = useId();
  const correct = selected === question.answer;
  const answerIndex = question.choices.findIndex((c) => c.id === question.answer);
  const isCompare = question.kind === "compare-efficiency";

  function grade() {
    if (!selected) return;
    setGraded(true);
    onAnswered(selected === question.answer);
  }

  return (
    <div>
      {header}
      <p className="badge badge-neutral mb-3">{QUESTION_KIND_LABEL[question.kind]}</p>
      <fieldset>
        <legend className="t-title-2 mb-5">
          <span className="prose-flow block">
            {question.prompt.map((p, i) => (
              <span key={i} className="block">
                <RichText text={p} />
              </span>
            ))}
          </span>
        </legend>

        {question.code && (
          <div className="mb-5">
            <CodeBlock code={question.code.code} lang={question.code.lang} />
          </div>
        )}

        <div className="flex flex-col gap-3">
          {question.choices.map((c, i) => {
            const isSelected = selected === c.id;
            const result = graded ? (c.id === question.answer ? "correct" : isSelected ? "wrong" : undefined) : undefined;
            return (
              <label
                key={c.id}
                className="choice"
                data-selected={isSelected}
                data-result={result}
                data-disabled={graded}
              >
                <input
                  type="radio"
                  name={name}
                  value={c.id}
                  className="sr-only"
                  checked={isSelected}
                  disabled={graded}
                  onChange={() => setSelected(c.id)}
                />
                <span className="choice-mark" aria-hidden="true">
                  {result === "correct" ? <IconCheck size={16} /> : result === "wrong" ? <IconX size={16} /> : LETTERS[i]}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  {c.text && (
                    <span className={isCompare ? "font-bold" : ""}>
                      <RichText text={c.text} />
                    </span>
                  )}
                  {c.code && (
                    <span className="block min-w-0">
                      {isCompare || c.code.includes("\n") ? (
                        <CodeBlock code={c.code} copyable={false} label={isCompare ? `코드 ${c.text ?? LETTERS[i]}` : undefined} />
                      ) : (
                        <code className="inline-code">{c.code}</code>
                      )}
                    </span>
                  )}
                  {result && (
                    <span className={`t-body-2 ${result === "correct" ? "result-label-correct" : "result-label-wrong"}`}>
                      {result === "correct" ? "정답" : "내가 고른 답"}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div aria-live="polite" className="sr-only">
        {graded ? (correct ? "정답이에요" : `아쉬워요. 정답은 ${LETTERS[answerIndex]}예요`) : ""}
      </div>

      {!graded ? (
        <BottomCta label="확인하기" onClick={grade} disabled={!selected} disabledReason="답을 하나 골라 주세요" />
      ) : (
        <BottomSheet
          tone={correct ? "correct" : "wrong"}
          title={
            correct ? (
              <>
                <IconCheck /> 정답이에요
              </>
            ) : (
              <>
                <IconX /> 한 번 더 볼까요? 정답은 {LETTERS[answerIndex]}예요
              </>
            )
          }
          actionLabel={nextLabel}
          onAction={onNext}
        >
          <Paragraphs items={question.explanation} />
          <div className="mt-5 flex flex-col gap-3">
            {question.choices
              .map((c, i) => ({ c, i }))
              .sort((a, b) => Number(b.c.id === question.answer) - Number(a.c.id === question.answer))
              .map(({ c, i }) => {
                const isAnswer = c.id === question.answer;
                return (
                  <div key={c.id} className="card-sub">
                    <p className={`t-body-2 mb-1 flex items-center gap-1 ${isAnswer ? "result-label-correct" : "t-sub"}`}>
                      {isAnswer ? <IconCheck size={18} /> : <IconX size={18} />}
                      {LETTERS[i]} {isAnswer ? "정답인 이유" : "틀린 이유"}
                      {c.id === selected && !isAnswer ? " (내가 고른 답)" : ""}
                    </p>
                    <p className="t-body-2">
                      <RichText text={c.why} />
                    </p>
                  </div>
                );
              })}
          </div>
          {!correct && <p className="t-body-2 t-sub mt-4">이 문제는 오답노트에 담아 둘게요. 내일 다시 나와요.</p>}
        </BottomSheet>
      )}
    </div>
  );
}
