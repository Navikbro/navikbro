"use client";

import { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

interface CategoryCardProps {
  href: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  onRequireLogin: (path: string) => void;
}

export default function CategoryCard({
  href,
  title,
  subtitle,
  icon: Icon,
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
      <Icon
        size={34}
        strokeWidth={1.8}
        className="mb-5 transition-transform duration-200 group-hover:scale-110"
      />

      <h3 className="text-lg font-bold">
        {title}
      </h3>

      {subtitle && (
        <p className="mt-1 text-sm text-gray-500">
          {subtitle}
        </p>
      )}
    </button>
  );
}