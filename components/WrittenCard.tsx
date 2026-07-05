"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { WrittenQuestion } from "@/services/written.service";

interface Props {
  question: WrittenQuestion;
}

export default function WrittenCard({ question }: Props) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm">
          {question.class}
        </span>

        <span className="rounded-full bg-green-100 px-3 py-1 text-sm">
          {question.month}
        </span>

        <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm">
          {question.year}
        </span>

        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
          {question.topic}
        </span>
      </div>

      <h2 className="text-xl font-semibold">
        {question.question}
      </h2>

      <button
        onClick={() => setShowAnswer(!showAnswer)}
        className="mt-6 flex items-center gap-2 font-medium text-blue-600"
      >
        {showAnswer ? (
          <>
            <ChevronUp size={18} />
            Hide Answer
          </>
        ) : (
          <>
            <ChevronDown size={18} />
            Show Answer
          </>
        )}
      </button>

      {showAnswer && (
        <div className="mt-4 rounded-2xl bg-gray-50 p-5">
          <p className="whitespace-pre-wrap text-gray-700">
            {question.answer}
          </p>
        </div>
      )}
    </div>
  );
}