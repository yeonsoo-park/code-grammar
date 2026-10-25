import type { QuestionKind } from "./schema";

// 화면에서 쓰는 라벨은 스키마(zod)와 분리해 둬요. 그래야 휴대폰이 받는 파일에 검증 라이브러리가 섞이지 않아요.
export const QUESTION_KIND_LABEL: Record<QuestionKind, string> = {
  concept: "개념 확인",
  "predict-output": "출력 예측",
  "fill-blank": "빈칸 추론",
  "find-bug": "버그 찾기",
  "compare-efficiency": "더 나은 코드 고르기",
};
