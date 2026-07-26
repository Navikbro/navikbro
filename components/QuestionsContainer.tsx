"use client";

import { useEffect, useRef, useState } from "react";
import QuestionsList from "./QuestionsList";

import {
  OralFilters,
} from "@/services/firestore";

import {
  OralBatchQuestion,
} from "@/services/oralBatch.service";


interface Props {
  category: string;
  initialQuestions: OralBatchQuestion[];
  filters: OralFilters;
  initialHasMore: boolean;
  initialNextBatch: number | null;
}

export default function QuestionsContainer({
  category,
  initialQuestions,
  filters,
  initialHasMore,
  initialNextBatch,
}: Props) {


  const [questions, setQuestions] =
    useState<OralBatchQuestion[]>(initialQuestions);

  const [nextBatch, setNextBatch] =
    useState<number | null>(initialNextBatch);

  const [hasMore, setHasMore] =
    useState(initialHasMore);

  const [loading, setLoading] =
    useState(false);



  console.log("QuestionsContainer render", {
    questions: questions.length,
    nextBatch,
    hasMore,
    loading,
  });

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadingRef = useRef(false);

  async function loadMore() {
    if (!nextBatch || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    const batchToLoad = nextBatch;

    try {

      console.log("Loading batch", nextBatch);

      const response = await fetch(
        `/api/orals/batch?category=${category}&batch=${batchToLoad}`
      );

      if (!response.ok) {
        throw new Error("Failed to load batch");
      }

      const result = await response.json();

      console.log("Result:", result);

      setQuestions(prev => [
        ...prev,
        ...result.questions,
      ]);

      setHasMore(result.hasMore);
      setNextBatch(result.nextBatch);

    } catch (e) {
      console.error("Load More Error:", e);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }

  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          loadMore();
        }
      },
      {
        rootMargin: "300px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();

  }, [hasMore]);

  return (
    <>
      <QuestionsList
        category={category}
        questions={questions}
        filters={filters}
      />

      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex justify-center py-8"
        >
          <p className="text-sm text-gray-400">
            Loading more...
          </p>
        </div>
      )}

      {!hasMore && questions.length > 0 && (
        <div className="py-10 text-center">
          <div className="mx-auto mb-4 h-px w-24 bg-gray-300" />
          <p className="text-sm text-gray-500">
            You've reached the end.
          </p>
        </div>
      )}
    </>
  );
}