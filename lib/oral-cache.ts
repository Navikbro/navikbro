import { unstable_cache } from "next/cache";

import {
  getAllOralBatchQuestions,
  getOralCategoryData,
} from "@/services/oralBatch.service";


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



export async function getCachedOralCategoryData(
  category: string
) {

  const normalizedCategory =
    category.trim().toLowerCase();


  const cached =
    unstable_cache(
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


  return cached();

}