

import UserGreeting from "@/components/home/UserGreeting";
import QuestionsContainer from "@/components/questions/QuestionsContainer";
import Link from "next/link";
import SubscriptionGuard from "@/components/subscription/SubscriptionGuard";
import { ArrowLeft, Sailboat } from "lucide-react";
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

  const page = titles[category.toLowerCase()] ?? {
    title: category.toUpperCase(),
    subtitle: "ORAL QUESTIONS",
    quote:
      "Success belongs to those who prepare before opportunity arrives.",
  };

  return (
    <SubscriptionGuard>
      <main className="min-h-screen bg-[#f5f5f5]">
        <div className="mx-auto max-w-5xl px-5 py-8">

          {/* HEADER */}
          <div className="mb-6 rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-sm">

            {/* Top Row */}
            <div className="flex items-center justify-between">

              <Link
                href="/"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 transition hover:bg-gray-50"
              >
                <ArrowLeft size={19} />
              </Link>

              <div className="flex h-10 w-10 items-center justify-center rotate-[-8deg]">
                <Sailboat
                  size={28}
                  strokeWidth={2}
                  className="text-black"
                />
              </div>

            </div>


            {/* Greeting */}
            <div className="mt-5">
              <UserGreeting />
            </div>


            {/* Quote */}
            <div className="mt-4 border-l-4 border-black pl-3">

              <p className="text-xs italic leading-5 text-gray-600">
                {page.quote}
              </p>

            </div>


            {/* Category */}
            <div className="mt-4 flex items-center gap-2">

              <span className="inline-flex rounded-lg bg-black px-3 py-1 text-xs font-semibold tracking-wider text-white">
                {page.title}
              </span>

              <h1 className="text-lg font-bold tracking-tight">
                {page.subtitle}
              </h1>

            </div>


            {/* Stats — Bottom */}
            <div className="mt-4 flex items-center gap-3 text-xs font-medium text-gray-600">

              <span>
                {meta.questionCount} Questions
              </span>

              <span>•</span>

              <span>
                {meta.topicCount} Topics
              </span>

            </div>

          </div>

          {/* Questions */}
          <QuestionsContainer
            category={normalizedCategory}
            initialQuestions={[]}
            filters={filters}
            mmdData={categoryData.mmdData}

            totalQuestions={meta.questionCount}
          />

        </div>
      </main>

    </SubscriptionGuard>
  );
}