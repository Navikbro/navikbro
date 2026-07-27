"use client";

import { useState } from "react";
import QuestionsList from "./QuestionsList";

import type {
  OralBatchQuestion,
  OralFilters,
} from "@/services/oralBatch.service";

interface Props {
  category: string;
  initialQuestions: OralBatchQuestion[];
  filters: OralFilters;
  totalQuestions: number;
}

export default function QuestionsContainer({
  category,
  initialQuestions,
  filters,
  totalQuestions,
}: Props) {
  const [questions] =
    useState<OralBatchQuestion[]>(initialQuestions);

  return (
    <QuestionsList
      category={category}
      questions={questions}
      filters={filters}
      totalQuestions={totalQuestions}
    />
  );
}