import { unstable_cache } from "next/cache";
import {
  getQuestionsPaginated,
  PaginatedQuestions,
} from "@/services/firestore";

export const getCachedFirstQuestions = unstable_cache(
  async (category: string): Promise<PaginatedQuestions> => {
    return getQuestionsPaginated(category);
  },
  ["oral-first-page"],
  {
    revalidate: 300, // 5 minutes
  }
);