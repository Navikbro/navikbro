import { unstable_cache } from "next/cache";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const getHomeStats = unstable_cache(
    async () => {
        const snapshot = await getDoc(
            doc(db, "metadata", "homeStats")
        );

        if (!snapshot.exists()) {
            return {
                oralStats: {},
                writtenStats: {},
            };
        }

        const data = snapshot.data();

        const oralStats = Object.fromEntries(
            Object.entries(data.oral ?? {}).map(([key, value]: any) => [
                key,
                {
                    questions: value.questionCount ?? 0,
                    topics: value.topicCount ?? 0,
                    updatedAt: value.updatedAt?.toDate?.() ?? null,
                },
            ])
        );

        const writtenStats = Object.fromEntries(
            Object.entries(data.written ?? {}).map(([key, value]: any) => [
                key,
                {
                    questions: value.questionCount ?? 0,
                    topics: value.topicCount ?? 0,
                    updatedAt: value.updatedAt?.toDate?.() ?? null,
                },
            ])
        );

        return {
            oralStats,
            writtenStats,
        };
    },
    ["home-stats"],
    {
        revalidate: 300,
        tags: ["home-stats"] // 5 minutes
    }
);