"use client";

import { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

interface CategoryCardProps {
  href: string;
  title: string;
  subtitle?: string;
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
  subtitle,
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
      className="group w-full rounded-3xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-black hover:shadow-md active:scale-[0.98]"
    >
      {/* Badge */}
      {badge && (
        <div className="mb-5 inline-flex rounded-md bg-black px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
          {badge}
        </div>
      )}

      {/* Folder */}
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
        <Icon
          size={30}
          strokeWidth={1.8}
          className="text-gray-700 transition-transform duration-200 group-hover:scale-110"
        />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900">
        {title}
      </h3>

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-1 text-sm text-gray-500">
          {subtitle}
        </p>
      )}

      {/* Stats */}
      <div className="mt-6 space-y-1">
        <p className="text-sm font-medium text-gray-800">
          {questions.toLocaleString()} Questions
        </p>

        <p className="text-sm font-medium text-gray-800">
          {topics.toLocaleString()} Topics
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-400">
          Updated •{" "}
          {updatedAt
            ? updatedAt.toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })
            : "-"}
        </p>
      </div>
    </button>
  );
}