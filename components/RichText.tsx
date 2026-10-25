import { Fragment, type ReactNode } from "react";

/**
 * 콘텐츠 문장 렌더러
 * - `코드` → 인라인 코드 (. _ ( 뒤에 <wbr>을 넣어 긴 함수명도 넘치지 않게)
 * - **굵게** → 강조
 * - &nbsp; → 줄바꿈 방지 공백 (숫자+단위처럼 붙어 있어야 하는 묶음)
 */
export function RichText({ text }: { text: string }) {
  const parts = text.replace(/&nbsp;/g, " ").split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
          return (
            <code key={i} className="inline-code">
              {withBreakHints(part.slice(1, -1))}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={i} className="font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

/** pd.DataFrame.groupby().agg() 같은 긴 코드는 . _ ( 뒤에서 끊길 수 있게 */
export function withBreakHints(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  code.split(/(?<=[._(,])/).forEach((chunk, i, arr) => {
    out.push(chunk);
    if (i < arr.length - 1) out.push(<wbr key={`w${i}`} />);
  });
  return out;
}

export function Paragraphs({ items, className = "t-body-1" }: { items: string[]; className?: string }) {
  return (
    <div className="prose-flow">
      {items.map((p, i) => (
        <p key={i} className={className}>
          <RichText text={p} />
        </p>
      ))}
    </div>
  );
}
