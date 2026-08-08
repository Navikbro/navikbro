"use client";

import { useEffect, useRef, useState } from "react";

import QuestionsList from "@/components/questions/QuestionsList";

import { useOralMmdPreference } from "@/hooks/useOralMmdPreference";

import type {
  OralBatchQuestion,
  OralFilters,
} from "@/services/orals/oralBatch.service";

interface Props {
  category: string;

  initialQuestions: OralBatchQuestion[];

  filters: OralFilters;

  mmdData: Record<
    string,
    {
      questionCount: number;
      batchCount: number;
      topics: string[];
      surveyors: string[];
    }
  >;

  totalQuestions: number;
  onInitialLoadComplete: () => void;
}

export default function QuestionsContainer({
  category,
  initialQuestions,
  filters,
  mmdData,
  totalQuestions,
  onInitialLoadComplete,
}: Props) {
  const {
    mmd,
    loading,
    setMmd,
  } = useOralMmdPreference();

  const [questions, setQuestions] =
    useState<OralBatchQuestion[]>(initialQuestions);

  const [questionsLoading, setQuestionsLoading] =
    useState(false);

  const hasInitializedMmd =
    useRef(false);

  async function loadMmdQuestions(
    selectedMmd: string
  ) {
    try {
      const res = await fetch(
        "/api/orals/questions",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            category,
            mmd: selectedMmd,
          }),

          cache: "no-store",
        }
      );

      if (!res.ok) {
        throw new Error(
          "Failed to load questions"
        );
      }

      const data =
        await res.json();

      setQuestions(
        data.questions ?? []
      );
    } catch (error) {
      console.error(
        "Failed loading MMD questions:",
        error
      );

      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
      onInitialLoadComplete();
    }
  }

  /*
   * Load the user's remembered MMD
   * when the page opens.
   */
  useEffect(() => {
    if (loading) return;

    if (!mmd) {
      setQuestions([]);
      onInitialLoadComplete();
      return;
    }

    if (hasInitializedMmd.current) {
      return;
    }

    hasInitializedMmd.current = true;

    /*
     * If the server already supplied questions
     * for this exact MMD, use them.
     *
     * Otherwise fetch the remembered MMD.
     */
    if (
      initialQuestions.length > 0 &&
      initialQuestions.some(
        (question) =>
          question.mmd === mmd
      )
    ) {
      setQuestions(
        initialQuestions
      );

      onInitialLoadComplete();

      return;
    }

    setQuestionsLoading(true);

    loadMmdQuestions(mmd);
  }, [
    loading,
    mmd,
    category,
    initialQuestions,
  ]);

  /*
   * IMPORTANT:
   * All hooks are above this return.
   * This prevents the React hook-order error.
   */
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 8 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-gray-100"
            />
          )
        )}
      </div>
    );
  }

  if (!mmd) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-gray-500">
          No MMD selected.
        </p>
      </div>
    );
  }

  return (
    <QuestionsList
      category={category}
      questions={questions}
      filters={filters}
      mmdData={mmdData}
      selectedMmd={mmd}
      setSelectedMmd={async (
        selectedMmd
      ) => {
        /*
         * Show skeleton immediately.
         */
        setQuestionsLoading(true);

        /*
         * Clear old questions immediately
         * so the previous MMD does not remain
         * visible while fetching.
         */
        setQuestions([]);

        /*
         * Save the user's MMD preference.
         */
        await setMmd(
          selectedMmd
        );

        /*
         * Fetch/cache the newly selected MMD.
         */
        await loadMmdQuestions(
          selectedMmd
        );
      }}
      totalQuestions={totalQuestions}
      questionsLoading={
        questionsLoading
      }
    />
  );
}