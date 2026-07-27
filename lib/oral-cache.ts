import { unstable_cache } from "next/cache";
import { getAllOralBatchQuestions } from "@/services/oralBatch.service";

export async function getCachedAllOralQuestions(
    category: string
) {

    const normalizedCategory =
        category.trim().toLowerCase();


    const cached =
        unstable_cache(
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


    return cached();

}