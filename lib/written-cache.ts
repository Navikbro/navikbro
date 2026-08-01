import { getWrittenQuestions } from "@/services/written.service";

export async function getCachedWrittenQuestions(
    category: string
) {
    const normalizedCategory =
        category.trim().toLowerCase();

    return getWrittenQuestions(
        normalizedCategory
    );
}