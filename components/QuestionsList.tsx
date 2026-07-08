"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";

import QuestionCard from "./QuestionCard";

interface Question {
  id: string;
  question: string;
  answer: string;
  mmd: string;
  surveyor: string;
  topic: string;
  order: number;
  isActive: boolean;
}

interface Props {
  category: string;
  questions: Question[];
}

export default function QuestionsList({
  category,
  questions,
}: Props) {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedMmd, setSelectedMmd] = useState("All");
  const [selectedSurveyor, setSelectedSurveyor] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState("All");

  const mmds = useMemo(
    () => [...new Set(questions.map((q) => q.mmd).filter(Boolean))],
    [questions]
  );

  const surveyors = useMemo(
    () => [...new Set(questions.map((q) => q.surveyor).filter(Boolean))],
    [questions]
  );

  const topics = useMemo(
    () => [...new Set(questions.map((q) => q.topic).filter(Boolean))],
    [questions]
  );

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (!q.isActive) return false;

      if (
        selectedMmd !== "All" &&
        q.mmd !== selectedMmd
      )
        return false;

      if (
        selectedSurveyor !== "All" &&
        q.surveyor !== selectedSurveyor
      )
        return false;

      if (
        selectedTopic !== "All" &&
        q.topic !== selectedTopic
      )
        return false;

      if (
        search.trim() &&
        !(
          q.question
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          q.answer
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          q.topic
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          q.mmd
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          q.surveyor
            .toLowerCase()
            .includes(search.toLowerCase())
        )
      ) {
        return false;
      }

      return true;
    });
  }, [
    questions,
    search,
    selectedMmd,
    selectedSurveyor,
    selectedTopic,
  ]);

  const currentQuestion = filteredQuestions[currentIndex];

  useEffect(() => {
    setCurrentIndex(0);
  }, [
    search,
    selectedMmd,
    selectedSurveyor,
    selectedTopic,
  ]);
  return (
    <>
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

      {/* FILTERS */}
      {showFilters && (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="grid gap-4 md:grid-cols-3">

            <select
              value={selectedMmd}
              onChange={(e) => setSelectedMmd(e.target.value)}
              className="rounded-xl border border-gray-300 p-3"
            >
              <option value="All">All MMDs</option>

              {mmds.map((mmd) => (
                <option key={mmd} value={mmd}>
                  {mmd}
                </option>
              ))}
            </select>

            <select
              value={selectedSurveyor}
              onChange={(e) => setSelectedSurveyor(e.target.value)}
              className="rounded-xl border border-gray-300 p-3"
            >
              <option value="All">All Surveyors</option>

              {surveyors.map((surveyor) => (
                <option key={surveyor} value={surveyor}>
                  {surveyor}
                </option>
              ))}
            </select>

            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="rounded-xl border border-gray-300 p-3"
            >
              <option value="All">All Topics</option>

              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>

          </div>
        </div>
      )}

      {/* HEADING */}
      <div className="mt-8 mb-6 flex items-center justify-between gap-4">

        <h2 className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">
          Questions
        </h2>

        <div className="text-right text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
          <span className="text-gray-500">Current:</span>{" "}
          <span className="font-bold text-black">
            {filteredQuestions.length > 0
              ? `${currentIndex + 1} / ${filteredQuestions.length}`
              : "0 / 0"}
          </span>

          <span className="mx-2 text-gray-300">|</span>

        </div>

      </div>

      {/* QUESTIONS */}
      <div className="space-y-6">

        {currentQuestion && (
          <>
            <QuestionCard
              questionId={currentQuestion.id}
              category={category}
              question={currentQuestion.question}
              answer={currentQuestion.answer}
              mmd={currentQuestion.mmd}
              surveyor={currentQuestion.surveyor}
              topic={currentQuestion.topic}
            />

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between">

              <button
                onClick={() =>
                  setCurrentIndex((prev) => prev - 1)
                }
                disabled={currentIndex === 0}
                className={`rounded-xl px-5 py-3 font-semibold transition-all duration-200 ${currentIndex === 0
                  ? "border border-gray-300 bg-white text-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
                  }`}
              >
                ◀ Previous
              </button>

              <button
                onClick={() =>
                  setCurrentIndex((prev) => prev + 1)
                }
                disabled={currentIndex === filteredQuestions.length - 1}
                className={`rounded-xl px-5 py-3 font-semibold transition-all duration-200 ${currentIndex === filteredQuestions.length - 1
                    ? "border border-gray-300 bg-white text-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                  }`}
              >
                Next ▶
              </button>

            </div>
          </>
        )}

        {filteredQuestions.length === 0 && (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-gray-500">
              No questions found.
            </p>
          </div>
        )}

      </div>
    </>
  );
}