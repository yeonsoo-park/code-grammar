import type { Metadata } from "next";
import { UnitGrid } from "@/components/learn/UnitGrid";
import { getUnits } from "@/lib/content/curriculum";

export const metadata: Metadata = { title: "학습" };

export default function LearnPage() {
  return <UnitGrid units={getUnits()} />;
}
