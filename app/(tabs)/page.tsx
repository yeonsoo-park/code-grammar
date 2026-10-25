import { HomeToday } from "@/components/home/HomeToday";
import { getAllLessons } from "@/lib/content/load";

export default function HomePage() {
  const lessons = getAllLessons().map((l) => ({ id: l.meta.id, title: l.meta.title, unit: l.meta.unit.title, unitId: l.meta.unit.id, minutes: l.meta.minutes }));
  return <HomeToday lessons={lessons} />;
}
