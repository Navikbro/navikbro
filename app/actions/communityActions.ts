"use server";

import { revalidateTag } from "next/cache";

import { adminDb } from "@/lib/firebase/firebase-admin";

export async function approveCommunityAnswer(
  id: string,
  category: string,
  questionId: string
) {
  await adminDb
    .collection("communityAnswers")
    .doc(id)
    .update({
      status: "approved",
    });

  revalidateTag(
    `community-${category.toLowerCase()}-${questionId}`,
    "max"
  );
}

export async function rejectCommunityAnswer(
  id: string,
  category: string,
  questionId: string
) {
  await adminDb
    .collection("communityAnswers")
    .doc(id)
    .delete();

  revalidateTag(
    `community-${category.toLowerCase()}-${questionId}`,
    "max"
  );
}