const PAGE_LOCKED = true;

import UserGreeting from "@/components/home/UserGreeting";
import InsightSwitcher from "@/components/home/InsightSwitcher";

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

   if (PAGE_LOCKED) {
    return (
      <main className="min-h-screen bg-[#f5f5f5]">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-5">

          <div className="w-full rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full">
              <Sailboat
                size={32}
                className="text-black"
              />
            </div>

            <h1 className="text-2xl font-bold">
              Topics Section Coming Soon
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              We are preparing this section to give you a better revision
              experience. Stay tuned for updates.
            </p>

            <Link
              href={`/orals/${category}`}
              className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Go Back
            </Link>

          </div>

        </div>
      </main>
    );
  }
}