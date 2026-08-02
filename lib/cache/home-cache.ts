import { unstable_cache } from "next/cache";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";


export const getHomeStats = unstable_cache(
    async () => {

        // Existing combined metadata
        const homeSnapshot = await getDoc(
            doc(db, "metadata", "homeStats")
        );


        let oralStats = {};


        if (homeSnapshot.exists()) {

            const data =
                homeSnapshot.data();


            oralStats = Object.fromEntries(
                Object.entries(data.oral ?? {})
                    .map(([key, value]: any) => [
                        key,
                        {
                            questions:
                                value.questionCount ?? 0,

                            topics:
                                value.topicCount ?? 0,

                            updatedAt:
                                value.updatedAt
                                    ?.toDate?.() ?? null,
                        },
                    ])
            );
        }



        // NEW Written metadata cache

        const writtenSnapshot =
            await getDoc(
                doc(
                    db,
                    "written_home_metadata",
                    "summary"
                )
            );


        let writtenStats = {};


        if (writtenSnapshot.exists()) {

            const data =
                writtenSnapshot.data();


            writtenStats =
                Object.fromEntries(
                    Object.entries(
                        data.categories ?? {}
                    )
                    .map(([key, value]: any) => [
                        key,
                        {
                            questions:
                                value.questionCount ?? 0,

                            topics:
                                value.topicCount ?? 0,

                            batches:
                                value.batchCount ?? 0,

                            updatedAt:
                                value.updatedAt
                                    ?.toDate?.() ?? null,
                        },
                    ])
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
        tags: [
            "home-stats"
        ],
    }
);