import "server-only";
import { cache } from "react";
import { lessonDirs, loadLessonDir } from "./read";
import type { Lesson } from "./schema";

export const getAllLessons = cache((): Lesson[] =>
  lessonDirs()
    .map(loadLessonDir)
    .sort((a, b) => a.meta.unit.order - b.meta.unit.order || a.meta.order - b.meta.order),
);

export const getLesson = cache((id: string): Lesson | undefined => getAllLessons().find((l) => l.meta.id === id));
