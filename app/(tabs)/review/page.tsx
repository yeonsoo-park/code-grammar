import type { Metadata } from "next";
import { ReviewPanel, type ReviewQuestion } from "@/components/review/ReviewPanel";
import { getAllLessons } from "@/lib/content/load";

export const metadata: Metadata = { title: "오답노트" };

export default function ReviewPage() {
  const questions: Record<string, ReviewQuestion> = {};
  for (const l of getAllLessons()) {
    for (const q of [...l.quiz.questions, ...l.readingQuiz.questions]) {
      questions[q.id] = { lessonId: l.meta.id, lessonTitle: l.meta.title, question: q };
    }
  }
  return <ReviewPanel questions={questions} />;
}
