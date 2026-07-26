import { unstable_cache } from "next/cache";

import {
  getOralBatchPage,
} from "@/services/oralBatch.service";


export async function getCachedOralBatchPage(
  category: string,
  batchNumber: number,
  batchCount: number
) {

  const cached = unstable_cache(
    async () => {

      return getOralBatchPage(
        category,
        batchNumber,
        batchCount
      );

    },
    [
      "oral-batch-page",
      category,
      String(batchNumber),
    ],
    {
      revalidate: 3600,
    }
  );


  return cached();
}