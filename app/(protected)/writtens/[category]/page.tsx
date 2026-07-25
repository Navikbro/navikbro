import WrittensClient from "../[category]/WrittensClient";
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

  return (
    <WrittensClient
      initialQuestions={questions}
      category={normalizedCategory}
    />
  );
}