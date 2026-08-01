import { unstable_cache } from "next/cache";
import { getWrittenQuestions } from "@/services/written.service";

export async function getCachedWrittenQuestions(
    category: string
) {
    const normalizedCategory =
        category.trim().toLowerCase();

    return unstable_cache(
        () =>
            getWrittenQuestions(
                normalizedCategory
            ),
        [
            "written-questions",
            normalizedCategory,
        ],
        {
            revalidate: false,
            tags: [
                `written-${normalizedCategory}`,
            ],
        }
    )();
}