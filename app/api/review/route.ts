/**
 * AI 첨삭 서버 함수 (POST /api/review)
 *
 * 흐름: 키 확인 → 로그인 확인 → 입력 검사 → 오늘 사용 횟수 확인 → Claude 호출 → 기록 저장
 * - ANTHROPIC_API_KEY 는 이 서버 함수에서만 읽어요. 브라우저로는 절대 보내지 않아요.
 * - 사이트가 공개라서, 로그인한 사람만 하루 DAILY_LIMIT 번까지 쓸 수 있게 막아요(비용 보호).
 * - Supabase에는 학습자 본인의 로그인 토큰으로 접근해서 RLS 규칙이 그대로 적용돼요.
 */
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { createClient } from "@supabase/supabase-js";
import { getLesson } from "@/lib/content/load";
import { buildUserMessage, SYSTEM_PROMPT } from "@/lib/review/prompt";
import { DAILY_LIMIT, MAX_CODE_LENGTH, ReviewResult, type ReviewRequest, type ReviewResponse } from "@/lib/review/schema";

const MODEL = "claude-opus-5-5";

function reply(body: ReviewResponse, status: number) {
  return Response.json(body, { status });
}

/** 오늘(한국 시간 0시)부터 센 첨삭 횟수 */
function startOfTodayKST() {
  const kst = new Date(Date.now() + 9 * 3600_000);
  kst.setUTCHours(0, 0, 0, 0);
  return new Date(kst.getTime() - 9 * 3600_000).toISOString();
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!process.env.ANTHROPIC_API_KEY || !supabaseUrl || !supabaseKey) {
    return reply({ ok: false, reason: "not-configured", message: "AI 첨삭은 곧 열려요." }, 503);
  }

  // 1) 로그인 확인
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return reply({ ok: false, reason: "signed-out", message: "로그인하면 AI 첨삭을 받을 수 있어요." }, 401);
  const db = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await db.auth.getUser(token);
  if (userError || !userData.user) {
    return reply({ ok: false, reason: "signed-out", message: "로그인이 끝났어요. 다시 로그인해 주세요." }, 401);
  }

  // 2) 입력 검사 — 과제는 서버에 있는 레슨 파일에서 찾아요 (브라우저가 보낸 요구사항을 믿지 않아요)
  let body: ReviewRequest;
  try {
    body = await request.json();
  } catch {
    return reply({ ok: false, reason: "invalid", message: "요청 형식이 맞지 않아요." }, 400);
  }
  const lesson = typeof body.lessonId === "string" ? getLesson(body.lessonId) : undefined;
  const task = lesson?.writing.tasks.find((t) => t.id === body.taskId);
  const code = typeof body.code === "string" ? body.code : "";
  if (!lesson || !task || task.kind === "fill") {
    return reply({ ok: false, reason: "invalid", message: "첨삭할 과제를 찾지 못했어요." }, 400);
  }
  if (!code.trim() || code.length > MAX_CODE_LENGTH) {
    return reply({ ok: false, reason: "invalid", message: `코드는 1자 이상 ${MAX_CODE_LENGTH}자 이하로 보내 주세요.` }, 400);
  }

  // 3) 하루 횟수 확인
  const { count, error: countError } = await db
    .from("writing_reviews")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startOfTodayKST());
  if (countError) {
    console.error("[review] count failed", countError.message);
    return reply({ ok: false, reason: "failed", message: "첨삭 기록을 확인하지 못했어요. 잠시 뒤 다시 시도해 주세요." }, 500);
  }
  const used = count ?? 0;
  if (used >= DAILY_LIMIT) {
    return reply({ ok: false, reason: "limit", message: `오늘은 AI 첨삭을 ${DAILY_LIMIT}번 모두 받았어요. 내일 다시 받을 수 있어요.` }, 429);
  }

  // 4) Claude 호출 — 결과를 정해진 형식(JSON)으로 받아요
  const client = new Anthropic();
  let message;
  try {
    message = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 8000,
      // 짧은 초보자 코드라 깊게 생각할 필요는 적어요. 빠른 응답을 위해 low로 둬요.
      output_config: { effort: "low", format: betaZodOutputFormat(ReviewResult) },
      // 안전 필터가 정상 요청을 잘못 막으면, 서버에서 권장 모델로 자동 재시도해요
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(lesson.meta, task, code, String(body.stdout ?? "")) }],
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError || error instanceof Anthropic.InternalServerError) {
      return reply({ ok: false, reason: "busy", message: "AI가 지금 바빠요. 1분쯤 뒤에 다시 시도해 주세요." }, 503);
    }
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
      console.error("[review] API key problem", error.status);
      return reply({ ok: false, reason: "failed", message: "AI 첨삭 설정에 문제가 있어요. 관리자에게 알려 주세요." }, 500);
    }
    if (error instanceof Anthropic.APIError) {
      console.error("[review] API error", error.status, error.message);
    } else {
      console.error("[review] unexpected", error);
    }
    return reply({ ok: false, reason: "failed", message: "첨삭하다 문제가 생겼어요. 잠시 뒤 다시 시도해 주세요." }, 502);
  }

  if (message.stop_reason === "refusal") {
    return reply({ ok: false, reason: "refused", message: "이 코드는 AI가 첨삭하지 못했어요. 코드를 조금 바꿔서 다시 시도해 주세요." }, 422);
  }
  const result = message.parsed_output;
  if (!result) {
    console.error("[review] parse failed", message.stop_reason);
    return reply({ ok: false, reason: "failed", message: "첨삭 결과를 읽지 못했어요. 다시 시도해 주세요." }, 502);
  }

  // 5) 기록 저장 (실패해도 결과는 보여줘요)
  const { error: insertError } = await db.from("writing_reviews").insert({
    lesson_id: lesson.meta.id,
    task_id: task.id,
    code,
    result,
    model: message.model,
    input_tokens: message.usage.input_tokens,
    output_tokens: message.usage.output_tokens,
  });
  if (insertError) console.error("[review] insert failed", insertError.message);

  return reply({ ok: true, result, remainingToday: Math.max(0, DAILY_LIMIT - used - 1) }, 200);
}
