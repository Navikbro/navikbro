"use server";

import { getCachedApprovedAnswers } from "@/lib/community-cache";

export async function loadApprovedCommunityAnswers(
  category: string,
  questionId: string
) {
  return getCachedApprovedAnswers(
    category,
    questionId
  );
}