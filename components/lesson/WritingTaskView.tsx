"use client";

import { Fragment, useRef, useState } from "react";
import type { CodeTask, FillTask } from "@/lib/content/schema";
import { runPython, PythonTimeoutError, type PyResult } from "@/lib/runners/python";
import { useKeyboardInset } from "@/lib/useKeyboardInset";
import { BottomCta } from "../BottomCta";
import { BottomSheet } from "../BottomSheet";
import { CodeBlock, OutputBlock } from "../CodeBlock";
import { CodeEditor, KeyBar, type EditorHandle } from "../CodeEditor";
import { IconBulb, IconCheck, IconX } from "../icons";
import { Paragraphs, RichText } from "../RichText";
import { PythonLoading, PythonResult } from "./PythonResult";

const LEVEL_LABEL = { fill: "1단계 빈칸 채우기", translate: "2단계 번역하기", free: "3단계 자유 작성" };

type RunState = { status: "idle" } | { status: "running" } | { status: "done"; result: PyResult } | { status: "failed"; message: string };

async function safeRun(code: string, checks: string[], packages: string[]): Promise<RunState> {
  try {
    return { status: "done", result: await runPython(code, checks, packages) };
  } catch (e) {
    return {
      status: "failed",
      message:
        e instanceof PythonTimeoutError
          ? "코드가 10초 안에 끝나지 않았어요. 끝나지 않는 반복이 있는지 확인해 볼까요?"
          : "Python을 불러오지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.",
    };
  }
}

/* ───────────── 1단계: 빈칸 채우기 ───────────── */

export function FillTaskView({ task, packages, onNext }: { task: FillTask; packages: string[]; onNext: () => void }) {
  const parts = task.template.split("___");
  const [values, setValues] = useState<string[]>(() => task.blanks.map(() => ""));
  const [checked, setChecked] = useState<boolean[] | null>(null);
  const [run, setRun] = useState<RunState>({ status: "idle" });
  const [revealed, setRevealed] = useState(false);
  const allCorrect = checked?.every(Boolean) ?? false;
  const empty = values.some((v) => v.trim() === "");

  async function check() {
    const results = task.blanks.map((b, i) => b.accept.includes(values[i].trim()));
    setChecked(results);
    if (results.every(Boolean)) {
      let code = task.template;
      values.forEach((v) => (code = code.replace("___", v.trim())));
      setRun({ status: "running" });
      setRun(await safeRun(code, [], packages));
    }
  }

  // 템플릿을 줄 단위로 그리면서 ___ 자리에 입력칸을 넣어요
  let blankIndex = 0;
  const lines = parts
    .flatMap((p, i) => (i < parts.length - 1 ? [p, null] : [p]))
    .reduce<(string | null)[][]>(
      (acc, piece) => {
        if (piece === null) acc[acc.length - 1].push(null);
        else
          piece.split("\n").forEach((seg, j) => {
            if (j > 0) acc.push([]);
            acc[acc.length - 1].push(seg);
          });
        return acc;
      },
      [[]],
    );

  return (
    <div>
      <p className="badge mb-3">{LEVEL_LABEL.fill}</p>
      <h1 className="t-title-2 mb-3">{task.title}</h1>
      <Paragraphs items={task.prompt} />

      <div className="code-block mt-5">
        <div className="code-block-header">
          <span className="t-caption t-sub">Python</span>
        </div>
        <div className="code-scroll px-4 pt-1">
          <div className="code-lines">
            {lines.map((segs, li) => (
              <div key={li} className="code-line items-center" style={{ minHeight: "2.5rem" }}>
                {segs.map((seg, si) => {
                  if (seg !== null) return <Fragment key={si}>{seg}</Fragment>;
                  const i = blankIndex++;
                  const result = checked ? (checked[i] ? "correct" : "wrong") : undefined;
                  return (
                    <input
                      key={si}
                      className="blank-input mx-1"
                      value={values[i]}
                      size={Math.max(4, values[i].length + 1)}
                      aria-label={`빈칸 ${i + 1}`}
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                      data-result={result}
                      aria-invalid={result === "wrong" || undefined}
                      onChange={(e) => {
                        const next = [...values];
                        next[i] = e.target.value;
                        setValues(next);
                        setChecked(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && !empty && check()}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {checked && !allCorrect && (
        <div className="card-sub mt-4" role="alert">
          <p className="t-body-1 result-label-wrong flex items-center gap-2">
            <IconX size={20} /> 아직 아니에요
          </p>
          {task.blanks.map((b, i) =>
            checked[i] ? null : (
              <p key={i} className="t-body-2 mt-2 flex items-start gap-2">
                <IconBulb size={18} className="mt-0.5 flex-none" />
                <span className="min-w-0">
                  빈칸 {i + 1}: <RichText text={b.hint} />
                </span>
              </p>
            ),
          )}
          {revealed ? (
            <p className="t-body-2 mt-3">
              정답: {task.blanks.map((b) => <code key={b.accept[0]} className="inline-code mr-1">{b.accept[0]}</code>)}
            </p>
          ) : (
            <button type="button" className="btn-text -ml-3 mt-1" onClick={() => setRevealed(true)}>
              정답 보기
            </button>
          )}
        </div>
      )}

      {allCorrect ? (
        <BottomSheet
          tone="correct"
          title={
            <>
              <IconCheck /> 정답이에요
            </>
          }
          actionLabel="다음"
          onAction={onNext}
        >
          <Paragraphs items={task.explanation} />
          <div className="mt-4">
            {run.status === "running" && <PythonLoading label="코드를 실행하고 있어요" />}
            {run.status === "done" && <PythonResult result={run.result} />}
            {run.status === "failed" && <OutputBlock output={task.output} label="출력 결과 (예시)" />}
          </div>
        </BottomSheet>
      ) : (
        <BottomCta label="확인하기" onClick={check} disabled={empty} disabledReason="빈칸을 채워 주세요" />
      )}
    </div>
  );
}

/* ───────────── 2·3단계: 번역하기 · 자유 작성 ───────────── */

export function CodeTaskView({ task, packages, onNext }: { task: CodeTask; packages: string[]; onNext: () => void }) {
  useKeyboardInset();
  const [code, setCode] = useState(task.starter);
  const [run, setRun] = useState<RunState>({ status: "idle" });
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [editorFocused, setEditorFocused] = useState(false);
  const [finished, setFinished] = useState(false);
  const editor = useRef<EditorHandle | null>(null);

  const hasCode = code.split("\n").some((l) => l.trim() !== "" && !l.trim().startsWith("#"));
  const running = run.status === "running";
  const result = run.status === "done" ? run.result : null;
  const passedAll = !!result && !result.error && result.checks.length === task.checks.length && result.checks.every(Boolean);

  async function grade() {
    setRun({ status: "running" });
    setAttempts((n) => n + 1);
    const next = await safeRun(code, task.checks.map((c) => c.code), packages);
    setRun(next);
    if (next.status === "done" && !next.result.error && next.result.checks.every(Boolean)) setFinished(true);
  }

  return (
    <div>
      <p className="badge mb-3">{LEVEL_LABEL[task.kind]}</p>
      <h1 className="t-title-2 mb-3">{task.title}</h1>
      <Paragraphs items={task.prompt} />

      <div className="card mt-5">
        <h2 className="section-title">요구사항</h2>
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 marker:text-[var(--text-sub)]">
          {task.requirements.map((r, i) => (
            <li key={i} className="t-body-1">
              <RichText text={r} />
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-5">
        <CodeEditor
          initial={task.starter}
          onChange={(v) => {
            setCode(v);
            if (run.status !== "idle" && !finished) setRun({ status: "idle" });
          }}
          label={`${task.title} 코드 입력`}
          handleRef={editor}
          onFocusChange={setEditorFocused}
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        <button type="button" className="btn-text -ml-3" onClick={() => setShowHint((v) => !v)} aria-expanded={showHint}>
          <IconBulb size={18} /> {showHint ? "힌트 접기" : "힌트 보기"}
        </button>
        {attempts > 0 && (
          <button type="button" className="btn-text" onClick={() => setShowSolution((v) => !v)} aria-expanded={showSolution}>
            {showSolution ? "모범 답안 접기" : "모범 답안 보기"}
          </button>
        )}
      </div>
      {showHint && (
        <p className="banner mt-2">
          <IconBulb size={18} className="mt-1 flex-none" />
          <span>
            <RichText text={task.hint} />
          </span>
        </p>
      )}
      {showSolution && (
        <div className="mt-3">
          <CodeBlock code={task.solution} label="모범 답안" />
        </div>
      )}

      <div className="mt-5" aria-live="polite">
        {running && <PythonLoading label="코드를 실행하고 채점하고 있어요" />}
        {run.status === "failed" && (
          <div className="card-sub" role="alert">
            <p className="t-body-1">{run.message}</p>
          </div>
        )}
        {result && !passedAll && (
          <div className="flex flex-col gap-4">
            <PythonResult result={result} />
            {!result.error && <CheckList task={task} results={result.checks} />}
          </div>
        )}
      </div>

      {finished && result ? (
        <BottomSheet
          tone="correct"
          title={
            <>
              <IconCheck /> 통과했어요
            </>
          }
          actionLabel="다음"
          onAction={onNext}
        >
          <CheckList task={task} results={result.checks} />
          <div className="mt-4">
            <PythonResult result={result} />
          </div>
          <div className="mt-5">
            <Paragraphs items={task.explanation} />
          </div>
          <div className="mt-4">
            <CodeBlock code={task.solution} label="모범 답안과 비교해 보세요" />
          </div>
          <p className="t-body-2 t-sub mt-4">정확성·가독성·효율성 점수와 고친 코드를 보여주는 AI 첨삭은 곧 열려요.</p>
        </BottomSheet>
      ) : (
        <BottomCta
          label={running ? "실행하는 중…" : attempts > 0 ? "다시 채점하기" : "실행하고 채점하기"}
          onClick={grade}
          disabled={!hasCode || running}
          disabledReason={running ? "결과를 기다리고 있어요" : "코드를 입력해 주세요"}
          busy={running}
        >
          {editorFocused && <KeyBar onKey={(k) => editor.current?.insert(k)} />}
        </BottomCta>
      )}
    </div>
  );
}

function CheckList({ task, results }: { task: CodeTask; results: boolean[] }) {
  return (
    <ul className="flex flex-col gap-2" aria-label="채점 결과">
      {task.checks.map((c, i) => {
        const ok = results[i];
        return (
          <li key={i} className="t-body-2 flex items-start gap-2">
            <span className={`mt-0.5 flex-none ${ok ? "result-label-correct" : "result-label-wrong"}`}>
              {ok ? <IconCheck size={18} /> : <IconX size={18} />}
            </span>
            <span className="min-w-0">
              <span className="sr-only">{ok ? "통과: " : "미통과: "}</span>
              <RichText text={ok ? c.pass : c.fail} />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
