import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { getAllLessons, getLesson } from "@/lib/content/load";

// 레슨은 빌드 때 미리 만들어 둬요. 기다렸다가 한 번에 보내야
// 없는 레슨 주소에 404 상태 코드를 제대로 돌려줄 수 있어요.
export const instant = false;

export function generateStaticParams() {
  return getAllLessons().map((l) => ({ lessonId: l.meta.id }));
}

export async function generateMetadata({ params }: PageProps<"/lesson/[lessonId]">): Promise<Metadata> {
  const { lessonId } = await params;
  return { title: getLesson(lessonId)?.meta.title ?? "레슨" };
}

export default async function LessonPage({ params }: PageProps<"/lesson/[lessonId]">) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();
  return <LessonPlayer lesson={lesson} />;
}
