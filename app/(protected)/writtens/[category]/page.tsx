export const dynamic = "force-dynamic";

import WrittensClient from "../[category]/WrittensClient";
import { getCachedWrittenQuestions } from "@/lib/written-cache";
import SubscriptionGuard from "@/components/subscription/SubscriptionGuard";
export default async function WrittenPage({
  params,
}: {
  params: Promise<{
    category: string;
  }>;
}) {
  const { category } = await params;

  const normalizedCategory = category.toLowerCase();

  const questions = await getCachedWrittenQuestions(
    normalizedCategory
  );

  return (
    <SubscriptionGuard>

      <WrittensClient
        initialQuestions={questions}
        category={normalizedCategory}
      />

    </SubscriptionGuard>
  );
}