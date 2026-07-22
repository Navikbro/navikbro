import { unstable_cache } from "next/cache";
import { getQuestionsByOrder } from "@/services/firestore";

export const getCachedFirstQuestions = unstable_cache(
  async (category: string) => {
    return getQuestionsByOrder(category, 0, 20);
  },
  ["oral-first-page"],
  {
    revalidate: 300, // 5 minutes
  }
);