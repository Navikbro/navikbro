"use client";

import Link from "next/link";

interface Props {
  category: string;
  current: "questions" | "topics";
}

export default function InsightSwitcher({
  category,
  current,
}: Props) {
  return (
    <div className="mb-4">
      <div className="flex w-full gap-1 rounded-2xl border border-gray-300 bg-white p-1">

        <Link
          href={`/orals/${category}`}
          className={`
            flex h-10 flex-1 items-center justify-center rounded-xl
            text-sm font-medium transition-all duration-200 ease-in-out
            ${
              current === "questions"
                ? "pointer-events-none bg-black text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-black"
            }
          `}
        >
          Questions
        </Link>

        <Link
          href={`/orals/${category}/topics`}
          className={`
            flex h-10 flex-1 items-center justify-center rounded-xl
            text-sm font-medium transition-all duration-200 ease-in-out
            ${
              current === "topics"
                ? "pointer-events-none bg-black text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-black"
            }
          `}
        >
          Topics
        </Link>

      </div>
    </div>
  );
}