import OralCategoryClient from "@/components/orals/OralCategoryClient";
import SubscriptionGuard from "@/components/subscription/SubscriptionGuard";

import {
    getCachedOralCategoryData,
} from "@/lib/cache/oral-cache";

interface PageProps {
    params: Promise<{
        category: string;
    }>;
}

export default async function OralCategoryPage({
    params,
}: PageProps) {
    const { category } = await params;

    const normalizedCategory =
        category.toLowerCase();

    const categoryData =
        await getCachedOralCategoryData(
            normalizedCategory
        );

    const filters = categoryData.filters;

    const meta = {
        batchCount: categoryData.batchCount,
        questionCount: categoryData.questionCount,
        topicCount: categoryData.topicCount,
    };

    const mmdData = categoryData.mmdData;

    const titles: Record<
        string,
        {
            title: string;
            subtitle: string;
            quote: string;
        }
    > = {
        fn3: {
            title: "FN3",
            subtitle: "SAFETY",
            quote:
                "Today's revision is tomorrow's Promotion.",
        },

        fn4b: {
            title: "FN4B",
            subtitle: "MOTOR",
            quote:
                "Knowledge grows one question at a time.",
        },

        fn5: {
            title: "FN5",
            subtitle: "ELECTRICAL",
            quote:
                "Consistency beats intensity in exam preparation.",
        },

        fn6: {
            title: "FN6",
            subtitle: "MEP",
            quote:
                "Small improvements every day lead to big results.",
        },
    };

    const page =
        titles[normalizedCategory] ?? {
            title: category.toUpperCase(),
            subtitle: "ORAL QUESTIONS",
            quote:
                "Success belongs to those who prepare before opportunity arrives.",
        };

    return (
        <SubscriptionGuard>
            <main className="min-h-screen bg-[#f5f5f5]">

                {/* KEEP THIS OUTER RESPONSIVE CONTAINER */}
                <div className="mx-auto max-w-7xl px-5 py-8">

                    <OralCategoryClient
                        category={normalizedCategory}
                        initialQuestions={[]}
                        filters={filters}
                        mmdData={mmdData}
                        totalQuestions={
                            meta.questionCount
                        }
                        topicCount={
                            meta.topicCount
                        }
                        title={page.title}
                        subtitle={page.subtitle}
                        quote={page.quote}
                    />

                </div>

            </main>
        </SubscriptionGuard>
    );
}