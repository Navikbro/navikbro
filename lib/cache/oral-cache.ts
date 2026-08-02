import { unstable_cache } from "next/cache";

import {
    getAllOralBatchQuestions,
    getOralCategoryData,
} from "@/services/orals/oralBatch.service";



function getOralQuestionsCache(
    category: string
) {

    const normalizedCategory =
        category.trim().toLowerCase();


    return unstable_cache(

        async () => {

            return getAllOralBatchQuestions(
                normalizedCategory
            );

        },

        [
            "oral-all-questions",
            normalizedCategory,
        ],

        {
            tags: [
                `oral-${normalizedCategory}`,
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



export async function getCachedAllOralQuestions(
    category: string
) {

    return getOralQuestionsCache(
        category
    )();

}



export async function getCachedOralCategoryData(
    category: string
) {

    return getOralCategoryDataCache(
        category
    )();

}