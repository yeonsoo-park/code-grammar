# 레슨 콘텐츠 작성 가이드

레슨은 코드와 분리된 JSON 파일이에요. 코드를 몰라도 이 문서만 보고 새 레슨을 추가할 수 있게 정리했어요.

## 1. 폴더 구조

```
content/units/
└─ 01-python-basics/            ← 유닛 폴더 (번호-이름)
   └─ 01-variables/             ← 레슨 폴더 (번호-이름)
      ├─ meta.json              ← 레슨 정보
      ├─ concept.json           ← 1단계 개념
      ├─ quiz.json              ← 2단계 개념 문제
      ├─ reading.json           ← 3단계 독해
      ├─ reading-quiz.json      ← 4단계 독해 문제
      └─ writing.json           ← 5단계 작문
```

새 레슨을 만들 때는 기존 레슨 폴더를 통째로 복사한 뒤 내용을 바꾸는 게 가장 쉬워요.

## 2. 공통 규칙

### 문장 쓰는 법

| 쓰는 법 | 화면에서 | 예 |
|---|---|---|
| `` `코드` `` | 인라인 코드 | `` `groupby`는 묶는 함수예요. `` |
| `**굵게**` | 굵은 글씨 | `**변수**라고 해요.` |
| `&nbsp;` | 줄이 바뀌지 않는 공백 | `3&nbsp;초`, `1단계&nbsp;개념` |

- 문단은 **배열의 한 칸**이에요. 한 문단은 2~4문장으로 써요.
- 문장 중간에 `\n`(강제 줄바꿈)을 넣지 않아요. 줄바꿈은 화면 폭에 맞춰 자동으로 돼요.
- 해요체, 짧은 문장으로 써요.

### 코드 쓰는 법

코드·출력은 **한 줄씩 배열**로 쓰면 고치기 쉬워요. 문자열 하나로 써도 돼요.

```json
"code": ["unit_price = 32000", "print(unit_price)"],
"output": ["32000"]
```

코드 안의 큰따옴표는 `\"`로 써요: `"product_name = \"무선 이어폰\""`

## 3. 파일별 형식

### meta.json

```json
{
  "id": "py-01-variables",               // 영어 소문자·숫자·-만. 주소에 쓰여요
  "unit": { "id": "python-basics", "order": 1, "title": "Python 기초" },
  "order": 1,                            // 유닛 안에서 몇 번째 레슨인지
  "title": "변수와 자료형",
  "summary": "한 문장 요약",
  "minutes": 18,                         // 예상 학습 시간
  "packages": [],                        // pandas가 필요하면 ["pandas"]
  "keywords": [{ "term": "int", "meaning": "정수예요." }]   // 단어장
}
```

### concept.json — 한 화면에 개념 하나

```json
{
  "screens": [
    {
      "id": "variable",
      "title": "화면 제목",
      "analogy": "영어 학습 비유 한 줄 (선택)",
      "body": ["문단 1", "문단 2"],
      "code": { "lang": "python", "code": ["..."], "output": ["..."] },   // 선택
      "after": ["코드 아래 설명 (선택)"],
      "table": { "caption": "표 이름", "head": ["열1", "열2"], "rows": [["값", "값"]] },   // 선택
      "keyPoint": "핵심 한 줄 (선택)"
    }
  ]
}
```

### quiz.json · reading-quiz.json — 객관식

```json
{
  "questions": [
    {
      "id": "py-01-q1",                  // 전체에서 겹치지 않게 (오답노트가 이 id로 기억해요)
      "kind": "concept",                 // 아래 표 참고
      "prompt": ["질문 문단"],
      "code": { "lang": "python", "code": ["..."] },   // 선택
      "choices": [                       // 3~5개, 정답은 1개
        { "id": "a", "text": "선택지 글", "why": "이게 왜 맞는지/틀렸는지" },
        { "id": "b", "code": "True", "why": "..." }     // 코드 선택지
      ],
      "answer": "b",
      "explanation": ["정답 해설"],
      "verifyOutput": true,              // 출력 예측: 정답 text = 실제 출력인지 자동 검사
      "expectError": "TypeError"         // 버그 찾기: 이 에러가 정말 나는지 자동 검사
    }
  ]
}
```

| kind | 화면 표시 | 쓰는 곳 |
|---|---|---|
| `concept` | 개념 확인 | 개념 문제 |
| `predict-output` | 출력 예측 | 독해 문제 (`verifyOutput` 권장) |
| `fill-blank` | 빈칸 추론 | 독해 문제 |
| `find-bug` | 버그 찾기 | 독해 문제 (`expectError` 권장) |
| `compare-efficiency` | 더 나은 코드 고르기 | 독해 문제 (선택지마다 `code`) |

오답 선택지는 **흔한 오해**를 담아야 해요. `why`에는 "그렇게 생각하기 쉬운 이유 + 실제로는"을 써요.

### reading.json — 직독직해

```json
{
  "title": "지문 제목",
  "intro": ["지문 소개"],
  "code": { "lang": "python", "code": ["10~30줄"], "output": ["실행 결과"] },
  "notes": [{ "line": 2, "text": "product_name에 / \"무선 이어폰\"을 넣어요." }],
  "wrapUp": ["정리 문단"]
}
```

`notes`의 `line`은 1부터 세요. 빈 줄에는 해석을 달 수 없어요. `/`로 끊어 읽기를 표현하면 영어 직독직해와 비슷해져요.

### writing.json — 작문 3단계

```json
{
  "tasks": [
    {
      "id": "py-01-w1", "kind": "fill", "title": "빈칸 채우기",
      "prompt": ["설명"],
      "template": ["quantity = ___(quantity_text)"],     // ___ 가 빈칸
      "blanks": [{ "accept": ["int"], "hint": "힌트" }],  // 빈칸 수만큼, 정답 여러 개 가능
      "output": "56700",
      "explanation": ["해설"]
    },
    {
      "id": "py-01-w2", "kind": "translate",              // 또는 "free"
      "title": "요구사항을 코드로 번역하기",
      "prompt": ["설명"],
      "requirements": ["한국어 요구사항 1", "요구사항 2"],
      "starter": ["# 시작 코드"],
      "hint": "힌트",
      "checks": [
        { "code": "assert total_amount == 44800", "pass": "맞았을 때 문구", "fail": "틀렸을 때 문구" },
        { "code": "assert '44800' in __output__", "pass": "...", "fail": "..." }
      ],
      "solution": ["모범 답안"],
      "explanation": ["해설"]
    }
  ]
}
```

`checks`는 학습자 코드를 실행한 **뒤** 같은 공간에서 실행되는 Python 문장이에요. `__output__`에는 학습자 코드가 출력한 글자가 모두 들어 있어요. 모범 답안과 똑같지 않아도 요구사항만 맞으면 통과하도록, 값과 출력을 검사하는 게 좋아요.

## 4. 다 쓴 뒤 꼭 실행하기

```bash
npm run verify:content
```

- JSON 형식이 맞는지
- 예시 코드를 실제로 실행해서 적어 둔 출력과 같은지
- 출력 예측 문제의 정답이 실제 출력과 같은지, 버그 찾기 문제가 정말 에러를 내는지
- 작문 모범 답안이 채점 기준을 모두 통과하는지

를 확인해요. "통과 N개, 실패 0개"가 나와야 해요. 실패하면 어느 파일, 어느 문제인지 알려줘요.
