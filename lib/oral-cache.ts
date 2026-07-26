import { getOralBatchPage } from "@/services/oralBatch.service";

export async function getCachedOralBatchPage(
  category: string,
  batchNumber: number
) {
  return await getOralBatchPage(category, batchNumber);
}