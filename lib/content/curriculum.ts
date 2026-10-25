import "server-only";
import { getAllLessons } from "./load";
import { CURRICULUM } from "./upcoming";

export type LessonSummary = { id: string; title: string; minutes?: number; open: boolean; order: number };
export type UnitSummary = { id: string; order: number; title: string; lessons: LessonSummary[] };

/** 커리큘럼 목차에 실제로 만든 레슨을 끼워 넣어요. 아직 없는 레슨은 "곧 열려요"로 표시돼요. */
export function getUnits(): UnitSummary[] {
  const lessons = getAllLessons();
  return CURRICULUM.map((u, ui) => ({
    id: u.id,
    order: ui + 1,
    title: u.title,
    lessons: u.lessons.map((title, i) => {
      const real = lessons.find((l) => l.meta.unit.id === u.id && l.meta.order === i + 1);
      return real
        ? { id: real.meta.id, title: real.meta.title, minutes: real.meta.minutes, open: true, order: i + 1 }
        : { id: `${u.id}-${i + 1}`, title, open: false, order: i + 1 };
    }),
  }));
}

export function getUnit(id: string) {
  return getUnits().find((u) => u.id === id);
}
