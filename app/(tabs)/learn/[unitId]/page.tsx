import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UnitDetail } from "@/components/learn/UnitDetail";
import { getUnit, getUnits } from "@/lib/content/curriculum";

export const instant = false;

export function generateStaticParams() {
  return getUnits().map((u) => ({ unitId: u.id }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[unitId]">): Promise<Metadata> {
  const { unitId } = await params;
  return { title: getUnit(unitId)?.title ?? "유닛" };
}

export default async function UnitPage({ params }: PageProps<"/learn/[unitId]">) {
  const { unitId } = await params;
  const unit = getUnit(unitId);
  if (!unit) notFound();
  return <UnitDetail unit={unit} />;
}
