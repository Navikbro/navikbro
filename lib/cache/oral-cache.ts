import { unstable_cache } from "next/cache";

import {
    getOralBatchQuestions,
    getOralCategoryData,
    getOralMmdMetadata,
} from "@/services/orals/oralBatch.service";

function getOralQuestionsCache(
    category: string,
    mmd: string
) {

    const normalizedCategory =
        category.trim().toLowerCase();

    const normalizedMmd =
        mmd.trim();

    return unstable_cache(

        async () => {

            return getOralBatchQuestions(
                normalizedCategory,
                normalizedMmd
            );

        },

        [
            "oral-questions",
            normalizedCategory,
            normalizedMmd,
        ],

        {
            tags: [
                `oral-${normalizedCategory}-${normalizedMmd}`,
            ],
        }

    );

}

function getOralCategoryDataCache(
    category: string
) {

    const normalizedCategory =
        category.trim().toLowerCase();

    return unstable_cache(

        async () => {

            return getOralCategoryData(
                normalizedCategory
            );

        },

        [
            "oral-category-data",
            normalizedCategory,
        ],

        {
            tags: [
                `oral-${normalizedCategory}-meta`,
            ],
        }

    );

}

function getOralMmdMetadataCache(
    category: string,
    mmd: string
) {

    const normalizedCategory =
        category.trim().toLowerCase();

    const normalizedMmd =
        mmd.trim();


    return unstable_cache(

        async () => {

            return getOralMmdMetadata(
                normalizedCategory,
                normalizedMmd
            );

        },

        [
            "oral-mmd-meta",
            normalizedCategory,
            normalizedMmd,
        ],

        {
            tags: [
                `oral-${normalizedCategory}-${normalizedMmd}-meta`,
            ],
        }

    );
}

export async function getCachedOralQuestions(
    category: string,
    mmd: string
) {

    return getOralQuestionsCache(
        category,
        mmd
    )();

}

export async function getCachedOralCategoryData(
    category: string
) {

    return getOralCategoryDataCache(
        category
    )();

}

export async function getCachedOralMmdMetadata(
    category: string,
    mmd: string
) {

    return getOralMmdMetadataCache(
        category,
        mmd
    )();

}