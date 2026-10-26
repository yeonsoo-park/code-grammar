# 코드 영문법

영어 공부하듯 배우는 Python·SQL 학습 웹앱이에요.
**개념(문법) → 개념 문제 → 코드 독해 → 독해 문제 → 작문(영작)** 5단계로 배우고, 목표는 데이터 분석 코드를 보고 더 효율적인 코드를 판단·리뷰하는 거예요.

## 실행하기

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 을 열어요.

## 자주 쓰는 명령

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run verify:content` | 레슨 JSON 형식 검사 + 예시 코드를 실제로 실행해서 출력 확인 |
| `npm run check:contrast` | 디자인 토큰 색 대비(WCAG AA) 계산 |
| `npm run test:unit` | 기기↔서버 기록 합치기 규칙 테스트 |
| `npm run test:e2e` | 5개 화면 폭·200% 확대·큰 글자에서 가로 넘침 검사 + 스크린샷 |
| `npm run dataset` | 연습 데이터셋 다시 만들기 |
| `npm run build` | 배포용 빌드 |

## 폴더

```
app/              화면 (홈·학습·오답노트·내 정보, 레슨)
components/       화면 조각 (코드 블록, 선택지, 바텀시트, 에디터 …)
content/units/    레슨 콘텐츠 (JSON) → docs/content-schema.md
lib/              콘텐츠 읽기, 학습 기록 저장, 간격 반복, Python 실행
public/datasets/  연습 데이터 (쇼핑몰 주문·결제) → docs/dataset.md
public/workers/   Python 실행 워커 (Pyodide)
styles/tokens.css 디자인 토큰
scripts/          검증·데이터 생성 스크립트
tests/            Playwright 넘침 검사
docs/             데이터셋, 콘텐츠 작성법, AX 학습 로그
```

## 문서

- [레슨 콘텐츠 작성 가이드](docs/content-schema.md)
- [연습 데이터셋](docs/dataset.md)
- [AX 학습 로그](docs/ax-log.md)
- [Supabase 설정 체크리스트](docs/setup-supabase.md)
- [Claude API 설정 체크리스트 (AI 첨삭)](docs/setup-claude-api.md)
