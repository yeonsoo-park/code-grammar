"use client";

import { useId, type ReactNode } from "react";

/**
 * 3D(클레이) 스타일 일러스트 아이콘
 * - 외부 이미지 없이 SVG로 그려요. 색은 tokens.css 의 파스텔 변수만 써서, 키 컬러를 바꾸면 함께 바뀌어요.
 * - 입체감: 아래쪽 진한 면(두께) + 밝은 → 진한 그라데이션(면) + 흰 하이라이트 + 바닥 그림자
 * - 장식용이라 기본은 aria-hidden 이에요. 의미가 필요하면 옆에 글자를 함께 써요.
 */

export type Tone = "violet" | "orange" | "pink" | "green";
export type IllustrationName =
  | "book"
  | "quiz"
  | "magnifier"
  | "target"
  | "pencil"
  | "flame"
  | "clock"
  | "note"
  | "trophy"
  | "blocks"
  | "chart"
  | "database"
  | "layers"
  | "rocket";

const c = (tone: Tone, step: 50 | 200 | 400 | 600 | 800) => `var(--${tone}-${step})`;

export function Illustration({ name, tone = "violet", size = 56, className }: { name: IllustrationName; tone?: Tone; size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const g = `g${id}`; // 주 그라데이션
  const ga = `a${id}`; // 보조 그라데이션 (오렌지)
  const t = (step: 50 | 200 | 400 | 600 | 800) => c(tone, step);
  const fill = `url(#${g})`;
  const accent = `url(#${ga})`;

  const defs = (
    <defs>
      <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" style={{ stopColor: t(200) }} />
        <stop offset="1" style={{ stopColor: t(600) }} />
      </linearGradient>
      <linearGradient id={ga} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" style={{ stopColor: c("orange", 200) }} />
        <stop offset="1" style={{ stopColor: c("orange", 600) }} />
      </linearGradient>
    </defs>
  );

  const shapes: Record<IllustrationName, ReactNode> = {
    book: (
      <>
        <path d="M8 21q12-5 24 0q12-5 24 0v30q-12-5-24 0q-12-5-24 0z" style={{ fill: t(800) }} transform="translate(0 3)" />
        <path d="M8 21q12-5 24 0q12-5 24 0v30q-12-5-24 0q-12-5-24 0z" fill={fill} />
        <path d="M11 20q10-4 20 0v27q-10-4-20 0z" style={{ fill: "var(--ill-white)" }} />
        <path d="M33 20q10-4 20 0v27q-10-4-20 0z" style={{ fill: "var(--ill-white)" }} opacity="0.92" />
        <g style={{ stroke: t(200) }} strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M15 26q6-2 12 0M15 31q6-2 12 0M15 36q6-2 9 0" />
          <path d="M37 26q6-2 12 0M37 31q6-2 12 0M37 36q6-2 9 0" />
        </g>
        <circle cx="47" cy="13" r="5" fill={accent} />
      </>
    ),
    quiz: (
      <>
        <rect x="13" y="13" width="36" height="44" rx="8" style={{ fill: t(800) }} />
        <rect x="13" y="10" width="36" height="44" rx="8" fill={fill} />
        <rect x="18" y="17" width="26" height="31" rx="5" style={{ fill: "var(--ill-white)" }} />
        <rect x="23" y="6" width="16" height="8" rx="4" style={{ fill: t(800) }} />
        <circle cx="24" cy="25" r="3" style={{ fill: t(400) }} />
        <circle cx="24" cy="34" r="3" style={{ fill: t(200) }} />
        <g style={{ stroke: t(200) }} strokeWidth="2.5" strokeLinecap="round">
          <path d="M30 25h9M30 34h7" />
        </g>
        <circle cx="47" cy="47" r="10" style={{ fill: c("green", 800) }} />
        <circle cx="47" cy="45" r="10" style={{ fill: c("green", 400) }} />
        <path d="M42.5 45l3 3 6-6" style={{ stroke: "var(--ill-white)" }} strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>
    ),
    magnifier: (
      <>
        <rect x="9" y="11" width="30" height="40" rx="6" style={{ fill: t(200) }} />
        <rect x="9" y="8" width="30" height="40" rx="6" style={{ fill: "var(--ill-white)" }} />
        <g style={{ stroke: t(200) }} strokeWidth="2.5" strokeLinecap="round">
          <path d="M15 17h18M15 23h18M15 29h12M15 35h15" />
        </g>
        <path d="M45 43l8 8" style={{ stroke: c("orange", 800) }} strokeWidth="7" strokeLinecap="round" />
        <path d="M45 42l8 8" style={{ stroke: c("orange", 400) }} strokeWidth="6" strokeLinecap="round" />
        <circle cx="37" cy="35" r="12" fill={fill} opacity="0.88" />
        <circle cx="37" cy="35" r="12" fill="none" style={{ stroke: t(800) }} strokeWidth="3.5" />
        <ellipse cx="33" cy="31" rx="4" ry="2.5" style={{ fill: "var(--ill-white)" }} opacity="0.7" transform="rotate(-30 33 31)" />
      </>
    ),
    target: (
      <>
        <circle cx="29" cy="37" r="20" style={{ fill: t(800) }} />
        <circle cx="29" cy="34" r="20" style={{ fill: "var(--ill-white)" }} />
        <circle cx="29" cy="34" r="14.5" fill={fill} />
        <circle cx="29" cy="34" r="9" style={{ fill: "var(--ill-white)" }} />
        <circle cx="29" cy="34" r="4" style={{ fill: t(800) }} />
        <path d="M29 34L50 13" style={{ stroke: c("orange", 800) }} strokeWidth="3" strokeLinecap="round" />
        <path d="M47 10l7 1-1 7-5-3z" fill={accent} />
      </>
    ),
    pencil: (
      <g transform="rotate(40 32 32)">
        <rect x="24" y="7" width="16" height="37" rx="4" style={{ fill: t(800) }} transform="translate(2 1)" />
        <rect x="24" y="7" width="16" height="37" rx="4" fill={fill} />
        <rect x="24" y="7" width="16" height="7" rx="3" style={{ fill: c("pink", 400) }} />
        <rect x="24" y="14" width="16" height="3" style={{ fill: t(200) }} />
        <path d="M24 44h16l-8 13z" style={{ fill: c("orange", 200) }} />
        <path d="M29.4 52.8h5.2L32 57z" style={{ fill: t(800) }} />
        <rect x="27" y="19" width="3" height="22" rx="1.5" style={{ fill: "var(--ill-white)" }} opacity="0.55" />
      </g>
    ),
    flame: (
      <>
        <path d="M32 7c8 10 18 16 18 30 0 11-8 19-18 19S14 48 14 37c0-8 5-14 9-19 1 7 4 10 7 10-2-8-1-15 2-21z" fill={accent} />
        <path d="M32 31c4 5 8 8 8 14 0 5-4 8-8 8s-8-3-8-8c0-5 4-8 8-14z" style={{ fill: c("orange", 50) }} />
        <ellipse cx="22" cy="34" rx="2.5" ry="5" style={{ fill: "var(--ill-white)" }} opacity="0.5" />
      </>
    ),
    clock: (
      <>
        <circle cx="32" cy="35" r="21" style={{ fill: t(800) }} />
        <circle cx="32" cy="32" r="21" fill={fill} />
        <circle cx="32" cy="32" r="15" style={{ fill: "var(--ill-white)" }} />
        <path d="M32 32V22M32 32l7 4" style={{ stroke: t(800) }} strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="32" r="2.5" style={{ fill: c("orange", 400) }} />
      </>
    ),
    note: (
      <>
        <rect x="14" y="12" width="34" height="44" rx="7" style={{ fill: t(800) }} />
        <rect x="14" y="9" width="34" height="44" rx="7" fill={fill} />
        <rect x="14" y="9" width="8" height="44" rx="4" style={{ fill: t(800) }} opacity="0.25" />
        <g style={{ fill: "var(--ill-white)" }} opacity="0.85">
          <rect x="26" y="20" width="16" height="3" rx="1.5" />
          <rect x="26" y="27" width="12" height="3" rx="1.5" />
          <rect x="26" y="34" width="14" height="3" rx="1.5" />
        </g>
        <path d="M38 9v15l4-3 4 3V9z" fill={accent} />
      </>
    ),
    trophy: (
      <>
        <path d="M21 17h-6c0 9 4 13 9 13M43 17h6c0 9-4 13-9 13" style={{ stroke: c("orange", 600) }} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M20 10h24v14c0 8-5 14-12 14s-12-6-12-14z" fill={accent} />
        <path d="M32 16l2 4.2 4.5.6-3.3 3.1.8 4.5L32 26.3l-4 2.1.8-4.5-3.3-3.1 4.5-.6z" style={{ fill: "var(--ill-white)" }} opacity="0.9" />
        <rect x="29" y="38" width="6" height="7" style={{ fill: c("orange", 600) }} />
        <rect x="21" y="47" width="22" height="8" rx="3" style={{ fill: t(800) }} />
        <rect x="21" y="45" width="22" height="8" rx="3" fill={fill} />
      </>
    ),
    blocks: (
      <>
        <rect x="9" y="33" width="21" height="21" rx="6" style={{ fill: c("violet", 800) }} />
        <rect x="9" y="30" width="21" height="21" rx="6" style={{ fill: c("violet", 400) }} />
        <rect x="34" y="33" width="21" height="21" rx="6" style={{ fill: c("orange", 800) }} />
        <rect x="34" y="30" width="21" height="21" rx="6" fill={accent} />
        <rect x="21.5" y="9" width="21" height="21" rx="6" style={{ fill: c("pink", 800) }} />
        <rect x="21.5" y="6" width="21" height="21" rx="6" style={{ fill: c("pink", 400) }} />
        <path d="M28 13l-3 3.5 3 3.5M36 13l3 3.5-3 3.5" style={{ stroke: "var(--ill-white)" }} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>
    ),
    chart: (
      <>
        <rect x="8" y="13" width="48" height="40" rx="9" style={{ fill: t(200) }} />
        <rect x="8" y="10" width="48" height="40" rx="9" style={{ fill: "var(--ill-white)" }} />
        <rect x="15" y="31" width="7" height="12" rx="2.5" style={{ fill: t(200) }} />
        <rect x="25" y="23" width="7" height="20" rx="2.5" fill={fill} />
        <rect x="35" y="27" width="7" height="16" rx="2.5" fill={accent} />
        <rect x="45" y="17" width="7" height="26" rx="2.5" fill={fill} />
      </>
    ),
    database: (
      <>
        <path d="M14 17v31c0 4 8 7 18 7s18-3 18-7V17z" fill={fill} />
        <ellipse cx="32" cy="17" rx="18" ry="6.5" style={{ fill: t(200) }} />
        <path d="M14 28c0 4 8 7 18 7s18-3 18-7M14 39c0 4 8 7 18 7s18-3 18-7" style={{ stroke: "var(--ill-white)" }} strokeWidth="2" fill="none" opacity="0.6" />
        <circle cx="43" cy="32" r="2" style={{ fill: c("orange", 200) }} />
        <circle cx="43" cy="43" r="2" style={{ fill: c("orange", 200) }} />
        <ellipse cx="25" cy="16" rx="6" ry="2" style={{ fill: "var(--ill-white)" }} opacity="0.6" />
      </>
    ),
    layers: (
      <>
        <path d="M32 39l22 9-22 9-22-9z" style={{ fill: t(800) }} />
        <path d="M32 30l22 9-22 9-22-9z" fill={fill} />
        <path d="M32 21l22 9-22 9-22-9z" style={{ fill: t(400) }} opacity="0.8" />
        <path d="M32 8l22 10-22 10-22-10z" fill={accent} />
        <ellipse cx="26" cy="16" rx="5" ry="2" style={{ fill: "var(--ill-white)" }} opacity="0.6" />
      </>
    ),
    rocket: (
      <g transform="rotate(40 32 32)">
        <path d="M27 42h10l-5 14z" fill={accent} />
        <path d="M24 32l-8 10 8-1zM40 32l8 10-8-1z" style={{ fill: t(600) }} />
        <path d="M32 5c8 8 10 21 8 37H24c-2-16 0-29 8-37z" style={{ fill: "var(--ill-white)" }} />
        <path d="M32 5c8 8 10 21 8 37h-5c1-15-1-27-3-37z" style={{ fill: t(200) }} />
        <circle cx="32" cy="21" r="5.5" fill={fill} />
        <circle cx="32" cy="21" r="5.5" fill="none" style={{ stroke: "var(--ill-white)" }} strokeWidth="2" />
      </g>
    ),
  };

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={className}>
      {defs}
      <ellipse cx="32" cy="60" rx="18" ry="2.5" style={{ fill: "var(--ill-shadow)" }} opacity="0.08" />
      {shapes[name]}
    </svg>
  );
}

/** 학습 5단계 각각의 아이콘·색 (레슨 소개, 진행 화면에서 같이 써요) */
export const STAGE_ART: { name: IllustrationName; tone: Tone }[] = [
  { name: "book", tone: "violet" },
  { name: "quiz", tone: "pink" },
  { name: "magnifier", tone: "violet" },
  { name: "target", tone: "pink" },
  { name: "pencil", tone: "orange" },
];

/** 유닛마다 하나씩 */
export const UNIT_ART: Record<string, { name: IllustrationName; tone: Tone }> = {
  "python-basics": { name: "blocks", tone: "violet" },
  "python-data": { name: "chart", tone: "violet" },
  "sql-basics": { name: "database", tone: "violet" },
  "sql-intermediate": { name: "layers", tone: "pink" },
  efficiency: { name: "rocket", tone: "violet" },
};

/** 유닛 카드 배경 파스텔 */
export const UNIT_TINT: Record<string, Tone> = {
  "python-basics": "violet",
  "python-data": "orange",
  "sql-basics": "green",
  "sql-intermediate": "pink",
  efficiency: "violet",
};
