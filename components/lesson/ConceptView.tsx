import type { ConceptScreen } from "@/lib/content/schema";
import { CodeBlock, OutputBlock } from "../CodeBlock";
import { IconBook } from "../icons";
import { Paragraphs, RichText } from "../RichText";

/** 1단계 개념: 한 화면에 개념 하나 */
export function ConceptView({ screen }: { screen: ConceptScreen }) {
  return (
    <article>
      <h1 className="t-title-1">{screen.title}</h1>

      {screen.analogy && (
        <p className="card-sub t-body-2 mt-4 flex items-start gap-2">
          <IconBook size={20} className="mt-0.5 flex-none" />
          <span className="min-w-0">
            <span className="sr-only">영어 학습 비유: </span>
            <RichText text={screen.analogy} />
          </span>
        </p>
      )}

      <div className="mt-6">
        <Paragraphs items={screen.body} />
      </div>

      {screen.table && (
        <div className="table-wrap mt-6" tabIndex={0} role="region" aria-label={screen.table.caption}>
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

      {screen.code && (
        <div className="mt-6 flex flex-col gap-3">
          <CodeBlock code={screen.code.code} lang={screen.code.lang} label="예시 코드" />
          {screen.code.output !== undefined && <OutputBlock output={screen.code.output} />}
        </div>
      )}

      {screen.after && (
        <div className="mt-6">
          <Paragraphs items={screen.after} />
        </div>
      )}

      {screen.keyPoint && (
        <div className="mt-6 rounded-2xl border-l-4 p-4" style={{ borderColor: "var(--primary)", background: "var(--primary-weak)" }}>
          <p className="t-caption mb-1 font-semibold" style={{ color: "var(--primary-strong)" }}>
            핵심
          </p>
          <p className="t-body-1 font-semibold">
            <RichText text={screen.keyPoint} />
          </p>
        </div>
      )}
    </article>
  );
}
