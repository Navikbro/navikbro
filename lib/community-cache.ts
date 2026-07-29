import { unstable_cache } from "next/cache";

import {
  getApprovedAnswers,
} from "@/services/firestore";

export async function getCachedApprovedAnswers(
  category: string,
  questionId: string
) {
  const normalizedCategory =
    category.trim().toLowerCase();

  const cached = unstable_cache(
    async () => {
      return getApprovedAnswers(
        normalizedCategory,
        questionId
      );
    },
    [
      "community-approved-answers",
      normalizedCategory,
      questionId,
    ],
    {
      tags: [
        `community-${normalizedCategory}-${questionId}`,
      ],
    }
  );

  return cached();
}