/**
 * 콘텐츠 검증
 * 1) 모든 레슨 JSON이 스키마에 맞는지
 * 2) 예시 코드를 실제로 실행해서, 적어 둔 출력과 같은지
 * 3) 출력 예측 문제의 정답이 실제 출력과 같은지, 버그 찾기 문제가 정말 에러를 내는지
 * 4) 작문 모범 답안이 채점 기준을 모두 통과하는지
 * 실행: npm run verify:content
 */
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { lessonDirs, loadLessonDir } from "../lib/content/read";
import type { ChoiceQuestion } from "../lib/content/schema";

type RunResult = { stdout: string; error: { type: string; message: string } | null; checks: boolean[] };

const harness = join(process.cwd(), "scripts", "py_harness.py");

function runPython(code: string, checks: string[] = []): RunResult {
  const r = spawnSync("python3", ["-I", harness], { input: JSON.stringify({ code, checks }), encoding: "utf8" });
  if (r.status !== 0) throw new Error(`Python 실행기 오류: ${r.stderr}`);
  return JSON.parse(r.stdout);
}

const norm = (s: string) => s.replace(/\s+$/g, "").split("\n").map((l) => l.trimEnd()).join("\n");

let passed = 0;
const failures: string[] = [];
function expect(ok: boolean, label: string, detail = "") {
  if (ok) passed++;
  else failures.push(`✕ ${label}${detail ? `\n    ${detail.replace(/\n/g, "\n    ")}` : ""}`);
}

function checkOutput(label: string, code: string, expected: string) {
  const r = runPython(code);
  if (r.error) return expect(false, label, `에러: ${r.error.type}: ${r.error.message}`);
  expect(norm(r.stdout) === norm(expected), label, `기대: ${JSON.stringify(norm(expected))}\n실제: ${JSON.stringify(norm(r.stdout))}`);
}

function checkQuestion(lessonId: string, q: ChoiceQuestion) {
  const label = `${lessonId} / ${q.id}`;
  if (q.verifyOutput) {
    if (!q.code) return expect(false, `${label}: verifyOutput인데 code가 없어요`);
    const answer = q.choices.find((c) => c.id === q.answer)!;
    checkOutput(`${label}: 정답 선택지 = 실제 출력`, q.code.code, answer.text ?? answer.code ?? "");
    // 오답 선택지가 우연히 정답과 같으면 안 돼요
    const r = runPython(q.code.code);
    for (const c of q.choices.filter((c) => c.id !== q.answer)) {
      expect(norm(c.text ?? c.code ?? "") !== norm(r.stdout), `${label}: 오답 ${c.id}가 실제 출력과 같아요`);
    }
  }
  if (q.expectError) {
    if (!q.code) return expect(false, `${label}: expectError인데 code가 없어요`);
    const r = runPython(q.code.code);
    expect(r.error?.type === q.expectError, `${label}: ${q.expectError}가 나야 해요`, `실제: ${r.error ? r.error.type : "에러 없음"}`);
  }
}

for (const dir of lessonDirs()) {
  let lesson;
  try {
    lesson = loadLessonDir(dir);
    expect(true, "schema");
  } catch (e) {
    expect(false, `스키마: ${dir}`, String(e instanceof Error ? e.message : e));
    continue;
  }
  const id = lesson.meta.id;

  for (const s of lesson.concept.screens) {
    if (s.code?.output !== undefined && s.code.lang === "python") checkOutput(`${id} / 개념 ${s.id}: 출력`, s.code.code, s.code.output);
  }
  checkOutput(`${id} / 독해: 출력`, lesson.reading.code.code, lesson.reading.code.output);
  const readingLines = lesson.reading.code.code.split("\n").length;
  for (const n of lesson.reading.notes) {
    expect(n.line <= readingLines, `${id} / 독해 해석 ${n.line}번 줄이 코드(${readingLines}줄) 밖이에요`);
    expect(lesson.reading.code.code.split("\n")[n.line - 1].trim() !== "", `${id} / 독해 해석 ${n.line}번 줄은 빈 줄이에요`);
  }

  for (const q of [...lesson.quiz.questions, ...lesson.readingQuiz.questions]) checkQuestion(id, q);

  for (const t of lesson.writing.tasks) {
    const label = `${id} / 작문 ${t.id}`;
    if (t.kind === "fill") {
      const holes = t.template.split("___").length - 1;
      expect(holes === t.blanks.length, `${label}: 빈칸(___) ${holes}개 ≠ blanks ${t.blanks.length}개`);
      let filled = t.template;
      for (const b of t.blanks) filled = filled.replace("___", b.accept[0]);
      checkOutput(`${label}: 정답으로 채운 코드의 출력`, filled, t.output);
    } else {
      const r = runPython(t.solution, t.checks.map((c) => c.code));
      if (r.error) expect(false, `${label}: 모범 답안 실행`, `${r.error.type}: ${r.error.message}`);
      r.checks.forEach((ok, i) => expect(ok, `${label}: 모범 답안이 채점 기준 ${i + 1} 통과`, t.checks[i].code));
      const s = runPython(t.starter, t.checks.map((c) => c.code));
      expect(!s.checks.every(Boolean), `${label}: 시작 코드가 이미 모든 기준을 통과해요`);
    }
  }
}

console.log(`\n통과 ${passed}개, 실패 ${failures.length}개`);
if (failures.length) {
  console.log(failures.join("\n"));
  process.exit(1);
}
console.log("모든 콘텐츠 검증을 통과했어요.");
