import { unstable_cache } from "next/cache";
import { getAllOralBatchQuestions } from "@/services/oralBatch.service";

export async function getCachedAllOralQuestions(
  category: string
) {
  const cached = unstable_cache(
    async () => {
      return getAllOralBatchQuestions(category);
    },
    ["oral-all-questions", category],
    {
      tags: [`oral-${category}`],
    }
  );

  return cached();
}