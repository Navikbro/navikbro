import WrittensClient from "../[category]/WrittensClient.tsx";
import { getCachedWrittenQuestions } from "@/lib/written-cache";

export default async function WrittenPage({
  params,
}: {
  params: Promise<{
    category: string;
  }>;
}) {
  const { category } = await params;

  const normalizedCategory = category.toLowerCase();

  const questions = await getCachedWrittenQuestions(
    normalizedCategory
  );

  console.log(
    "SERVER QUESTIONS COUNT:",
    questions.length
  );

  console.log(
    "SERVER FIRST QUESTION:",
    questions[0]
  );

  return (
    <WrittensClient
      initialQuestions={questions}
      category={normalizedCategory}
    />
  );
}