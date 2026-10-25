"use client";

import { ChoiceQuestionView } from "@/components/ChoiceQuestionView";
import { CodeBlock, OutputBlock } from "@/components/CodeBlock";
import { Paragraphs } from "@/components/RichText";
import { StageBar } from "@/components/StageBar";
import type { ChoiceQuestion } from "@/lib/content/schema";

const LONG_KO =
  "데이터프레임을그룹으로묶은다음에집계함수를적용하고인덱스를다시설정하는과정은처음배울때가장헷갈리는부분이에요. 그래서 이 문장은 일부러 아주 길게 써서, 좁은 화면에서도 어절 단위로 자연스럽게 줄이 바뀌는지 확인해요.";
const LONG_FN = "`pd.DataFrame.groupby().agg().reset_index()`를 한 번에 쓰면 읽기 어려워요.";
const LONG_URL = "자세한 내용은 https://example.com/docs/pandas/reference/api/pandas.DataFrame.groupby.aggregate.reset_index.html 에서 볼 수 있어요.";
const LONG_CODE = [
  "result = orders.merge(customers, on=\"customer_id\", how=\"left\").groupby([\"region\", \"membership_tier\"])[\"total_amount\"].agg([\"sum\", \"mean\", \"count\"]).reset_index()",
  "print(result)",
].join("\n");

const QUESTION: ChoiceQuestion = {
  id: "stress-q",
  kind: "compare-efficiency",
  prompt: [LONG_KO, LONG_FN],
  choices: [
    { id: "a", text: "A", code: LONG_CODE, why: LONG_URL },
    { id: "b", text: "pd.DataFrame.groupby().agg().reset_index()를_띄어쓰기_없이_길게_쓴_선택지예요_pd.DataFrame.groupby().agg()", why: LONG_KO },
    { id: "c", text: LONG_KO, why: LONG_FN },
  ],
  answer: "a",
  explanation: [LONG_KO, LONG_URL],
  tags: [],
};

export function StressView() {
  return (
    <main className="content py-8">
      <StageBar stage={3} fraction={0.5} />
      <h1 className="t-title-1 mt-6">pd.DataFrame.groupby().agg().reset_index() 아주 긴 제목이 두 줄을 넘으면 어떻게 될까요</h1>
      <div className="mt-4">
        <Paragraphs items={[LONG_KO, LONG_FN, LONG_URL]} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="badge">1단계&nbsp;개념 아주 긴 배지 텍스트가 들어가도 잘리지 않아요</span>
      </div>
      <div className="mt-4">
        <CodeBlock code={LONG_CODE} label="80자 넘는 코드" notes={{ 1: LONG_KO + " " + LONG_URL }} />
      </div>
      <div className="mt-4">
        <OutputBlock output={"region membership_tier        sum          mean  count\n" + "서울     basic            123456789  12345.678901  1000".repeat(2)} />
      </div>
      <div className="table-wrap mt-4" tabIndex={0}>
        <table>
          <thead>
            <tr>
              {["order_id", "customer_id", "ordered_at", "order_status", "channel", "coupon_code", "total_amount"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {["O20250719-00001", "C00430", "2025-07-19T08:49:19+09:00", "partially_refunded", "mobile_web", "SUMMER5000", "1,234,567"].map((c) => (
                <td key={c}>{c}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-8">
        <ChoiceQuestionView question={QUESTION} onAnswered={() => {}} onNext={() => {}} />
      </div>
    </main>
  );
}
