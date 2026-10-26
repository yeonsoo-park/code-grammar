/**
 * 줄 단위 비교 (첨삭 전 → 후)
 * 가장 긴 공통 부분(LCS)을 찾아서, 그대로인 줄·지운 줄·더한 줄로 나눠요.
 * 학습자 코드는 짧아서(수십 줄) 단순한 표 방식으로 충분해요.
 */
export type DiffLine = { type: "same" | "del" | "add"; text: string };

export function diffLines(before: string, after: string): DiffLine[] {
  const a = before.replace(/\s+$/, "").split("\n");
  const b = after.replace(/\s+$/, "").split("\n");
  const key = (s: string) => s.trimEnd();

  // lcs[i][j] = a[i..], b[j..] 의 가장 긴 공통 줄 수
  const lcs = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = key(a[i]) === key(b[j]) ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (key(a[i]) === key(b[j])) {
      out.push({ type: "same", text: b[j] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      out.push({ type: "del", text: a[i++] });
    } else {
      out.push({ type: "add", text: b[j++] });
    }
  }
  while (i < a.length) out.push({ type: "del", text: a[i++] });
  while (j < b.length) out.push({ type: "add", text: b[j++] });
  return out;
}

export const hasChanges = (lines: DiffLine[]) => lines.some((l) => l.type !== "same");
