"use client";

import { useEffect, useRef, useState } from "react";
import QuestionsList from "./QuestionsList";

import {
  getQuestionsPaginated,
  Question,
  OralFilters,
} from "@/services/firestore";

import type {
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";

interface Props {
  category: string;
  initialQuestions: Question[];
  initialLastDoc: QueryDocumentSnapshot<DocumentData> | null;
  initialHasMore: boolean;
  filters: OralFilters;
}

export default function QuestionsContainer({
  category,
  initialQuestions,
  initialLastDoc,
  initialHasMore,
  filters,
}: Props) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [loading, setLoading] = useState(false);

  const [lastDoc, setLastDoc] = useState(initialLastDoc);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const hasMoreRef = useRef(initialHasMore);
  const loadingRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const lastDocRef = useRef(initialLastDoc);

  useEffect(() => {
    setQuestions(initialQuestions);
    setLastDoc(initialLastDoc);
    setHasMore(initialHasMore);

    lastDocRef.current = initialLastDoc;
    hasMoreRef.current = initialHasMore;
  }, [
    category,
    initialQuestions,
    initialLastDoc,
    initialHasMore,
  ]);

  async function loadMore() {
    if (
      !hasMoreRef.current ||
      loadingRef.current ||
      loadingMoreRef.current
    ) {
      return;
    }

    try {
      setLoadingMore(true);
      loadingMoreRef.current = true;

      const result = await getQuestionsPaginated(
        category,
        lastDocRef.current
      );

      setQuestions((prev) => {
        const ids = new Set(prev.map((q) => q.id));

        return [
          ...prev,
          ...result.questions.filter((q) => !ids.has(q.id)),
        ];
      });

      setLastDoc(result.lastDoc);
      lastDocRef.current = result.lastDoc;

      setHasMore(result.hasMore);
      hasMoreRef.current = result.hasMore;
    } catch (err) {
      console.error(err);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);

  useEffect(() => {
    lastDocRef.current = lastDoc;
  }, [lastDoc]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasMoreRef.current &&
          !loadingRef.current &&
          !loadingMoreRef.current
        ) {
          loadMore();
        }
      },
      {
        rootMargin: "300px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-gray-200"
          />
        ))}
      </div>
    );
  }

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
          {loadingMore && (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
          )}
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