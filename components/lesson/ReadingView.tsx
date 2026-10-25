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
  // 실행 결과·정리는 필요할 때만 펼쳐서 화면을 짧게 유지해요
  const [panel, setPanel] = useState<"output" | "wrapUp" | null>(null);

  function openLine(n: number | null) {
    setOpen(n);
    if (n !== null) setSeen((s) => new Set(s).add(n));
  }
  const idx = open === null ? -1 : lines.indexOf(open);

  return (
    <article>
      <h1 className="t-title-2">{reading.title}</h1>
      <div className="mt-2">
        <Paragraphs items={reading.intro} className="t-body-2 t-sub" />
      </div>

      <div className="mt-4">
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

      <div className="mt-3 grid grid-cols-2 gap-2">
        {(
          [
            ["output", "실행 결과 보기"],
            ["wrapUp", "정리 보기"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className="choice min-h-11 justify-center p-2 t-body-2 font-semibold"
            data-selected={panel === key}
            aria-expanded={panel === key}
            aria-controls="reading-panel"
            onClick={() => setPanel(panel === key ? null : key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div id="reading-panel" className="mt-3" aria-live="polite">
        {panel === "output" && <OutputBlock output={reading.code.output} label="실행하면 이렇게 나와요" />}
        {panel === "wrapUp" && (
          <section className="callout flex-col gap-1">
            <h2 className="t-body-1 font-bold">정리</h2>
            <Paragraphs items={reading.wrapUp} className="t-body-2" />
          </section>
        )}
      </div>
    </article>
  );
}
