import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonIntro } from "@/components/lesson/LessonIntro";
import { getAllLessons, getLesson } from "@/lib/content/load";

export const instant = false;

export function generateStaticParams() {
  return getAllLessons().map((l) => ({ lessonId: l.meta.id }));
}

export async function generateMetadata({ params }: PageProps<"/lesson/[lessonId]">): Promise<Metadata> {
  const { lessonId } = await params;
  return { title: getLesson(lessonId)?.meta.title ?? "레슨" };
}

export default async function LessonIntroPage({ params }: PageProps<"/lesson/[lessonId]">) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();
  const { meta, concept, quiz, reading, readingQuiz, writing } = lesson;
  return (
    <LessonIntro
      meta={meta}
      counts={[concept.screens.length, quiz.questions.length, reading.code.code.split("\n").length, readingQuiz.questions.length, writing.tasks.length]}
    />
  );
}
