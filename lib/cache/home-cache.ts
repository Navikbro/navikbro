import { unstable_cache } from "next/cache";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/firebase-admin";

export const getHomeStats = unstable_cache(
    async () => {

        // Oral metadata
        const oralSnapshot = await adminDb
            .collection("oral_batches_metadata")
            .doc("counters")
            .get();

        let oralStats = {};

        if (oralSnapshot.exists) {

            const data = oralSnapshot.data() ?? {};

            oralStats = {
                fn3: {
                    questions: data.fn3?.questionCount ?? 0,
                    topics: data.fn3?.topicCount ?? 0,
                    updatedAt:
                        (data.fn3?.updatedAt as Timestamp | undefined)?.toDate() ?? null,
                },

                fn4b: {
                    questions: data.fn4b?.questionCount ?? 0,
                    topics: data.fn4b?.topicCount ?? 0,
                    updatedAt:
                        (data.fn4b?.updatedAt as Timestamp | undefined)?.toDate() ?? null,
                },

                fn5: {
                    questions: data.fn5?.questionCount ?? 0,
                    topics: data.fn5?.topicCount ?? 0,
                    updatedAt:
                        (data.fn5?.updatedAt as Timestamp | undefined)?.toDate() ?? null,
                },

                fn6: {
                    questions: data.fn6?.questionCount ?? 0,
                    topics: data.fn6?.topicCount ?? 0,
                    updatedAt:
                        (data.fn6?.updatedAt as Timestamp | undefined)?.toDate() ?? null,
                },
            };
        }

        // Written metadata
        const writtenSnapshot = await adminDb
            .collection("written_home_metadata")
            .doc("summary")
            .get();

        let writtenStats = {};

        if (writtenSnapshot.exists) {

            const data = writtenSnapshot.data() ?? {};

            writtenStats = Object.fromEntries(
                Object.entries(data.categories ?? {}).map(
                    ([key, value]: any) => [
                        key,
                        {
                            questions:
                                value.questionCount ?? 0,

                            topics:
                                value.topicCount ?? 0,

                            batches:
                                value.batchCount ?? 0,

                            updatedAt:
                                (value.updatedAt as Timestamp | undefined)?.toDate() ?? null,
                        },
                    ]
                )
            );
        }

        return {
            oralStats,
            writtenStats,
        };
    },

    ["home-stats"],

    {
        revalidate: false,
        tags: ["home-stats"],
    }
);