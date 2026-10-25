import type { Metadata } from "next";
import { MePanel } from "@/components/me/MePanel";

export const metadata: Metadata = { title: "내 정보" };

export default function MePage() {
  return <MePanel />;
}
