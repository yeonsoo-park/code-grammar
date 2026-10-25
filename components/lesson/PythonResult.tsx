"use client";

import { explainError } from "@/lib/python-errors";
import type { PyResult } from "@/lib/runners/python";
import { OutputBlock } from "../CodeBlock";
import { IconAlert } from "../icons";
import { RichText } from "../RichText";

/** 코드 실행 결과: 에러면 쉬운 설명을 먼저, 원문은 접어서 보여줘요 */
export function PythonResult({ result }: { result: PyResult }) {
  if (result.error) {
    const f = explainError(result.error);
    return (
      <div className="flex flex-col gap-3">
        {result.stdout && <OutputBlock output={result.stdout} label="에러가 나기 전까지의 출력" />}
        <div className="card-sub" role="alert">
          <p className="t-title-3 flex items-start gap-2" style={{ color: "var(--wrong-strong)" }}>
            <IconAlert className="mt-0.5 flex-none" />
            <span className="min-w-0">{f.title}</span>
          </p>
          <p className="t-body-2 mt-2">
            <RichText text={f.detail} />
          </p>
          <p className="t-body-2 t-sub mt-2">
            <RichText text={f.tip} />
          </p>
          <details className="mt-3">
            <summary className="t-body-2 btn-text -ml-3 cursor-pointer">원문 에러 메시지 보기</summary>
            <pre className="output-block mt-2 t-caption" tabIndex={0}>
              {result.error.type}: {result.error.message}
            </pre>
          </details>
        </div>
      </div>
    );
  }
  return <OutputBlock output={result.stdout || "(출력이 없어요. print()로 값을 보여줄 수 있어요)"} />;
}

export function PythonLoading({ label = "Python을 준비하고 있어요. 처음 한 번만 몇 초 걸려요." }: { label?: string }) {
  return (
    <div aria-live="polite">
      <p className="t-body-2 t-sub mb-2">{label}</p>
      <div className="skeleton" style={{ height: "4.5rem" }} />
    </div>
  );
}
