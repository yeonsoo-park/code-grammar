/**
 * 레슨 콘텐츠 스키마
 * content/units/<유닛>/<레슨>/ 아래 JSON 파일이 이 모양을 따라야 해요.
 * 사람이 읽는 설명은 docs/content-schema.md 에 있어요.
 */
import { z } from "zod";

/** 문단 하나. `코드`는 인라인 코드, **굵게**, &nbsp; 는 줄바꿈 방지 공백 */
const Text = z.string().min(1);
const Paragraphs = z.array(Text).min(1);

const Lang = z.enum(["python", "sql"]);

/** 여러 줄 텍스트(코드·출력). 문자열 하나 또는 줄 배열로 쓸 수 있어요. 줄 배열이 직접 고치기 더 쉬워요. */
const Lines = z.union([z.string(), z.array(z.string())]).transform((v) => (Array.isArray(v) ? v.join("\n") : v));

export const CodeSnippet = z.object({
  lang: Lang.default("python"),
  code: Lines,
  /** 적어 두면 검증 스크립트가 실제로 실행해서 출력이 같은지 확인해요 */
  output: Lines.optional(),
});

export const Meta = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  unit: z.object({ id: z.string(), order: z.number().int(), title: Text }),
  order: z.number().int(),
  title: Text,
  summary: Text,
  minutes: z.number().int().positive(),
  /** Pyodide에 추가로 설치할 패키지 (예: ["pandas"]) */
  packages: z.array(z.string()).default([]),
  /** 단어장 카드로 쓸 핵심 키워드 */
  keywords: z.array(z.object({ term: z.string(), meaning: Text })).default([]),
});

const ConceptScreen = z.object({
  id: z.string(),
  title: Text,
  /** 영어 학습 비유 한 줄 (선택) */
  analogy: Text.optional(),
  body: Paragraphs,
  code: CodeSnippet.optional(),
  /** 코드 아래에 오는 설명 (선택) */
  after: Paragraphs.optional(),
  table: z
    .object({ caption: Text, head: z.array(Text), rows: z.array(z.array(z.string())) })
    .optional(),
  keyPoint: Text.optional(),
});

export const Concept = z.object({ screens: z.array(ConceptScreen).min(1) });

const Choice = z.object({
  id: z.string(),
  text: Text.optional(),
  code: Lines.optional(),
  /** 이 선택지가 왜 맞는지 / 틀렸는지 */
  why: Text,
});

export const QuestionKind = z.enum(["concept", "predict-output", "fill-blank", "find-bug", "compare-efficiency"]);

export const ChoiceQuestion = z
  .object({
    id: z.string(),
    kind: QuestionKind,
    prompt: Paragraphs,
    code: CodeSnippet.optional(),
    choices: z.array(Choice).min(3).max(5),
    answer: z.string(),
    /** 정답 해설 (정답 이유 먼저) */
    explanation: Paragraphs,
    /** 출력 예측 문제: 정답 선택지 text가 code의 실제 출력과 같은지 검증 */
    verifyOutput: z.boolean().optional(),
    /** 버그 찾기 문제: code를 실행하면 이 에러가 나야 해요 (예: "TypeError") */
    expectError: z.string().optional(),
    tags: z.array(z.string()).default([]),
  })
  .refine((q) => q.choices.some((c) => c.id === q.answer), { message: "answer가 choices 안에 없어요" })
  .refine((q) => new Set(q.choices.map((c) => c.id)).size === q.choices.length, { message: "선택지 id가 겹쳐요" });

export const Quiz = z.object({ questions: z.array(ChoiceQuestion).min(1) });

export const Reading = z.object({
  title: Text,
  intro: Paragraphs,
  code: CodeSnippet.required({ output: true }),
  /** 줄 번호(1부터) → 직독직해 해석 */
  notes: z.array(z.object({ line: z.number().int().positive(), text: Text })).min(1),
  wrapUp: Paragraphs,
});

const Check = z.object({
  /** 사용자 코드 실행 뒤 같은 공간에서 실행할 assert 문. __output__ 에 출력 결과가 들어 있어요 */
  code: Lines,
  /** 통과하지 못했을 때 보여줄 친절한 문구 */
  fail: Text,
  pass: Text,
});

const FillTask = z.object({
  id: z.string(),
  kind: z.literal("fill"),
  title: Text,
  prompt: Paragraphs,
  /** ___ 자리가 빈칸이에요 */
  template: Lines.refine((v) => v.includes("___"), { message: "template에 빈칸(___)이 없어요" }),
  blanks: z.array(z.object({ accept: z.array(z.string()).min(1), hint: Text })).min(1),
  output: Lines,
  explanation: Paragraphs,
});

const CodeTask = z.object({
  id: z.string(),
  kind: z.enum(["translate", "free"]),
  title: Text,
  prompt: Paragraphs,
  /** 한국어 요구사항 목록 (번역할 "원문") */
  requirements: z.array(Text).min(1),
  starter: Lines,
  hint: Text,
  checks: z.array(Check).min(1),
  solution: Lines,
  explanation: Paragraphs,
});

export const Writing = z.object({ tasks: z.array(z.discriminatedUnion("kind", [FillTask, CodeTask])).min(1) });

export type CodeSnippet = z.infer<typeof CodeSnippet>;
export type Meta = z.infer<typeof Meta>;
export type Concept = z.infer<typeof Concept>;
export type ConceptScreen = z.infer<typeof ConceptScreen>;
export type ChoiceQuestion = z.infer<typeof ChoiceQuestion>;
export type QuestionKind = z.infer<typeof QuestionKind>;
export type Reading = z.infer<typeof Reading>;
export type Writing = z.infer<typeof Writing>;
export type WritingTask = Writing["tasks"][number];
export type FillTask = z.infer<typeof FillTask>;
export type CodeTask = z.infer<typeof CodeTask>;

export type Lesson = {
  meta: Meta;
  concept: Concept;
  quiz: z.infer<typeof Quiz>;
  reading: Reading;
  readingQuiz: z.infer<typeof Quiz>;
  writing: Writing;
};

export const QUESTION_KIND_LABEL: Record<QuestionKind, string> = {
  concept: "개념 확인",
  "predict-output": "출력 예측",
  "fill-blank": "빈칸 추론",
  "find-bug": "버그 찾기",
  "compare-efficiency": "더 나은 코드 고르기",
};
