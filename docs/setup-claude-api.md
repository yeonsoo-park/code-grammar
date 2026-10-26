# Claude API 설정 체크리스트 (M4 · AI 첨삭)

직접 하셔야 하는 일이에요. 15분 정도 걸려요.

> **API 키는 비밀번호와 같아요.** 이 채팅이나 GitHub에 절대 붙이지 마세요. **Vercel 설정 화면에만** 넣어요.
> 키가 새면 남이 내 돈으로 AI를 쓸 수 있어요. 그래서 아래 2번에서 월 사용 한도를 꼭 걸어 둬요.

## 예상 비용

- 모델: Claude Opus 5.5 (입력 100만 토큰당 $4, 출력 100만 토큰당 $20)
- 첨삭 1번 ≈ 입력 1,500토큰 + 출력 1,000~1,500토큰 ≈ **약 $0.03 (40원 안팎)**
- 앱이 하루 20번까지만 허용해요 → 하루 최대 약 $0.6, 보통은 한 달 몇 달러예요.

## 1. 첨삭 기록 표 만들기 (Supabase)

- [ ] Supabase → 왼쪽 메뉴 **SQL Editor** → 새 쿼리
- [ ] https://github.com/yeonsoo-park/code-grammar/blob/main/supabase/migrations/0002_writing_reviews.sql 를 열고 **Copy raw file** → 붙여 넣기 → **Run**
- [ ] `Success. No rows returned` 확인, **Table Editor**에 `writing_reviews`가 생겼는지 확인 (Unrestricted 표시 없음)

## 2. Claude API 계정·결제·한도 (Anthropic)

- [ ] https://platform.claude.com 에 들어가서 가입하거나 로그인해요.
- [ ] 왼쪽 메뉴 **Billing**(결제) → **Add credits**(크레딧 충전): 선불이에요. 최소 금액($5)이면 충분해요.
- [ ] **Limits**(한도) → **Spend limit**(월 사용 한도)를 **$10** 정도로 걸어요. 한도에 닿으면 첨삭만 멈추고 추가 요금은 나가지 않아요.
- [ ] **API Keys** → **Create Key** → 이름 `code-grammar-vercel` → 만들어진 키(`sk-ant-`로 시작)를 **복사**해요. 이 화면을 닫으면 다시 볼 수 없어서, 바로 3번으로 가요.

## 3. Vercel에 키 넣기

- [ ] Vercel → `code-grammar` → **Settings** → **Environment Variables**
  - Key: `ANTHROPIC_API_KEY`
  - Value: 방금 복사한 키
  - **Sensitive** 스위치가 있으면 켜요(저장 후 값이 다시 보이지 않게)
  - Environments: **Production**과 **Preview** (Development는 꺼도 돼요)
  - **Save**
- [ ] **Deployments** → 맨 위 배포 **⋯** → **Redeploy**

`NEXT_PUBLIC_`이 붙지 않은 이름이라 브라우저로는 전달되지 않고 서버 함수에서만 읽혀요.

## 4. 확인

- [ ] 배포 사이트에서 로그인 → 레슨 → 작문 2단계(번역하기)를 통과 → 결과 시트의 **AI 첨삭 받기**
- [ ] 10~20초 뒤 점수 3개·피드백·고친 코드가 나오면 성공
- [ ] Supabase **Table Editor → writing_reviews**에 한 줄이 생겼는지 확인

## 막혔을 때 확인 순서

1. "AI 첨삭은 곧 열려요" → 3번에서 키 이름 철자(`ANTHROPIC_API_KEY`), Redeploy 했는지 확인
2. "AI 첨삭 설정에 문제가 있어요" → 키를 잘못 복사했거나 지워진 키. 새 키를 만들어 3번 다시
3. "첨삭 기록을 확인하지 못했어요" → 1번 SQL을 실행했는지 확인
4. "AI가 지금 바빠요" → 크레딧이 남아 있는지(2번 Billing), 한도에 닿지 않았는지 확인
