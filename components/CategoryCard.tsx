"use client";

import { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

interface CategoryCardProps {
  href: string;
  title: string;
  icon: LucideIcon;
  badge?: string;

  questions?: number;
  topics?: number;
  updatedAt?: Date | null;

  onRequireLogin: (path: string) => void;
}

export default function CategoryCard({
  href,
  title,
  icon: Icon,
  badge,
  questions = 0,
  topics = 0,
  updatedAt = null,
  onRequireLogin,
}: CategoryCardProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handleClick = () => {
    if (user) {
      router.push(href);
    } else {
      onRequireLogin(href);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group aspect-square w-full rounded-3xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-black hover:shadow-lg active:scale-[0.98] flex flex-col"
    >
      {/* Badge */}
      {badge && (
        <div className="mb-3 inline-flex w-fit rounded-md bg-black px-2.5 py-1 text-[10px] font-semibold text-white">
          {badge}
        </div>
      )}

      {/* Folder */}
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
        <Icon
          size={28}
          strokeWidth={1.8}
          className="text-gray-700 transition-transform duration-200 group-hover:scale-110"
        />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold leading-tight text-gray-900">
        {title}
      </h3>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Stats */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-900">
          {questions.toLocaleString()} Questions
        </p>

        <p className="text-sm font-medium text-gray-900">
          {topics.toLocaleString()} Topics
        </p>
      </div>

      {/* Footer */}
      <div className="mt-3 border-t border-gray-100 pt-2">
        <p className="text-[11px] text-gray-400">
          Updated •{" "}
          {updatedAt
            ? updatedAt.toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })
            : "-"}
        </p>
      </div>
    </button>
  );
}