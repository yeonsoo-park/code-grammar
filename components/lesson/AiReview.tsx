"use client";

import Link from "next/link";
import { useState } from "react";
import { diffLines, hasChanges } from "@/lib/review/diff";
import type { ReviewResponse, ReviewResult } from "@/lib/review/schema";
import { getSupabase } from "@/lib/supabase";
import { IconAlert, IconBulb, IconCheck } from "../icons";
import { Illustration } from "../Illustration";
import { RichText } from "../RichText";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; result: ReviewResult; remaining: number }
  | { kind: "signed-out" }
  | { kind: "error"; message: string; retry: boolean };

const SCORES: { key: keyof ReviewResult["scores"]; label: string; tint: string }[] = [
  { key: "accuracy", label: "정확성", tint: "tint-green" },
  { key: "readability", label: "가독성", tint: "tint-violet" },
  { key: "efficiency", label: "효율성", tint: "tint-orange" },
];

const POINT_STYLE = {
  good: { label: "잘한 점", Icon: IconCheck, color: "var(--correct-strong)" },
  fix: { label: "고칠 점", Icon: IconAlert, color: "var(--warning-strong)" },
  tip: { label: "팁", Icon: IconBulb, color: "var(--primary-strong)" },
} as const;

/**
 * AI 첨삭: 작문을 통과한 뒤 받을 수 있어요.
 * 정확성·가독성·효율성 점수 → 피드백 → 바뀐 줄만 강조한 비교
 */
export function AiReview({ lessonId, taskId, code, stdout }: { lessonId: string; taskId: string; code: string; stdout: string }) {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function request() {
    const sb = getSupabase();
    const session = sb ? (await sb.auth.getSession()).data.session : null;
    if (!session) return setState({ kind: "signed-out" });
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ lessonId, taskId, code, stdout }),
      });
      const data = (await res.json()) as ReviewResponse;
      if (data.ok) return setState({ kind: "done", result: data.result, remaining: data.remainingToday });
      if (data.reason === "signed-out") return setState({ kind: "signed-out" });
      setState({ kind: "error", message: data.message, retry: data.reason === "busy" || data.reason === "failed" || data.reason === "refused" });
    } catch {
      setState({ kind: "error", message: navigator.onLine ? "첨삭을 받지 못했어요. 다시 시도해 주세요." : "인터넷 연결을 확인해 주세요.", retry: true });
    }
  }

  return (
    <section className="card mt-4" aria-labelledby="ai-review-title" aria-busy={state.kind === "loading"}>
      <div className="flex items-center gap-3">
        <Illustration name="pencil" tone="violet" size={40} className="flex-none" />
        <div className="min-w-0">
          <h3 id="ai-review-title" className="t-title-3">
            AI 첨삭
          </h3>
          <p className="t-caption t-sub">영작 첨삭처럼 정확성·가독성·효율성을 봐 드려요</p>
        </div>
      </div>

      <div className="mt-3" aria-live="polite">
        {state.kind === "idle" && (
          <button type="button" className="choice min-h-12 justify-center t-body-1 font-semibold" style={{ color: "var(--primary-strong)" }} onClick={request}>
            AI 첨삭 받기
          </button>
        )}

        {state.kind === "loading" && (
          <div>
            <p className="t-body-2 t-sub">코드를 읽고 첨삭하고 있어요. 10~20초쯤 걸려요.</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton" style={{ height: "4.5rem" }} />
              ))}
            </div>
            <div className="skeleton mt-2" style={{ height: "5rem" }} />
          </div>
        )}

        {state.kind === "signed-out" && (
          <p className="t-body-2">
            로그인하면 AI 첨삭을 받을 수 있어요.{" "}
            <Link href="/login" className="font-semibold">
              로그인하기
            </Link>
          </p>
        )}

        {state.kind === "error" && (
          <div role="alert">
            <p className="t-body-2">{state.message}</p>
            {state.retry && (
              <button type="button" className="btn-text btn-text-strong -ml-3 mt-1" onClick={request}>
                다시 시도
              </button>
            )}
          </div>
        )}

        {state.kind === "done" && <ReviewView result={state.result} code={code} remaining={state.remaining} />}
      </div>
    </section>
  );
}

function ReviewView({ result, code, remaining }: { result: ReviewResult; code: string; remaining: number }) {
  const diff = diffLines(code, result.improved_code);
  const changed = hasChanges(diff);
  return (
    <div>
      <dl className="grid grid-cols-3 gap-2">
        {SCORES.map(({ key, label, tint }) => {
          const score = result.scores[key];
          return (
            <div key={key} className={`tile ${tint} gap-1 p-3`}>
              <dt className="t-caption t-sub">{label}</dt>
              <dd className="t-title-2 tabular-nums" aria-label={`5점 만점에 ${score}점`}>
                {score}
                <span className="t-caption t-sub font-normal">&nbsp;/&nbsp;5</span>
              </dd>
              <span className="flex gap-0.5" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className="h-1.5 flex-1 rounded-full" style={{ background: n <= score ? "var(--primary)" : "var(--bg-pressed)" }} />
                ))}
              </span>
            </div>
          );
        })}
      </dl>

      <p className="t-body-1 mt-4 font-semibold">
        <RichText text={result.summary} />
      </p>

      <ul className="mt-3 flex flex-col gap-2.5">
        {result.points.map((p, i) => {
          const s = POINT_STYLE[p.kind];
          return (
            <li key={i} className="flex items-start gap-2">
              <s.Icon size={18} className="mt-0.5 flex-none" style={{ color: s.color }} />
              <p className="t-body-2 min-w-0">
                <span className="font-semibold" style={{ color: s.color }}>
                  {s.label}
                </span>{" "}
                <RichText text={p.text} />
              </p>
            </li>
          );
        })}
      </ul>

      <h4 className="t-body-2 mt-5 font-semibold">{changed ? "이렇게 고쳐 보세요" : "고칠 곳이 없어요"}</h4>
      {changed && (
        <div className="code-block mt-2">
          <div className="code-scroll pt-3" tabIndex={0} role="region" aria-label="고친 코드 비교 (가로로 스크롤할 수 있어요)">
            <div className="code-lines">
              {diff.map((line, i) => (
                <div
                  key={i}
                  className="code-line"
                  style={{
                    background: line.type === "add" ? "var(--correct-weak)" : line.type === "del" ? "var(--wrong-weak)" : undefined,
                  }}
                >
                  <span className="code-line-num" style={{ background: "transparent" }} aria-hidden="true">
                    {line.type === "add" ? "+" : line.type === "del" ? "−" : " "}
                  </span>
                  <span className="sr-only">{line.type === "add" ? "더한 줄: " : line.type === "del" ? "지운 줄: " : ""}</span>
                  <span className="code-line-text" style={line.type === "del" ? { textDecoration: "line-through", color: "var(--text-sub)" } : undefined}>
                    {line.text || " "}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <p className="t-caption t-sub mt-3">오늘 남은 첨삭 {remaining}번 · AI가 쓴 첨삭이라 틀릴 수 있어요</p>
    </div>
  );
}
