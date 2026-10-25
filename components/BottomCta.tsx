"use client";

import type { ReactNode } from "react";

/**
 * 화면 하단에 고정되는 주요 버튼 (한 화면에 하나)
 * 누를 수 없을 때는 왜 그런지 버튼 위에 한 줄로 알려줘요.
 */
export function BottomCta({
  label,
  onClick,
  disabled,
  disabledReason,
  children,
  busy,
  tabbed,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  disabledReason?: string;
  /** 버튼 위에 놓을 보조 요소 (예: 코드 에디터 보조 키 바) */
  children?: ReactNode;
  busy?: boolean;
  /** 하단 탭바가 있는 화면 */
  tabbed?: boolean;
}) {
  return (
    <>
      <div className="bottom-cta-spacer" aria-hidden="true" />
      <div className={`bottom-cta${tabbed ? " bottom-cta-tabbed" : ""}`}>
        <div className="content">
          {children}
          {disabled && disabledReason && (
            <p className="disabled-reason t-body-2" id="cta-reason">
              {disabledReason}
            </p>
          )}
          <button
            type="button"
            className="btn-primary"
            onClick={onClick}
            disabled={disabled}
            aria-describedby={disabled && disabledReason ? "cta-reason" : undefined}
            aria-busy={busy || undefined}
          >
            {label}
          </button>
        </div>
      </div>
    </>
  );
}
