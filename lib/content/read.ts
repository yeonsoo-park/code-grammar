import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Concept, Meta, Quiz, Reading, Writing, type Lesson } from "./schema";

const ROOT = join(process.cwd(), "content", "units");

function readJson(dir: string, file: string) {
  return JSON.parse(readFileSync(join(dir, file), "utf8"));
}

/** 레슨 폴더 하나를 읽고 스키마로 검증해요. 틀린 곳이 있으면 어느 파일인지 알려줘요. */
export function loadLessonDir(dir: string): Lesson {
  const parse = <T>(schema: { parse: (v: unknown) => T }, file: string): T => {
    try {
      return schema.parse(readJson(dir, file));
    } catch (e) {
      throw new Error(`${join(dir, file)} 형식이 맞지 않아요:\n${e instanceof Error ? e.message : e}`);
    }
  };
  return {
    meta: parse(Meta, "meta.json"),
    concept: parse(Concept, "concept.json"),
    quiz: parse(Quiz, "quiz.json"),
    reading: parse(Reading, "reading.json"),
    readingQuiz: parse(Quiz, "reading-quiz.json"),
    writing: parse(Writing, "writing.json"),
  };
}

export function lessonDirs(): string[] {
  if (!existsSync(ROOT)) return [];
  return readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((unit) =>
      readdirSync(join(ROOT, unit.name), { withFileTypes: true })
        .filter((d) => d.isDirectory() && existsSync(join(ROOT, unit.name, d.name, "meta.json")))
        .map((d) => join(ROOT, unit.name, d.name)),
    )
    .sort();
}
