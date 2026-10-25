import { notFound } from "next/navigation";
import { StressView } from "./StressView";

/**
 * 넘침 검사용 화면 (개발 중에만 열려요)
 * 디자인 규칙 4-4: 가장 긴 텍스트로 테스트 — 긴 한국어 문장, 띄어쓰기 없는 긴 함수명, 긴 URL, 80자 넘는 코드 한 줄
 */
export default function StressPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <StressView />;
}
