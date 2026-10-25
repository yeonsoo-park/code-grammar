"use client";

import { useEffect, useRef, useState } from "react";
import { tokenizeLine } from "@/lib/highlight";
import { RichText } from "./RichText";
import { IconCheck, IconCopy } from "./icons";

type Props = {
  code: string;
  lang?: "python" | "sql";
  label?: string;
  /** 독해 단계: 줄 번호 → 해석. 있으면 줄을 눌러 해석을 펼칠 수 있어요 */
  notes?: Record<number, string>;
  /** 펼친 줄 (부모가 관리하고 싶을 때) */
  openLine?: number | null;
  onOpenLine?: (line: number | null) => void;
  copyable?: boolean;
};

export function CodeBlock({ code, lang = "python", label, notes, openLine, onOpenLine, copyable = true }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localOpen, setLocalOpen] = useState<number | null>(null);
  const open = openLine !== undefined ? openLine : localOpen;
  const setOpen = onOpenLine ?? setLocalOpen;
  const lines = code.split("\n");

  // 가로로 더 볼 내용이 있으면 오른쪽 페이드를 보여줘요. 줄 해석 폭은 보이는 영역에 맞춰요.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const more = el.scrollWidth - el.clientWidth - el.scrollLeft > 4;
      setScrollable(more);
      el.style.setProperty("--code-viewport", `${el.clientWidth}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [code]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  const interactive = !!notes;

  return (
    <div ref={rootRef} className="code-block" data-scrollable={scrollable}>
      <div className="code-block-header">
        <span className="t-caption t-sub">{label ?? (lang === "python" ? "Python" : "SQL")}</span>
        {copyable && (
          <button type="button" className="icon-btn" onClick={copy} aria-label={copied ? "복사했어요" : "코드 복사"}>
            {copied ? <IconCheck size={20} /> : <IconCopy size={20} />}
          </button>
        )}
      </div>
      <div ref={scrollRef} className="code-scroll" tabIndex={0} role="region" aria-label={`${label ?? "코드"} (가로로 스크롤할 수 있어요)`}>
        <div className="code-lines">
          {lines.map((line, i) => {
            const n = i + 1;
            const note = notes?.[n];
            const content = (
              <>
                <span className="code-line-num">{n}</span>
                <span className="code-line-text">
                  {line === "" ? " " : tokenizeLine(line, lang).map((t, j) =>
                    t.type === "plain" ? t.text : <span key={j} className={`tok-${t.type}`}>{t.text}</span>,
                  )}
                </span>
              </>
            );
            if (interactive && note) {
              const isOpen = open === n;
              return (
                <div key={n}>
                  <button
                    type="button"
                    className="code-line code-line-has-note"
                    aria-expanded={isOpen}
                    aria-controls={`note-${n}`}
                    aria-label={`${n}번째 줄 해석 ${isOpen ? "접기" : "펼치기"}: ${line.trim()}`}
                    onClick={() => setOpen(isOpen ? null : n)}
                  >
                    {content}
                  </button>
                  {isOpen && (
                    <div id={`note-${n}`} className="code-note t-body-2" role="note">
                      <RichText text={note} />
                    </div>
                  )}
                </div>
              );
            }
            return (
              <div key={n} className="code-line">
                {content}
              </div>
            );
          })}
        </div>
      </div>
      <div className="code-fade" aria-hidden="true" />
    </div>
  );
}

export function OutputBlock({ output, label = "출력 결과" }: { output: string; label?: string }) {
  return (
    <div>
      <p className="t-caption t-sub mb-1">{label}</p>
      <pre className="output-block" tabIndex={0} aria-label={label}>
        {output}
      </pre>
    </div>
  );
}
