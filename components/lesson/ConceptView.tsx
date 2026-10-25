"use client";

import type { ConceptScreen } from "@/lib/content/schema";
import { CodeBlock, OutputBlock } from "../CodeBlock";
import { IconBulb } from "../icons";
import { Illustration } from "../Illustration";
import { Paragraphs, RichText } from "../RichText";

/** explain = 설명 장, example = 예시 코드 장, all = 예시가 없어서 한 장 */
export type ConceptPart = "explain" | "example" | "all";

/** 1단계 개념: 한 화면에 개념 하나. 예시 코드가 있으면 두 장으로 나눠 스크롤을 줄여요. */
export function ConceptView({ screen, part = "all" }: { screen: ConceptScreen; part?: ConceptPart }) {
  const showExplain = part !== "example";
  const showExample = part !== "explain";

  return (
    <article>
      {showExplain ? (
        <h1 className="t-title-1">{screen.title}</h1>
      ) : (
        <>
          <p className="eyebrow">예시로 확인해요</p>
          <h1 className="t-title-2">{screen.title}</h1>
        </>
      )}

      {showExplain && (
        <>
          {screen.analogy && (
            <div className="analogy mt-4">
              <Illustration name="book" tone="orange" size={40} className="flex-none" />
              <p className="t-body-2">
                <span className="sr-only">영어 학습 비유: </span>
                <RichText text={screen.analogy} />
              </p>
            </div>
          )}

          <div className="mt-5">
            <Paragraphs items={screen.body} />
          </div>

          {screen.table && (
            <div className="table-wrap mt-5" tabIndex={0} role="region" aria-label={screen.table.caption}>
              <table>
                <caption className="sr-only">{screen.table.caption}</caption>
                <thead>
                  <tr>
                    {screen.table.head.map((h) => (
                      <th key={h} scope="col">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {screen.table.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j}>{j === 0 ? <code className="inline-code">{cell}</code> : cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {showExample && (
        <>
          {screen.code && (
            <div className="mt-5 flex flex-col gap-3">
              <CodeBlock code={screen.code.code} lang={screen.code.lang} label="예시 코드" />
              {screen.code.output !== undefined && <OutputBlock output={screen.code.output} />}
            </div>
          )}

          {screen.after && (
            <div className="mt-5">
              <Paragraphs items={screen.after} />
            </div>
          )}

          {screen.keyPoint && (
            <div className="callout mt-5">
              <IconBulb size={22} className="mt-0.5 flex-none" />
              <p className="t-body-1 font-semibold">
                <span className="sr-only">핵심: </span>
                <RichText text={screen.keyPoint} />
              </p>
            </div>
          )}
        </>
      )}
    </article>
  );
}
