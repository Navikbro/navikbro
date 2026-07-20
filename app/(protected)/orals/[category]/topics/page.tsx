import UserGreeting from "@/components/UserGreeting";
import InsightSwitcher from "@/components/InsightSwitcher";

import Link from "next/link";
import { ArrowLeft, Sailboat } from "lucide-react";

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function OralTopicsPage({
  params,
}: PageProps) {
  const { category } = await params;

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
      quote: "Master one topic at a time.",
    },
    fn4b: {
      title: "FN4B",
      subtitle: "MOTOR",
      quote: "Strong concepts build confident answers.",
    },
    fn5: {
      title: "FN5",
      subtitle: "ELECTRICAL",
      quote: "Revise topics. Remember answers.",
    },
    fn6: {
      title: "FN6",
      subtitle: "MEP",
      quote: "Every topic mastered is one step closer to success.",
    },
  };

  const page = titles[category.toLowerCase()] ?? {
    title: category.toUpperCase(),
    subtitle: "TOPICS",
    quote: "Study smarter by focusing on one topic at a time.",
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <div className="mx-auto max-w-5xl px-5 py-8">

        {/* Header */}

        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

          {/* Top */}

          <div className="flex items-center justify-between">

            <Link
              href={`/orals/${category}`}
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

          {/* Title */}

          <div className="mt-5">
            <h1 className="mt-4 text-xl font-bold tracking-tight md:text-2xl">
              {page.subtitle}
            </h1>
          </div>

          {/* Stats */}

          <div className="mt-5 flex items-center gap-3 text-sm font-medium text-gray-600">

            <span>0 Topics</span>

            <span>•</span>

            <span>0 Questions</span>

          </div>

        </div>

        {/* View Switcher */}

        <InsightSwitcher
          category={category}
          current="topics"
        />

        {/* Search */}

        <div className="mb-6">
          {/* Search bar goes here */}
        </div>

        {/* Topics Grid */}

        <div>
          {/* Topic cards go here */}
        </div>

      </div>
    </main>
  );
}