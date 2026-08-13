import { unstable_cache } from "next/cache";

import {
    getOralTopics,
} from "@/services/orals/oralTopics.service";

/* =========================================================
   CACHED ORAL TOPICS BY CATEGORY
========================================================= */

function getOralTopicsCache(
    category: string
) {
    const normalizedCategory =
        category.trim().toLowerCase();

    return unstable_cache(
        async () => {
            return getOralTopics(
                normalizedCategory
            );
        },

        [
            "oral-topics",
            normalizedCategory,
        ],

        {
            tags: [
                `oral-topics-${normalizedCategory}`,
            ],
        }
    );
}

/* =========================================================
   PUBLIC FUNCTION
========================================================= */

export async function getCachedOralTopics(
    category: string
) {
    return getOralTopicsCache(
        category
    )();
}