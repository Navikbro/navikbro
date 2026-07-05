"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import WrittenCard from "@/components/WrittenCard";
import WrittenFilters from "@/components/WrittenFilters";

import {
  getWrittenQuestions,
  WrittenQuestion,
} from "@/services/written.service";

export default function WrittensPage() {
  const params = useParams();

  const category =
    typeof params.category === "string"
      ? params.category.toLowerCase()
      : "general";

  const [questions, setQuestions] = useState<WrittenQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

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
      } catch (error) {
        console.error(error);
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

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold capitalize">
            {category} Written Questions
          </h1>

          <p className="mt-2 text-gray-500">
            Practice company written interview questions.
          </p>
        </div>

        <WrittenFilters
          search={search}
          setSearch={setSearch}
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

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            Questions
          </h2>

          <div className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            {filteredQuestions.length} Questions
          </div>
        </div>

        {loading ? (
          <div className="mt-10 rounded-3xl bg-white p-12 text-center shadow-sm">
            Loading Questions...
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="mt-10 rounded-3xl bg-white p-12 text-center shadow-sm">
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