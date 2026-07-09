import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getWrittenStats(category: string) {
  const ref = doc(db, "writtens", category);

  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return {
      questions: 0,
      topics: 0,
      updatedAt: null,
    };
  }

  const data = snapshot.data();

  return {
    questions: data.questionCount ?? 0,
    topics: data.topicCount ?? 0,
    updatedAt: data.updatedAt?.toDate?.() ?? null,
  };
}