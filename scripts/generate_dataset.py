"""
연습용 쇼핑몰·결제 데이터 생성기

- 표준 라이브러리만 써요 (pandas 설치 없이 실행 가능).
- 시드를 고정해서 몇 번을 실행해도 똑같은 데이터가 나와요.
  → 레슨에 적힌 출력 결과가 언제나 맞도록 하기 위해서예요.
- 결측치·중복 같은 "현실의 지저분함"을 일부러 조금 넣었어요. 자세한 내용은 docs/dataset.md.

실행: python3 scripts/generate_dataset.py
"""

import csv
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path

SEED = 42
N_CUSTOMERS = 1000
N_ORDERS = 5000
KST = timezone(timedelta(hours=9))
START = datetime(2025, 1, 1, tzinfo=KST)
END = datetime(2025, 12, 31, 23, 59, 59, tzinfo=KST)

OUT = Path(__file__).resolve().parent.parent / "public" / "datasets" / "shop"

rng = random.Random(SEED)

REGIONS = ["서울", "경기", "인천", "부산", "대구", "대전", "광주", "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"]
REGION_WEIGHTS = [19, 26, 6, 7, 5, 3, 3, 2, 1, 3, 3, 4, 3, 3, 5, 6, 1]
AGE_GROUPS = ["10대", "20대", "30대", "40대", "50대", "60대 이상"]
AGE_WEIGHTS = [4, 26, 30, 22, 12, 6]
TIERS = ["basic", "silver", "gold", "vip"]
TIER_WEIGHTS = [60, 25, 12, 3]

# (상품명, 카테고리, 정가)
PRODUCTS = [
    ("무선 이어폰", "전자기기", 89000), ("블루투스 스피커", "전자기기", 59000), ("보조배터리 10000mAh", "전자기기", 25900),
    ("USB-C 충전 케이블", "전자기기", 9900), ("스마트워치 밴드", "전자기기", 15900), ("무선 마우스", "전자기기", 32000),
    ("기계식 키보드", "전자기기", 129000), ("노트북 거치대", "전자기기", 39000), ("웹캠", "전자기기", 69000),
    ("반팔 티셔츠", "의류", 19900), ("데님 팬츠", "의류", 49000), ("후드 집업", "의류", 59000), ("양말 5족 세트", "의류", 12900),
    ("경량 패딩", "의류", 89000), ("러닝 반바지", "의류", 29000), ("니트 가디건", "의류", 45000), ("캔버스 스니커즈", "의류", 69000),
    ("수분 크림", "뷰티", 32000), ("선크림 SPF50", "뷰티", 18900), ("클렌징 폼", "뷰티", 11900), ("립밤", "뷰티", 7900),
    ("시트 마스크 10매", "뷰티", 15000), ("헤어 오일", "뷰티", 22000), ("핸드크림 3종", "뷰티", 16900),
    ("원두 커피 500g", "식품", 18900), ("그래놀라 1kg", "식품", 14900), ("단백질 쉐이크", "식품", 39900), ("견과류 30봉", "식품", 24900),
    ("탄산수 24병", "식품", 13900), ("올리브유 500ml", "식품", 15900), ("즉석밥 24개", "식품", 21900), ("제주 감귤 5kg", "식품", 27900),
    ("텀블러 500ml", "생활", 23000), ("극세사 수건 5장", "생활", 19900), ("디퓨저", "생활", 26000), ("수납 박스 3개", "생활", 17900),
    ("무선 청소기 필터", "생활", 12000), ("주방 세제 리필", "생활", 8900), ("욕실 슬리퍼", "생활", 9900), ("LED 스탠드", "생활", 42000),
    ("요가 매트", "스포츠", 29900), ("덤벨 2kg 세트", "스포츠", 24000), ("폼롤러", "스포츠", 19000), ("등산 양말", "스포츠", 9900),
    ("자전거 라이트", "스포츠", 21000), ("스포츠 물병", "스포츠", 12900), ("캠핑 의자", "스포츠", 49000), ("수영 고글", "스포츠", 18000),
    ("데일리 플래너", "문구", 14000), ("젤펜 10색", "문구", 8900), ("A5 노트 3권", "문구", 7500), ("데스크 매트", "문구", 19900),
    ("만년필", "문구", 35000), ("스티커 세트", "문구", 5900), ("파일 정리함", "문구", 11000), ("형광펜 6색", "문구", 6500),
    ("강아지 간식", "반려동물", 12900), ("고양이 모래 7L", "반려동물", 15900), ("반려동물 장난감", "반려동물", 9900), ("펫 하네스", "반려동물", 24900),
]

CHANNELS = ["app", "web", "mobile_web"]
CHANNEL_WEIGHTS = [60, 25, 15]
METHODS = ["card", "easy_pay", "bank_transfer", "virtual_account"]
METHOD_WEIGHTS = [52, 35, 8, 5]
CARD_COMPANIES = ["신한", "삼성", "현대", "KB국민", "롯데", "하나", "우리", "BC"]
EASY_PAY = ["카카오페이", "네이버페이", "토스페이", "페이코"]
COUPONS = ["WELCOME10", "SUMMER5000", "VIP15", "FREESHIP"]


def iso(dt: datetime | None) -> str:
    return dt.isoformat(timespec="seconds") if dt else ""


def random_time(start: datetime, end: datetime) -> datetime:
    span = int((end - start).total_seconds())
    return start + timedelta(seconds=rng.randint(0, span))


def write_csv(name: str, header: list[str], rows: list[list]) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    with open(OUT / name, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)
    print(f"{name}: {len(rows):,}행")


def main() -> None:
    # 1) 상품
    products = []
    for i, (name, category, price) in enumerate(PRODUCTS, start=1):
        cost = int(price * rng.uniform(0.45, 0.7) / 100) * 100
        products.append([f"P{i:03d}", name, category, price, cost])

    # 2) 고객 — 지역 결측 약 2%
    customers = []
    for i in range(1, N_CUSTOMERS + 1):
        signed = random_time(datetime(2023, 1, 1, tzinfo=KST), datetime(2025, 11, 30, tzinfo=KST))
        region = rng.choices(REGIONS, REGION_WEIGHTS)[0] if rng.random() > 0.02 else ""
        customers.append([
            f"C{i:05d}", iso(signed), region,
            rng.choices(AGE_GROUPS, AGE_WEIGHTS)[0],
            rng.choices(TIERS, TIER_WEIGHTS)[0],
            "true" if rng.random() < 0.55 else "false",
        ])
    tier_of = {c[0]: c[4] for c in customers}
    signed_of = {c[0]: datetime.fromisoformat(c[1]) for c in customers}

    # 단골 고객이 더 자주 주문하도록 가중치
    cust_weights = [rng.paretovariate(1.6) for _ in customers]

    orders, items, payments = [], [], []
    pay_seq = 0
    for n in range(1, N_ORDERS + 1):
        cid = rng.choices(customers, cust_weights)[0][0]
        ordered = random_time(max(START, signed_of[cid]), END)
        order_id = f"O{ordered:%Y%m%d}-{n:05d}"
        channel = rng.choices(CHANNELS, CHANNEL_WEIGHTS)[0]

        # 주문 상세: 1~4개 품목
        n_lines = rng.choices([1, 2, 3, 4], [55, 28, 12, 5])[0]
        chosen = rng.sample(products, n_lines)
        subtotal = 0
        for line_no, p in enumerate(chosen, start=1):
            qty = rng.choices([1, 2, 3], [78, 17, 5])[0]
            discount = rng.choice([0, 0, 0, 1000, 2000, 3000]) if p[3] >= 15000 else 0
            discount = min(discount, p[3] * qty)
            subtotal += p[3] * qty - discount
            items.append([order_id, line_no, p[0], qty, p[3], discount])

        coupon = ""
        coupon_discount = 0
        if rng.random() < 0.18:
            coupon = rng.choice(COUPONS)
            if coupon == "WELCOME10":
                coupon_discount = int(subtotal * 0.10 / 10) * 10
            elif coupon == "SUMMER5000":
                coupon_discount = 5000 if subtotal >= 30000 else 0
            elif coupon == "VIP15" and tier_of[cid] == "vip":
                coupon_discount = int(subtotal * 0.15 / 10) * 10
        shipping_fee = 0 if subtotal >= 50000 or coupon == "FREESHIP" else 3000
        total = subtotal - coupon_discount + shipping_fee

        # 결제
        method = rng.choices(METHODS, METHOD_WEIGHTS)[0]
        provider = (
            rng.choice(CARD_COMPANIES) if method == "card"
            else rng.choice(EASY_PAY) if method == "easy_pay"
            else ""
        )
        installment = rng.choices([0, 2, 3, 6], [80, 8, 8, 4])[0] if method == "card" and total >= 50000 else 0
        requested = ordered + timedelta(seconds=rng.randint(5, 120))

        r = rng.random()
        if r < 0.025:  # 결제 실패
            pay_status, approved, canceled, canceled_amt, order_status = "aborted", None, None, 0, "payment_failed"
        else:
            approved = requested + timedelta(seconds=rng.randint(1, 15))
            if method == "virtual_account":
                approved = requested + timedelta(hours=rng.randint(1, 48))
            r2 = rng.random()
            if r2 < 0.06:
                pay_status, order_status = "canceled", "canceled"
                canceled = approved + timedelta(hours=rng.randint(1, 72))
                canceled_amt = total
            elif r2 < 0.09:
                pay_status, order_status = "partial_canceled", "partially_refunded"
                canceled = approved + timedelta(days=rng.randint(2, 14))
                canceled_amt = min(total, rng.choice([3000, 5000, 10000, int(total * 0.3 / 100) * 100]))
            else:
                pay_status, canceled, canceled_amt = "done", None, 0
                age_days = (END - ordered).days
                order_status = "delivered" if age_days > 5 else rng.choice(["paid", "shipped", "delivered"])

        orders.append([order_id, cid, iso(ordered), order_status, channel, coupon, coupon_discount, shipping_fee, total])

        pay_seq += 1
        row = [f"PAY{pay_seq:06d}", order_id, method, provider, installment, total, pay_status,
               iso(requested), iso(approved), iso(canceled), canceled_amt]
        payments.append(row)
        # 결제 대행사 웹훅이 재전송되면서 같은 결제가 두 번 기록되는 경우 (약 0.6%)
        if pay_status == "done" and rng.random() < 0.006:
            payments.append(list(row))

    write_csv("products.csv", ["product_id", "product_name", "category", "list_price", "cost_price"], products)
    write_csv("customers.csv", ["customer_id", "signed_up_at", "region", "age_group", "membership_tier", "marketing_opt_in"], customers)
    write_csv("orders.csv", ["order_id", "customer_id", "ordered_at", "order_status", "channel", "coupon_code", "coupon_discount", "shipping_fee", "total_amount"], orders)
    write_csv("order_items.csv", ["order_id", "line_no", "product_id", "quantity", "unit_price", "discount_amount"], items)
    write_csv("payments.csv", ["payment_id", "order_id", "method", "provider", "installment_months", "amount", "status", "requested_at", "approved_at", "canceled_at", "canceled_amount"], payments)


if __name__ == "__main__":
    main()
