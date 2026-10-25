export const STAGES = [
  { name: "개념", english: "문법 개념" },
  { name: "개념 문제", english: "문법 문제" },
  { name: "독해", english: "독해 지문" },
  { name: "독해 문제", english: "독해 문제" },
  { name: "작문", english: "영작" },
] as const;

/** 레슨 상단 진행 바: 5단계 중 어디에 있는지, 단계 안에서 얼마나 왔는지 */
export function StageBar({ stage, fraction }: { stage: number; fraction: number }) {
  return (
    <ol className="stage-bar" aria-label="학습 단계">
      {STAGES.map((s, i) => {
        const fill = i < stage ? 1 : i === stage ? fraction : 0;
        const state = i < stage ? "완료" : i === stage ? "진행 중" : "시작 전";
        return (
          <li key={s.name} className="stage-seg" aria-current={i === stage ? "step" : undefined}>
            <div className="stage-track" aria-hidden="true">
              <div className="stage-fill" style={{ width: `${Math.round(fill * 100)}%` }} />
            </div>
            <div className="stage-name">
              {s.name}
              <span className="sr-only">, {state}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
