import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { LessonPlayer, LessonSkeleton } from "@/components/lesson/LessonPlayer";
import { getAllLessons, getLesson } from "@/lib/content/load";

export function generateStaticParams() {
  return getAllLessons().map((l) => ({ lessonId: l.meta.id }));
}

export async function generateMetadata({ params }: PageProps<"/lesson/[lessonId]">): Promise<Metadata> {
  const { lessonId } = await params;
  return { title: getLesson(lessonId)?.meta.title ?? "레슨" };
}

export default function LessonPage({ params }: PageProps<"/lesson/[lessonId]">) {
  // 주소에서 레슨 id를 읽는 동안 스켈레톤을 먼저 보여줘요
  return (
    <Suspense fallback={<LessonSkeleton />}>
      <LessonContent params={params} />
    </Suspense>
  );
}

async function LessonContent({ params }: { params: PageProps<"/lesson/[lessonId]">["params"] }) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();
  return <LessonPlayer lesson={lesson} />;
}
