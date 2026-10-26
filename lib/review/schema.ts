/**
 * AI 첨삭 결과의 모양
 * Claude가 이 형식 그대로 답하도록 강제해요(구조화 출력). 화면도 이 타입을 그대로 써요.
 */
import { z } from "zod";

const Score = z.number().int().min(1).max(5);

export const ReviewResult = z.object({
  scores: z.object({
    accuracy: Score.describe("정확성: 요구사항을 모두 지키고 올바른 결과를 내는가"),
    readability: Score.describe("가독성: 변수 이름·줄 나눔·주석이 읽기 쉬운가"),
    efficiency: Score.describe("효율성: 같은 계산을 반복하지 않고 군더더기가 없는가"),
  }),
  summary: z.string().describe("한두 문장 총평. 해요체"),
  points: z
    .array(
      z.object({
        kind: z.enum(["good", "fix", "tip"]).describe("good=잘한 점, fix=고칠 점, tip=더 나아지는 팁"),
        text: z.string().describe("한 문장. 해요체. 코드는 `백틱`으로 감싸요"),
      }),
    )
    .describe("2~4개. 잘한 점을 하나 이상 포함해요"),
  improved_code: z.string().describe("학습자 코드를 최소한으로 고친 버전. 고칠 게 없으면 학습자 코드 그대로"),
});

export type ReviewResult = z.infer<typeof ReviewResult>;

export type ReviewRequest = {
  lessonId: string;
  taskId: string;
  code: string;
  /** 학습자 코드를 실행했을 때의 출력 (참고용) */
  stdout: string;
};

export type ReviewResponse =
  | { ok: true; result: ReviewResult; remainingToday: number }
  | { ok: false; reason: "not-configured" | "signed-out" | "limit" | "invalid" | "refused" | "busy" | "failed"; message: string };

export const DAILY_LIMIT = 20;
export const MAX_CODE_LENGTH = 4000;
