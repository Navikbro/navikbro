import { unstable_cache } from "next/cache";
import { getWrittenQuestions } from "@/services/writtens/written.service";


function getWrittenQuestionsCache(
    category: string
) {

    const normalizedCategory =
        category.trim().toLowerCase();


    return unstable_cache(

        async () => {

            return getWrittenQuestions(
                normalizedCategory
            );

        },

        [
            "written-questions",
            normalizedCategory,
        ],

        {
            tags: [
                `written-${normalizedCategory}`,
            ],
        }

    );

}



export async function getCachedWrittenQuestions(
    category: string
) {

    return getWrittenQuestionsCache(
        category
    )();

}