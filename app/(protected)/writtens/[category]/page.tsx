"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sailboat,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";

import WrittenCard from "@/components/WrittenCard";
import WrittenFilters from "@/components/WrittenFilters";
import { useAuth } from "@/app/context/AuthContext";

import {
  getWrittenQuestions,
  WrittenQuestion,
} from "@/services/written.service";

export default function WrittensPage() {
  const params = useParams();
  const { user } = useAuth();

  const name =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Sailor";

  const category =
    typeof params.category === "string"
      ? params.category.toLowerCase()
      : "general";

  const [questions, setQuestions] = useState<WrittenQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState("All");

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);

        const data = await getWrittenQuestions(category);

        setQuestions(data);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [category]);

  const years = useMemo(() => {
    return [...new Set(questions.map((q) => q.year))]
      .filter(Boolean)
      .sort((a, b) => b - a);
  }, [questions]);

  const topics = useMemo(() => {
    return [...new Set(questions.map((q) => q.topic))]
      .filter(Boolean)
      .sort();
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const classMatch =
        selectedClass === "All" ||
        question.class === selectedClass;

      const yearMatch =
        selectedYear === "All" ||
        String(question.year) === selectedYear;

      const monthMatch =
        selectedMonth === "All" ||
        question.month === selectedMonth;

      const topicMatch =
        selectedTopic === "All" ||
        question.topic === selectedTopic;

      const searchMatch =
        search.trim() === "" ||
        question.question
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        question.answer
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        question.topic
          .toLowerCase()
          .includes(search.toLowerCase());

      return (
        classMatch &&
        yearMatch &&
        monthMatch &&
        topicMatch &&
        searchMatch
      );
    });
  }, [
    questions,
    search,
    selectedClass,
    selectedYear,
    selectedMonth,
    selectedTopic,
  ]);

  const titles: Record<
    string,
    {
      badge: string;
      title: string;
    }
  > = {
    general: {
      badge: "MEKG",
      title: "GENERAL WRITTEN",
    },
    mep: {
      badge: "MEP",
      title: "MEP WRITTEN",
    },
    motor: {
      badge: "MEKM",
      title: "MOTOR WRITTEN",
    },
    met: {
      badge: "MET",
      title: "ELECTRICAL WRITTEN",
    },
    naval: {
      badge: "SHIP-CO",
      title: "NAVAL WRITTEN",
    },
    ssep: {
      badge: "SSEP",
      title: "SAFETY WRITTEN",
    },
  };
  const page = titles[category] ?? {
    badge: category.toUpperCase(),
    title: "Written Questions",
  };

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <div className="mx-auto max-w-7xl px-5 py-8">

        {/* HEADER CARD */}
        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <Link
              href="/"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 hover:bg-gray-50"
            >
              <ArrowLeft size={20} />
            </Link>

            <div className="flex h-12 w-12 items-center justify-center rotate-[-8deg]">
              <Sailboat
                size={30}
                strokeWidth={2}
              />
            </div>

          </div>

          <div className="mt-7">

            <h2 className="text-2xl font-bold">
              Hi, {name} 👋
            </h2>

            <p className="text-gray-500">
              Welcome Back
            </p>

            <div className="mt-6 border-l-4 border-black pl-4">
              <p className="text-sm italic text-gray-600">
                Every answer you write today
                increases your confidence tomorrow.
              </p>
            </div>

            <div className="mt-6 inline-flex rounded-lg bg-black px-3 py-1 text-xs font-semibold tracking-wide text-white">
              {page.badge}
            </div>

            <h1 className="mt-4 text-xl md:text-2xl font-bold tracking-tight">
              {page.title}
            </h1>

            <div className="mt-5 flex items-center gap-3 text-sm font-medium text-gray-600">
              <span>{questions.length} Questions</span>
              <span>•</span>
              <span>{topics.length} Topics</span>
            </div>

          </div>

        </div>

        {/* SEARCH */}

        <div className="mt-8">
          <input
            type="text"
            placeholder="🔍 Search Questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm shadow-sm outline-none transition focus:border-black"
          />
        </div>

        {/* FILTER BUTTON */}

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="mt-4 flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition hover:border-black"
        >
          <div className="flex items-center gap-3">
            <SlidersHorizontal size={18} />
            <span className="font-semibold">
              Filters
            </span>
          </div>

          {showFilters ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {/* FILTER PANEL */}

        {showFilters && (
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <WrittenFilters
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
              years={years}
              topics={topics}
            />
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">

          <h2 className="text-lg font-semibold">
            Questions
          </h2>

          <div className="rounded-full bg-gray px-3 py-2 text-sm font-semibold text-black">
            {filteredQuestions.length}
          </div>

        </div>

        {loading ? (
          <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm">
            Loading Questions...
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm">
            No Questions Found.
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {filteredQuestions.map((question) => (
              <WrittenCard
                key={question.id}
                question={question}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}