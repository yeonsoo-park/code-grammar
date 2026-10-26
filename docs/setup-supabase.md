# Supabase 설정 체크리스트 (M3)

로그인과 기록 저장을 켜는 데 필요한, **직접 하셔야 하는 일**이에요. 15분 정도 걸려요.
화면 이름은 2026년 10월 Supabase 대시보드 기준이에요. 메뉴 위치가 조금 달라도 이름으로 찾으면 돼요.

> 절대 공유하지 않을 것: **데이터베이스 비밀번호**, **secret key**(`sb_secret_…`). 앱에는 필요 없어요.
> 공유해도 되는 것: **Project URL**, **publishable key**(`sb_publishable_…`). 브라우저에 원래 보이는 값이고, 데이터는 RLS 정책이 지켜요.

## 1. 계정과 프로젝트 만들기

- [ ] https://supabase.com 에서 **Start your project** → **Continue with GitHub**를 눌러요(`yeonsoo-park` 계정).
- [ ] **New project**를 눌러요.
  - Organization: 개인용 그대로, 플랜은 **Free**
  - Project name: `code-grammar`
  - Database Password: **Generate a password**를 누르고, 비밀번호 관리자나 메모에 따로 보관해요(앱에는 안 써요)
  - Region: **Northeast Asia (Seoul)**
- [ ] **Create new project**를 누르고 1~2분 기다려요.

## 2. 표(테이블) 만들기

- [ ] 왼쪽 메뉴 **SQL Editor** → **New query**를 눌러요.
- [ ] 저장소의 [`supabase/migrations/0001_learning_records.sql`](../supabase/migrations/0001_learning_records.sql) 내용을 통째로 붙여 넣고 **Run**을 눌러요.
- [ ] 아래쪽에 `Success. No rows returned`가 나오면 성공이에요.
- [ ] 왼쪽 **Table Editor**에서 `lesson_progress`, `review_items`, `study_days` 세 표가 보이는지 확인해요. 표 이름 옆에 빨간 **Unrestricted** 표시가 **없어야** 해요(= 보안 규칙이 켜져 있다는 뜻).

## 3. 로그인 설정

- [ ] **Authentication → URL Configuration**
  - Site URL: `https://code-grammar.vercel.app`
  - Redirect URLs에 두 개 추가: `https://code-grammar.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`
- [ ] **Authentication → Emails → Templates → Magic Link**에서 본문 맨 아래에 이 한 줄을 추가하고 저장해요. 메일에 숫자 코드가 함께 오게 하는 설정이에요.
  ```html
  <p>또는 앱에 이 코드를 입력하세요: <strong>{{ .Token }}</strong></p>
  ```

## 4. 키 복사하기

- [ ] 화면 위쪽 **Connect** 버튼(또는 **Project Settings → Data API**)에서 **Project URL**(`https://xxxx.supabase.co`)을 복사해요.
- [ ] **Project Settings → API Keys**에서 **publishable key**(`sb_publishable_…`)를 복사해요. secret key는 복사하지 않아요.

## 5. Vercel에 키 넣기

- [ ] Vercel → `code-grammar` 프로젝트 → **Settings → Environment Variables**
  - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key
  - Environments: **All Environments** → **Save**
- [ ] **Deployments** → 맨 위 배포의 **⋯** → **Redeploy**를 눌러요. 키는 빌드할 때 앱에 들어가서, 다시 배포해야 반영돼요.

## 6. (로그인 확인 후) 가입 막기 — 선택

혼자 쓰는 동안에는, 처음 로그인한 뒤에 다른 사람이 가입하지 못하게 막아 두면 좋아요. 다른 사람이 가입해도 서로의 기록은 RLS 때문에 볼 수 없지만, 계정이 쌓이지 않게 하는 거예요.

- [ ] **Authentication → Sign In / Providers** → **Allow new users to sign up** 끄기

## 막혔을 때 확인 순서

1. 로그인 메일이 안 와요 → 스팸함 확인 → 무료 플랜은 메일 발송이 시간당 몇 통으로 제한돼서, 1시간쯤 뒤에 다시 시도
2. 메일 링크를 눌렀는데 "로그인하지 못했어요" → 3번의 Redirect URLs 철자 확인 → 메일을 새로 받기(링크는 한 번만 쓸 수 있어요)
3. 앱의 "내 정보"에 로그인 카드가 안 보여요 → 5번의 Redeploy를 했는지 확인
4. "기록을 올리지 못했어요" → 2번의 SQL을 실행했는지, 표 3개가 있는지 확인
