-- 학습 기록 테이블 (M3)
-- Supabase 대시보드 → SQL Editor 에 이 파일 내용을 통째로 붙여 넣고 Run 하면 돼요.
-- 여러 번 실행해도 안전하게 if not exists / drop policy if exists 를 써요.
--
-- 보안: 모든 테이블에 RLS(행 단위 보안)를 켜서, 로그인한 사람은 "자기 행"만 읽고 쓸 수 있어요.
-- 앱이 쓰는 공개 키(publishable key)로는 남의 기록에 절대 접근할 수 없어요.

-- 1) 레슨 진도
create table if not exists public.lesson_progress (
  user_id      uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  lesson_id    text        not null,
  step         integer     not null default 0 check (step >= 0),
  total_steps  integer     not null check (total_steps > 0),
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- 2) 오답노트 (간격 반복)
create table if not exists public.review_items (
  user_id          uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  question_id      text        not null,
  lesson_id        text        not null,
  box              integer     not null default 0 check (box between 0 and 4),
  due              timestamptz,             -- 다 외우면(box = 4) 비어 있어요
  wrong_count      integer     not null default 0,
  last_answered_at timestamptz not null,
  primary key (user_id, question_id)
);

-- 3) 공부한 날 (연속 학습일 계산용)
create table if not exists public.study_days (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day     date not null,
  primary key (user_id, day)
);

-- 복습할 문제를 빨리 찾기 위한 인덱스 (M5 알림에서도 써요)
create index if not exists review_items_due_idx on public.review_items (user_id, due);

-- RLS 켜기
alter table public.lesson_progress enable row level security;
alter table public.review_items    enable row level security;
alter table public.study_days      enable row level security;

-- 정책: 자기 행만 읽기·쓰기·수정·삭제
-- (select auth.uid()) 로 감싸면 행마다 다시 계산하지 않아서 빨라요 (Supabase 권장)
drop policy if exists "own rows" on public.lesson_progress;
create policy "own rows" on public.lesson_progress
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own rows" on public.review_items;
create policy "own rows" on public.review_items
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "own rows" on public.study_days;
create policy "own rows" on public.study_days
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
