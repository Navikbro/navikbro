"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  OralBatchQuestion,
  OralFilters,
} from "@/services/orals/oralBatch.service";

import { useVirtualizer } from "@tanstack/react-virtual";

import {
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";

import QuestionRow from "@/components/questions/QuestionRow";
import QuestionViewer from "@/components/questions/QuestionViewer";


interface Props {
  category: string;
  questions: OralBatchQuestion[];
  filters?: OralFilters;

  mmdData: Record<
    string,
    {
      questionCount: number;
      batchCount: number;
      topics: string[];
      surveyors: string[];
    }
  >;

  selectedMmd: string;

  setSelectedMmd: (
    value: string
  ) => void;

  totalQuestions: number;
  questionsLoading: boolean;
}

export default function QuestionsList({
  category,
  questions,
  filters,
  mmdData,
  selectedMmd,
  setSelectedMmd,
  totalQuestions,
  questionsLoading,
}: Props) {

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [bookmarks, setBookmarks] =
    useState<string[]>([]);

  const bookmarkSet = useMemo(
    () => new Set(bookmarks),
    [bookmarks]
  );

  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  const activeMmd = selectedMmd;

  const [selectedSurveyor, setSelectedSurveyor] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [selectedClass, setSelectedClass] = useState("All");

  useEffect(() => {

    setSelectedTopic("All");
    setSelectedSurveyor("All");
    setSelectedClass("All");

  }, [activeMmd]);

  const topics = useMemo(() => {

    if (mmdData[activeMmd]) {
      return mmdData[activeMmd].topics;
    }

    return filters?.topics ?? [];

  }, [
    activeMmd,
    mmdData,
    filters,
  ]);

  const surveyors = useMemo(() => {
    if (mmdData[activeMmd]) {
      return mmdData[activeMmd].surveyors;
    }

    return filters?.surveyors ?? [];

  }, [
    activeMmd,
    mmdData,
    filters,
  ]);

  const mmds = useMemo(
    () => filters?.mmds ?? [],
    [filters]
  );

  const classes = useMemo(
    () => filters?.classes ?? [],
    [filters]
  );

  const showMmd = selectedMmd !== "All";
  const showSurveyor = selectedSurveyor !== "All";
  const showTopic = selectedTopic !== "All";

  const normalizedSearch =
    search.trim().toLowerCase();

  const filteredQuestions = useMemo(() => {

    return questions.filter((q) => {
      if (q.isActive === false) return false;
      if (showBookmarksOnly && !bookmarkSet.has(q.id))
        return false;

      if (
        selectedMmd &&
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
        selectedClass !== "All" &&
        q.class !== selectedClass
      )
        return false;

      if (
        normalizedSearch &&
        !(
          q.question
            .toLowerCase()
            .includes(normalizedSearch) ||
          (q.answer ?? "").toLowerCase()
            .includes(normalizedSearch) ||
          q.topic
            .toLowerCase()
            .includes(normalizedSearch) ||
          q.mmd
            .toLowerCase()
            .includes(normalizedSearch) ||
          q.surveyor
            .toLowerCase()
            .includes(normalizedSearch)
        )
      ) {
        return false;
      }

      return true;
    });
  }, [
    questions,
    normalizedSearch,
    activeMmd,
    selectedSurveyor,
    selectedTopic,
    selectedClass,
    bookmarkSet,
    showBookmarksOnly,
  ]);

  const bookmarksCount = useMemo(() => {
    return filteredQuestions.filter((q) =>
      bookmarkSet.has(q.id)
    ).length;
  }, [filteredQuestions, bookmarkSet]);

  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  const viewerHistoryRef = useRef(false);

  useEffect(() => {
    if (questionsLoading) {
      setSelectedIndex(null);
    }
  }, [questionsLoading]);

  const parentRef =
    useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredQuestions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 148,
    overscan: 12,
    useFlushSync: false,
  });

  const clearFilters = () => {
    setSearch("");
    setSelectedSurveyor("All");
    setSelectedTopic("All");
    setSelectedClass("All");
    setShowBookmarksOnly(false);
  };

  useEffect(() => {
    const handlePopState = () => {
      if (viewerHistoryRef.current) {
        viewerHistoryRef.current = false;
        setSelectedIndex(null);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);


  useEffect(() => {
    const saved = localStorage.getItem("bookmarkedQuestions");

    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];

      localStorage.setItem(
        "bookmarkedQuestions",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  const selectedQuestion = useMemo(() => {
    if (selectedIndex === null) return null;

    return filteredQuestions[selectedIndex] ?? null;
  }, [selectedIndex, filteredQuestions]);

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

      {/* MMD SELECTOR */}
      <div className="mt-4">
        <select
          value={activeMmd}
          onChange={(e) => {
            setSelectedMmd(e.target.value);
          }}
          className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm shadow-sm outline-none transition focus:border-black"
        >
          {mmds.map((mmd) => (
            <option key={mmd} value={mmd}>
              {mmd}
            </option>
          ))}
        </select>
      </div>

      {/* FILTER BUTTON */}
      <div className="mt-4 grid grid-cols-2 gap-3">

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition hover:border-black"
        >
          <div className="flex items-center gap-3">
            <SlidersHorizontal size={18} />
            <span className="font-semibold">Filters</span>
          </div>

          {showFilters ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        <button
          onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
          className={`flex items-center justify-center rounded-2xl border px-5 py-4 shadow-sm transition ${showBookmarksOnly
            ? "border-black bg-black text-white"
            : "border-gray-200 bg-white hover:border-black"
            }`}
        >
          🔖 Bookmarks (
          {bookmarksCount}
          )
        </button>

      </div>

      {/* FILTERS */}
      {
        showFilters && (
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="grid gap-4 md:grid-cols-3">

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="rounded-xl border border-gray-300 p-3"
              >
                <option value="All">Class</option>

                {classes.map((questionClass) => (
                  <option key={questionClass} value={questionClass}>
                    {questionClass}
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

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setShowFilters(false)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                ✕ Close
              </button>

              <button
                onClick={clearFilters}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Clear Filters
              </button>
            </div>

          </div>
        )
      }




      {/* HEADING */}
      <div className="mt-8 mb-6 flex items-center justify-between gap-4">

        <h2 className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">
          Questions
        </h2>

        <div className="text-right text-xs sm:text-sm font-medium text-gray-700">
          {" "}
          <span className="font-bold text-black">
            {filteredQuestions.length}
          </span>{" "}
          /{" "}
          <span className="font-bold text-black">
            {totalQuestions}
          </span>{" "}

        </div>

      </div>

      {/* QUESTIONS */}
      <div
        ref={parentRef}
        className="overflow-y-auto"
        style={{
          height: "calc(100vh - 150px)",
        }}
      >

        {questionsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-white"
              />
            ))}
          </div>
        ) : filteredQuestions.length === 0 ? (

          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">

            <div className="text-5xl">🔍</div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No questions found
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Try changing your search, filters or bookmarks.
            </p>

            <button
              onClick={clearFilters}
              className="mt-6 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Clear Filters
            </button>

          </div>

        ) : (


          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const q = filteredQuestions[virtualRow.index];

              return (
                <div
                  key={q.id}
                  ref={rowVirtualizer.measureElement}
                  data-index={virtualRow.index}
                  className="w-full pb-5"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >

                  <QuestionRow
                    question={q.question}
                    examDate={q.examDate}
                    mmd={q.mmd}
                    surveyor={q.surveyor}
                    topic={q.topic}
                    showMmd={showMmd}
                    showSurveyor={showSurveyor}
                    showTopic={showTopic}
                    isBookmarked={bookmarkSet.has(q.id)}
                    onBookmark={() => toggleBookmark(q.id)}
                    onClick={() => {
                      setSelectedIndex(virtualRow.index);

                      window.history.pushState(
                        { questionViewer: true },
                        "",
                        window.location.href
                      );

                      viewerHistoryRef.current = true;
                    }}
                  />
                </div>
              );
            })}
          </div>

        )}

      </div>

      <QuestionViewer
        open={selectedQuestion !== null}
        questions={filteredQuestions}
        currentIndex={selectedIndex}
        bookmarked={
          selectedQuestion
            ? bookmarkSet.has(selectedQuestion.id)
            : false
        }
        onClose={() => {
          if (viewerHistoryRef.current) {
            viewerHistoryRef.current = false;
            window.history.back();
          } else {
            setSelectedIndex(null);
          }
        }}
        onBookmark={() => {
          if (!selectedQuestion) return;

          toggleBookmark(selectedQuestion.id);
        }}
        onPrevious={() => {
          setSelectedIndex((prev) => {
            if (prev === null || prev <= 0) return prev;
            return prev - 1;
          });
        }}
        onNext={() => {
          setSelectedIndex((prev) => {
            if (
              prev === null ||
              prev >= filteredQuestions.length - 1
            )
              return prev;

            return prev + 1;
          });
        }}
      />

    </>
  )
}  