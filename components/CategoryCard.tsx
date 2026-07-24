"use client";

import { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

interface CategoryCardProps {
  href: string;
  title: string;
  icon: LucideIcon;
  badge?: string;
  updatedAt?: Date | string | null;

  onRequireLogin: () => void;
}

export default function CategoryCard({
  href,
  title,
  icon: Icon,
  badge,
  updatedAt = null,
  onRequireLogin,
}: CategoryCardProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handleClick = () => {
    if (user) {
      router.push(href);
    } else {
      onRequireLogin();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group flex aspect-square w-full flex-col rounded-3xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg active:scale-[0.98]"
    >
      {/* Badge */}
      {badge && (
        <div className="inline-flex w-fit rounded-md bg-black px-2.5 py-1 text-[9px] font-semibold tracking-wide text-white md:text-[10px]">
          {badge}
        </div>
      )}

      {/* Icon */}
      <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 transition-colors group-hover:bg-gray-200 md:h-12 md:w-12">
        <Icon
          size={26}
          strokeWidth={1.8}
          className="text-gray-700 transition-transform duration-300 group-hover:scale-110 md:h-7 md:w-7"
        />
      </div>

      {/* Title */}
      <h3 className="mt-4 text-[15px] font-bold leading-tight text-gray-900 md:text-[17px] lg:text-[18px]">
        {title}
      </h3>
      
      {/* Push Footer Down */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="border-t border-gray-100 pt-3">
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