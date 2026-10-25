"use client";

import { useState } from "react";
import type { Reading } from "@/lib/content/schema";
import { CodeBlock, OutputBlock } from "../CodeBlock";
import { Paragraphs } from "../RichText";

/** 3단계 독해: 실제 분석 코드를 한 줄씩 끊어 읽기 (직독직해) */
export function ReadingView({ reading }: { reading: Reading }) {
  const notes = Object.fromEntries(reading.notes.map((n) => [n.line, n.text]));
  const lines = reading.notes.map((n) => n.line);
  const [open, setOpen] = useState<number | null>(lines[0] ?? null);
  const [seen, setSeen] = useState<Set<number>>(() => new Set(lines.slice(0, 1)));
  const [showOutput, setShowOutput] = useState(false);

  function openLine(n: number | null) {
    setOpen(n);
    if (n !== null) setSeen((s) => new Set(s).add(n));
  }
  const idx = open === null ? -1 : lines.indexOf(open);

  return (
    <article>
      <h1 className="t-title-1">{reading.title}</h1>
      <div className="mt-4">
        <Paragraphs items={reading.intro} />
      </div>

      <div className="mt-6">
        <CodeBlock code={reading.code.code} lang={reading.code.lang} label="독해 지문" notes={notes} openLine={open} onOpenLine={openLine} />
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="t-caption t-sub">
          {seen.size} / {lines.length}줄 해석을 읽었어요
        </p>
        <div className="flex gap-1">
          <button type="button" className="btn-text" disabled={idx <= 0} onClick={() => openLine(lines[idx - 1])}>
            이전 줄
          </button>
          <button
            type="button"
            className="btn-text btn-text-strong"
            disabled={idx >= lines.length - 1}
            onClick={() => openLine(lines[idx + 1] ?? lines[0])}
          >
            다음 줄
          </button>
        </div>
      </div>

      <div className="mt-6">
        {showOutput ? (
          <OutputBlock output={reading.code.output} label="실행하면 이렇게 나와요" />
        ) : (
          <button type="button" className="btn-text btn-text-strong -ml-3" onClick={() => setShowOutput(true)}>
            실행 결과 보기
          </button>
        )}
      </div>

      <div className="card-sub mt-6">
        <h2 className="t-title-3 mb-2">정리</h2>
        <Paragraphs items={reading.wrapUp} className="t-body-2" />
      </div>
    </article>
  );
}
