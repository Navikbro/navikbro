"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { WrittenQuestion } from "@/services/written.service";

interface Props {
  question: WrittenQuestion;
}

function formatQuestion(text: string) {
  return text
    .replace(/(\b(?:19|20)\d{2}\b) (?=\S)/g, "$1\n\n")
    .replace(/\s*A\.\s*/g, "\n\nA. ")
    .replace(/\s*B\.\s*/g, "\n\nB. ")
    .replace(/\s*C\.\s*/g, "\n\nC. ")
    .replace(/\s*D\.\s*/g, "\n\nD. ")
    .replace(/\s*a\)\s*/gi, "\n\na) ")
    .replace(/\s*b\)\s*/gi, "\n\nb) ")
    .replace(/\s*c\)\s*/gi, "\n\nc) ")
    .replace(/\s*d\)\s*/gi, "\n\nd) ")
    .replace(/\(a\)/gi, "\n\n(a) ")
    .replace(/\(b\)/gi, "\n\n(b) ")
    .replace(/\(c\)/gi, "\n\n(c) ")
    .replace(/\(d\)/gi, "\n\n(d) ");
}

export default function WrittenCard({ question }: Props) {

  const [showAnswer, setShowAnswer] = useState(false);

  return (

    <div
      className="
rounded-2xl
border
border-gray-200
bg-white
p-4
sm:p-5
md:p-6
lg:p-7
shadow-sm
hover:shadow-md
transition
"
    >


      {/* Tags */}

      <div
        className="
  flex
  flex-wrap
  gap-2
  mb-5
  "
      >

        <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-700">
          {question.class}
        </span>

        <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs sm:text-sm font-medium text-green-700">
          {question.month}
        </span>

        <span className="rounded-full bg-yellow-100 px-3 py-1.5 text-xs sm:text-sm font-medium text-yellow-700">
          {question.year}
        </span>

        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700">
          {question.topic}
        </span>

      </div>



      {/* Question Box */}

      <div
        className="
border-l-4
border-blue-500
pl-3
sm:pl-4
md:pl-5
"
      >

        <h2
          className="
whitespace-pre-wrap
break-words
text-[15px]
sm:text-[17px]
md:text-[19px]
lg:text-[20px]
xl:text-[21px]
leading-7
sm:leading-8
md:leading-9
font-medium
italic
tracking-[0.01em]
text-gray-800
antialiased
"
        >

          {formatQuestion(question.question)}

        </h2>

      </div>



      {/* Button */}

      <button

        onClick={() => setShowAnswer(!showAnswer)}

        className="
mt-6
flex
items-center
gap-2
text-sm
sm:text-base
font-semibold
text-blue-600
"

      >

        {
          showAnswer
            ?
            <>
              <ChevronUp size={18} />
              Hide Answer
            </>
            :
            <>
              <ChevronDown size={18} />
              Show Answer
            </>
        }

      </button>



      {/* Answer */}

      {
        showAnswer &&

        <div
          className="
mt-5
rounded-xl
border
border-green-200
bg-green-50
p-4
sm:p-5
md:p-6
"
        >

          <h3
            className="
mb-3
font-semibold
text-green-700
text-base
sm:text-lg
"
          >
            Official Answer
          </h3>


          <p
            className="
whitespace-pre-wrap
break-words
text-[15px]
sm:text-[16px]
md:text-[17px]
lg:text-[18px]
leading-7
sm:leading-8
font-normal
italic
tracking-[0.01em]
text-gray-700
antialiased
"
          >
            {question.answer}
          </p>


        </div>

      }


    </div>

  )

}