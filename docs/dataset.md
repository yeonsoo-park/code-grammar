# 연습 데이터셋: 온라인 쇼핑몰 주문·결제

모든 레슨이 같은 데이터를 계속 써요. 영어 교재에서 같은 등장인물이 매 과에 나오는 것처럼, 데이터가 익숙해질수록 코드에만 집중할 수 있어요.

- 위치: `public/datasets/shop/*.csv` (브라우저에서 `/datasets/shop/orders.csv`로 불러올 수 있어요)
- 생성: `python3 scripts/generate_dataset.py` (시드 42 고정 — 몇 번을 실행해도 같은 데이터)
- 기간: 2025-01-01 ~ 2025-12-31, 시간은 한국 시간(`+09:00`)이 붙은 ISO 8601 형식
- 금액: 원화 정수(소수점 없음)

## 왜 이런 구조인가요 (업계 표준)

실제 이커머스 회사는 "주문 한 건"을 여러 테이블에 나눠 저장해요. 주문 정보, 주문에 담긴 상품 목록, 결제 기록이 서로 다른 시점에 다른 시스템에서 만들어지기 때문이에요. 이 데이터도 같은 방식으로 나눴어요.

```
customers 1 ──< orders 1 ──< order_items >── 1 products
                       1 ──< payments
```

- 이름 규칙: 컬럼은 `snake_case`, 시각은 `_at`, 금액은 `_amount`·`_price`·`_fee`
- 상태 값은 영어 소문자 코드(`done`, `canceled` …)로 저장해요. 화면에 보여줄 때 한국어로 바꾸는 게 일반적이에요.

## 테이블 설명

### customers (고객, 1,000행)

| 컬럼 | 예시 | 설명 |
|---|---|---|
| customer_id | C00001 | 고객 번호 (기본 키) |
| signed_up_at | 2025-09-21T04:55:13+09:00 | 가입 시각 |
| region | 경기 | 시·도. **약 2%가 빈 값** |
| age_group | 30대 | 연령대 |
| membership_tier | silver | basic / silver / gold / vip |
| marketing_opt_in | true | 마케팅 수신 동의 |

### products (상품, 60행)

| 컬럼 | 예시 | 설명 |
|---|---|---|
| product_id | P001 | 상품 번호 (기본 키) |
| product_name | 무선 이어폰 | 상품명 |
| category | 전자기기 | 전자기기·의류·뷰티·식품·생활·스포츠·문구·반려동물 |
| list_price | 89000 | 정가 |
| cost_price | 54200 | 원가 (마진 계산용) |

### orders (주문, 5,000행)

| 컬럼 | 예시 | 설명 |
|---|---|---|
| order_id | O20250719-00001 | 주문 번호 (기본 키) |
| customer_id | C00430 | 주문한 고객 |
| ordered_at | 2025-07-19T08:49:19+09:00 | 주문 시각 |
| order_status | delivered | paid / shipped / delivered / canceled / partially_refunded / payment_failed |
| channel | app | app / web / mobile_web |
| coupon_code | WELCOME10 | 사용한 쿠폰 (없으면 빈 값) |
| coupon_discount | 3270 | 쿠폰 할인 금액 |
| shipping_fee | 3000 | 배송비 (상품 금액 5만 원 이상 또는 FREESHIP 쿠폰이면 0) |
| total_amount | 32430 | 최종 결제 금액 = 상품 금액 − 쿠폰 할인 + 배송비 |

### order_items (주문 상세, 약 8,400행)

| 컬럼 | 예시 | 설명 |
|---|---|---|
| order_id | O20250719-00001 | 주문 번호 |
| line_no | 1 | 주문 안에서의 순번 (`order_id` + `line_no`가 기본 키) |
| product_id | P044 | 상품 번호 |
| quantity | 2 | 수량 |
| unit_price | 9900 | 주문 당시 단가 |
| discount_amount | 0 | 상품 즉시 할인 |

### payments (결제, 약 5,000행)

결제 대행사(PG) 응답 형식을 참고했어요.

| 컬럼 | 예시 | 설명 |
|---|---|---|
| payment_id | PAY000001 | 결제 번호 |
| order_id | O20250719-00001 | 주문 번호 |
| method | card | card / easy_pay / bank_transfer / virtual_account |
| provider | 하나 | 카드사 또는 간편결제 이름 (계좌이체·가상계좌는 빈 값) |
| installment_months | 0 | 할부 개월 (0 = 일시불) |
| amount | 32430 | 결제 요청 금액 |
| status | done | done / canceled / partial_canceled / aborted(실패) |
| requested_at | … | 결제 요청 시각 |
| approved_at | … | 승인 시각 (실패면 빈 값, 가상계좌는 입금까지 몇 시간~이틀) |
| canceled_at | … | 취소 시각 |
| canceled_amount | 0 | 취소된 금액 |

## 일부러 넣어 둔 "지저분함"

나중 레슨(결측치 처리, 중복 제거, 코드 리뷰)에서 쓰려고 넣었어요.

- `customers.region` 빈 값 약 20건
- `payments`에 **완전히 똑같은 행이 36건** 중복 — 결제 대행사 웹훅이 재전송되며 두 번 기록되는 실제 사례를 흉내 냈어요. 중복을 지우지 않고 매출을 합치면 금액이 부풀어요.
- 결제 실패(`aborted`) 건은 `approved_at`이 비어 있어요.
