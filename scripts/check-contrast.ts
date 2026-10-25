/**
 * 색 대비 검사 (WCAG 2.1)
 * styles/tokens.css 에서 라이트·다크 토큰 값을 읽어, 실제로 함께 쓰는 글자/배경 조합의 대비를 계산해요.
 * 실행: npm run check:contrast
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(process.cwd(), "styles/tokens.css"), "utf8");

function readBlock(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  if (start < 0) throw new Error(`${selector} 블록을 찾지 못했어요`);
  const body = css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start));
  const tokens: Record<string, string> = {};
  for (const m of body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) tokens[m[1]] = m[2];
  return tokens;
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// [글자, 배경, 기준, 설명]  기준: 4.5 = 본문, 3 = 큰 글씨·아이콘·테두리
const pairs: [string, string, number, string][] = [
  ["text-strong", "bg", 4.5, "본문"],
  ["text-strong", "bg-sub", 4.5, "카드 안 본문"],
  ["text-sub", "bg", 4.5, "보조 설명"],
  ["text-sub", "bg-sub", 4.5, "카드 안 보조 설명"],
  ["primary-strong", "bg", 4.5, "링크·강조 글자"],
  ["primary-strong", "primary-weak", 4.5, "배지 글자"],
  ["on-primary", "primary-button", 4.5, "주요 버튼 글자"],
  ["correct-strong", "bg", 4.5, "정답 문구"],
  ["wrong-strong", "bg", 4.5, "오답 문구"],
  ["wrong-strong", "wrong-weak", 4.5, "오답 카드 문구"],
  ["warning-strong", "bg", 4.5, "힌트 문구"],
  ["warning-strong", "warning-weak", 4.5, "힌트 상자 문구"],
  ["primary", "bg", 3, "진도 바·선택 테두리·포커스 링"],
  ["wrong", "bg", 3, "오답 테두리·아이콘"],
  ["text-strong", "code-bg", 4.5, "코드 기본 글자"],
  ["code-keyword", "code-bg", 4.5, "코드 키워드"],
  ["code-string", "code-bg", 4.5, "코드 문자열"],
  ["code-number", "code-bg", 4.5, "코드 숫자"],
  ["code-comment", "code-bg", 4.5, "코드 주석"],
  ["text-sub", "code-bg", 4.5, "줄 번호"],
];

let failed = 0;
for (const [mode, selector] of [
  ["라이트", ":root {"],
  ["다크", ':root[data-theme="dark"] {'],
] as const) {
  const t = readBlock(selector);
  console.log(`\n■ ${mode} 모드`);
  for (const [fg, bg, min, label] of pairs) {
    if (!t[fg] || !t[bg]) {
      console.log(`  ?  ${label}: --${fg} / --${bg} 토큰이 없어요`);
      failed++;
      continue;
    }
    const r = ratio(t[fg], t[bg]);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(
      `  ${ok ? "통과" : "미달"}  ${r.toFixed(2).padStart(5)}:1 (기준 ${min}) ${label}  --${fg} ${t[fg]} / --${bg} ${t[bg]}`,
    );
  }
}
console.log(failed ? `\n${failed}개 조합이 기준에 못 미쳐요.` : "\n모든 조합이 WCAG AA를 통과했어요.");
process.exit(failed ? 1 : 0);
