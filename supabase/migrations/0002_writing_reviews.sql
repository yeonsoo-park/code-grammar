-- AI 첨삭 기록 (M4)
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여 넣고 Run 하면 돼요. 여러 번 실행해도 안전해요.
--
-- 쓰임새
-- 1) 하루 첨삭 횟수 세기 (API 비용 보호)
-- 2) 나중에 "내 첨삭 모아 보기"에 쓰기
-- 서버 함수는 로그인한 사람의 토큰으로 이 표에 접근해서, RLS 규칙이 그대로 적용돼요.

create table if not exists public.writing_reviews (
  id            bigint generated always as identity primary key,
  user_id       uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  lesson_id     text        not null,
  task_id       text        not null,
  code          text        not null check (char_length(code) <= 4000),
  result        jsonb       not null,           -- 점수·피드백·고친 코드
  model         text        not null,           -- 실제로 답한 모델
  input_tokens  integer     not null default 0,
  output_tokens integer     not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists writing_reviews_user_time_idx on public.writing_reviews (user_id, created_at desc);

alter table public.writing_reviews enable row level security;

-- 자기 첨삭만 읽고, 자기 이름으로만 저장할 수 있어요 (수정·삭제는 막아요)
drop policy if exists "own rows read" on public.writing_reviews;
create policy "own rows read" on public.writing_reviews
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "own rows insert" on public.writing_reviews;
create policy "own rows insert" on public.writing_reviews
  for insert to authenticated
  with check ((select auth.uid()) = user_id);
