import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getOralStats(category: string) {
  const questionsRef = collection(db, "orals", category, "questions");

  const snapshot = await getDocs(questionsRef);

  const topics = new Set<string>();
  let latestUpdated: Date | null = null;

  snapshot.forEach((doc) => {
    const data = doc.data();

    if (typeof data.topic === "string" && data.topic.trim() !== "") {
      topics.add(data.topic.trim());
    }

    if (data.updatedAt?.toDate) {
      const date = data.updatedAt.toDate();

      if (!latestUpdated || date > latestUpdated) {
        latestUpdated = date;
      }
    }
  });

  return {
    questions: snapshot.size,
    topics: topics.size,
    updatedAt: latestUpdated,
  };
}