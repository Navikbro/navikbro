"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { WrittenQuestion } from "@/services/written.service";

interface Props {
  question: WrittenQuestion;
}

function formatQuestion(text: string) {
  return text

    // Add a blank line after years like 2024, 2023, etc.
    .replace(/(\b(?:19|20)\d{2}\b) (?=\S)/g, "$1\n\n")

    // A. B. C. D.
    .replace(/\s*A\.\s*/g, "\n\nA. ")
    .replace(/\s*B\.\s*/g, "\n\nB. ")
    .replace(/\s*C\.\s*/g, "\n\nC. ")
    .replace(/\s*D\.\s*/g, "\n\nD. ")

    // a) b) c) d)
    .replace(/\s*a\)\s*/gi, "\n\na) ")
    .replace(/\s*b\)\s*/gi, "\n\nb) ")
    .replace(/\s*c\)\s*/gi, "\n\nc) ")
    .replace(/\s*d\)\s*/gi, "\n\nd) ")

    // (a) (b) (c) (d)
    .replace(/\(a\)/gi, "\n\n(a) ")
    .replace(/\(b\)/gi, "\n\n(b) ")
    .replace(/\(c\)/gi, "\n\n(c) ")
    .replace(/\(d\)/gi, "\n\n(d) ")

    // Roman numerals
    .replace(/\(i\)/gi, "\n    (i) ")
    .replace(/\(ii\)/gi, "\n    (ii) ")
    .replace(/\(iii\)/gi, "\n    (iii) ")
    .replace(/\(iv\)/gi, "\n    (iv) ")

}
export default function WrittenCard({ question }: Props) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition hover:shadow-md">

      {/* Tags */}
      <div className="mb-6 flex flex-wrap gap-3">
        <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
          {question.class}
        </span>

        <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
          {question.month}
        </span>

        <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700">
          {question.year}
        </span>

        <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
          {question.topic}
        </span>
      </div>

      {/* Question */}
      <div className="border-l-4 border-blue-500 pl-5">
        <h2 className="whitespace-pre-wrap text-[22px] font-semibold leading-9 text-gray-900">
          {formatQuestion(question.question)}
        </h2>
      </div>

      {/* Show Answer */}
      <button
        onClick={() => setShowAnswer(!showAnswer)}
        className="mt-8 flex items-center gap-2 text-base font-semibold text-blue-600 hover:text-blue-700"
      >
        {showAnswer ? (
          <>
            <ChevronUp size={20} />
            Hide Answer
          </>
        ) : (
          <>
            <ChevronDown size={20} />
            Show Answer
          </>
        )}
      </button>

      {/* Answer */}
      {showAnswer && (
        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-green-700">
            Official Answer
          </h3>

          <p className="whitespace-pre-wrap leading-8 text-gray-700">
            {question.answer}
          </p>
        </div>
      )}
    </div>
  );
}