

import UserGreeting from "@/components/UserGreeting";
import QuestionsContainer from "@/components/QuestionsContainer";

import Link from "next/link";
import { ArrowLeft, Sailboat } from "lucide-react";
import InsightSwitcher from "@/components/InsightSwitcher";
import { getOralCategoryMeta } from "@/services/firestore";
interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function OralCategoryPage({
  params,
}: PageProps) {
  const { category } = await params;
  const meta = await getOralCategoryMeta(category);

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

  const topics = 0;

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <div className="mx-auto max-w-5xl px-5 py-8">

        {/* HEADER */}
        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

          {/* Top Row */}
          <div className="flex items-center justify-between">

            <Link
              href="/"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 transition hover:bg-gray-50"
            >
              <ArrowLeft size={20} />
            </Link>

            <div className="flex h-12 w-12 items-center justify-center rotate-[-8deg]">
              <Sailboat
                size={30}
                strokeWidth={2}
                className="text-black"
              />
            </div>

          </div>

          {/* Greeting */}
          <div className="mt-7">
            <UserGreeting />
          </div>

          {/* Quote */}
          <div className="mt-6 border-l-4 border-black pl-4">

            <p className="text-sm italic leading-6 text-gray-600">
              {page.quote}
            </p>

          </div>

          {/* Badge */}
          <div className="mt-6">

            <span className="inline-flex rounded-lg bg-black px-3 py-1 text-xs font-semibold tracking-wider text-white">
              {page.title}
            </span>

          </div>

          {/* Category */}
          <div className="mt-5">

            <h1 className="mt-4 text-xl md:text-2xl font-bold tracking-tight">
              {page.subtitle}
            </h1>

          </div>

          {/* Stats */}
          <div className="mt-5 flex items-center gap-3 text-sm font-medium text-gray-600">
            <span>{meta.questionCount} Questions</span>

            <span>•</span>

            <span>{meta.topicCount} Topics</span>
          </div>

        </div>

        <InsightSwitcher
          category={category}
          current="questions"
        />

        {/* Questions */}
        <QuestionsContainer
          category={category}
        />

      </div>
    </main>
  );
}