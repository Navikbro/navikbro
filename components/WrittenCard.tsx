"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { WrittenQuestion } from "@/services/written.service";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface Props {
  question: WrittenQuestion;
}

export default function WrittenCard({ question }: Props) {

  const [showAnswer, setShowAnswer] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(false);
    setShowAnswer(false);
  }, [question.id]);

  return (
    <div
      className="
    flex
    flex-col
    h-[550px]
    rounded-3xl
    border
    border-gray-200
    bg-white
    p-4
    sm:p-5
    md:p-6
    shadow-sm
    transition
    hover:shadow-lg
  "
    >

      {/* Header Tags */}

      <div
        className="
            flex
            flex-wrap
            gap-2
            mb-5
            "
      >

        <span
          className="
                rounded-full
                bg-blue-100
                px-3
                py-1
                text-xs
                sm:text-sm
                font-semibold
                text-blue-700
                "
        >
          {question.class}
        </span>


        <span
          className="
                rounded-full
                bg-green-100
                px-3
                py-1
                text-xs
                sm:text-sm
                font-semibold
                text-green-700
                "
        >
          {question.year}
        </span>


        <span
          className="
                rounded-full
                bg-purple-100
                px-3
                py-1
                text-xs
                sm:text-sm
                font-semibold
                text-purple-700
                "
        >
          {question.month}
        </span>

        <span
          className="
    max-w-full
    truncate
    rounded-full
    bg-orange-100
    px-3
    py-1
    text-xs
    sm:text-sm
    font-semibold
    text-orange-700
  "
        >
          {question.topic}
        </span>


      </div>
      {/* Scroll Area */}

      <div className="flex-1 overflow-y-auto pr-2 min-h-0">

        {/* Question */}

        <h2
          className="
      whitespace-pre-wrap
      break-words
      text-base
      sm:text-lg
      md:text-xl
      font-medium
      leading-7
      sm:leading-8
      text-gray-900
    "
        >
          {question.question}
        </h2>

        {showAnswer && (
          <div
            className="
      mt-5
      rounded-2xl
      border
      border-green-200
      bg-green-50
      p-4
      sm:p-5
    "
          >

            <h3
              className="
        mb-3
        text-sm
        sm:text-base
        font-bold
        text-green-700
      "
            >
              Official Answer
            </h3>

            <MarkdownRenderer
              content={question.answer}
            />


          </div>
        )}



        {/* Answer Button */}

        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="
    mt-6
    flex
    shrink-0
    w-full
    sm:w-auto
    sm:ml-auto
    items-center
    justify-center
    gap-2
    rounded-xl
    bg-black
    px-5
    py-3
    text-sm
    sm:text-base
    font-semibold
    text-white
    transition
    hover:bg-gray-800
"
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

      </div>

    </div>
  );
}