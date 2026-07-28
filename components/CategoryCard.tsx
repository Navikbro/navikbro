"use client";

import { useState } from "react";
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

  updatedAt?: Date | string | null;
  onRequireLogin: () => void;
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

  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);

    if (user) {
      router.push(href);
    } else {
      onRequireLogin();
      setClicked(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        group
        flex
        aspect-square
        w-full
        flex-col
        rounded-3xl
        border
        p-4
        text-left
        shadow-sm
        transition-all
        duration-200
        active:scale-[0.98]
        ${clicked
          ? "bg-slate-100 border-slate-300"
          : "bg-white border-gray-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
        }
      `}
    >
      {/* Badge */}
      {badge && (
        <div className="inline-flex w-fit rounded-md bg-black px-2.5 py-1 text-[9px] font-semibold tracking-wide text-white md:text-[10px]">
          {badge}
        </div>
      )}

      {/* Icon */}
      <div
        className={`
          mt-4
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          transition-colors
          md:h-12
          md:w-12
          ${clicked
            ? "bg-gray-200"
            : "bg-gray-100 group-hover:bg-gray-200"
          }
        `}
      >
        <Icon
          size={26}
          strokeWidth={1.8}
          className={`
            transition-transform
            duration-300
            md:h-7
            md:w-7
            ${clicked
              ? "text-gray-800"
              : "text-gray-700 group-hover:scale-110"
            }
          `}
        />
      </div>

      {/* Title */}
      <h3
        className={`
          mt-4
          text-[15px]
          font-bold
          leading-tight
          md:text-[17px]
          lg:text-[18px]
          ${clicked
            ? "text-gray-800"
            : "text-gray-900"
          }
        `}
      >
        {title}
      </h3>

      {/* Stats */}
      <div className="mt-2 space-y-1">
        <p className="text-[11px] font-medium text-gray-600 md:text-xs">
          {questions.toLocaleString()} Questions
        </p>

        <p className="text-[11px] font-medium text-gray-600 md:text-xs">
          {topics.toLocaleString()} Topics
        </p>
      </div>

      {/* Push Footer Down */}
      <div className="flex-1" />

      {/* Footer */}
      <div
        className={`pt-3 ${clicked
            ? "border-t border-gray-200"
            : "border-t border-gray-100"
          }`}
      >
        <p className="text-[10px] text-gray-400 md:text-[11px]">
          Updated •{" "}
          {updatedAt
            ? new Date(updatedAt).toLocaleDateString("en-IN", {
              month: "short",
              year: "numeric",
            })
            : "-"}
        </p>
      </div>
    </button>
  );
}