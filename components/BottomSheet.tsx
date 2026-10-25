"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 채점 뒤 아래에서 올라오는 해설 시트
 * 열리면 제목으로 포커스를 옮겨서 스크린리더가 결과를 바로 읽어요.
 * 시트 안의 버튼이 이 화면의 유일한 주요 버튼이에요.
 */
export function BottomSheet({
  title,
  tone,
  children,
  actionLabel,
  onAction,
  secondary,
}: {
  title: ReactNode;
  tone: "correct" | "wrong" | "neutral";
  children: ReactNode;
  actionLabel: string;
  onAction: () => void;
  secondary?: ReactNode;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <>
      <div className="bottom-cta-spacer" aria-hidden="true" style={{ height: "45dvh" }} />
      <section className="sheet" role="region" aria-labelledby="sheet-title">
        <div className="sheet-body">
          <div className="content">
            <h2
              id="sheet-title"
              ref={headingRef}
              tabIndex={-1}
              className={`t-title-2 flex items-center gap-2 ${tone === "correct" ? "result-label-correct" : tone === "wrong" ? "result-label-wrong" : ""}`}
            >
              {title}
            </h2>
            <div className="mt-4">{children}</div>
          </div>
        </div>
        <div className="sheet-footer">
          <div className="content">
            {secondary && <div className="mb-2 flex flex-wrap justify-center gap-1">{secondary}</div>}
            <button type="button" className="btn-primary" onClick={onAction}>
              {actionLabel}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
