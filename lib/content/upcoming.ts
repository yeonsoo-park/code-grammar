/**
 * 아직 만들지 않은 레슨까지 포함한 커리큘럼 목차.
 * 학습 탭에서 "곧 열려요"로 보여줘서 전체 지도를 미리 볼 수 있게 해요.
 */
export const CURRICULUM: { id: string; title: string; lessons: string[] }[] = [
  { id: "python-basics", title: "Python 기초", lessons: ["변수와 자료형", "리스트와 딕셔너리", "조건문과 반복문", "함수", "컴프리헨션"] },
  { id: "python-data", title: "데이터 분석 Python", lessons: ["NumPy 배열과 벡터화", "pandas DataFrame", "필터링·groupby·merge", "결측치와 중복 처리"] },
  { id: "sql-basics", title: "SQL 기초", lessons: ["SELECT·WHERE", "ORDER BY·LIMIT", "집계·GROUP BY·HAVING", "JOIN"] },
  { id: "sql-intermediate", title: "SQL 중급", lessons: ["서브쿼리", "CTE (WITH)", "윈도우 함수", "CASE WHEN"] },
  {
    id: "efficiency",
    title: "효율성·코드 리뷰",
    lessons: ["반복문 vs 벡터화", "apply를 피해야 할 때", "메모리와 dtype", "인덱스와 실행계획", "쿼리 리팩터링", "pandas ↔ SQL 같은 문제 두 방식", "코드 리뷰 실습"],
  },
];
