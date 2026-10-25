import type { Metadata } from "next";
import { LearnList, type UnitView } from "@/components/learn/LearnList";
import { getAllLessons } from "@/lib/content/load";
import { CURRICULUM } from "@/lib/content/upcoming";

export const metadata: Metadata = { title: "학습" };

export default function LearnPage() {
  const lessons = getAllLessons();
  const units: UnitView[] = CURRICULUM.map((u) => ({
    id: u.id,
    title: u.title,
    lessons: u.lessons.map((title, i) => {
      const real = lessons.find((l) => l.meta.unit.id === u.id && l.meta.order === i + 1);
      return real ? { id: real.meta.id, title: real.meta.title, minutes: real.meta.minutes, open: true } : { id: `${u.id}-${i + 1}`, title, open: false };
    }),
  }));
  return <LearnList units={units} />;
}
