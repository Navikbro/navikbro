"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Bookmark,
} from "lucide-react";

import { WrittenQuestion } from "@/services/writtens/written.service";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";

interface Props {
  question: WrittenQuestion;

  isBookmarked: boolean;

  onBookmark: () => void;

  onPrevious: () => void;
  onNext: () => void;

  canGoPrevious: boolean;
  canGoNext: boolean;
}

/* =========================================================
ANSWER SECTION TYPE
========================================================= */

interface AnswerSection {
  id: string;
  title: string;
  shortTitle: string;
  icon: string;
  content: string;
}

/* =========================================================
CREATE SECTION ID
========================================================= */

function createSectionId(
  title: string,
  index: number
) {
  const slug = title
    .toLowerCase()
    .replace(/^\d+[\s.)-]*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `answer-section-${slug || index}`;
}

/* =========================================================
PARSE BACKEND ANSWER
========================================================= */

function parseAnswer(
  answer: string
): AnswerSection[] {
  if (!answer?.trim()) {
    return [];
  }

  const lines = answer.split(/\r?\n/);

  const sections: {
    title: string;
    content: string[];
  }[] = [];

  let currentSection:
    | {
      title: string;
      content: string[];
    }
    | null = null;

  for (const line of lines) {
    /*
     * Backend format:
     *
     * # 1. Complete Overview
     * # 2. Exam Points
     * # 3. One-Minute Revision
     * # 4. Reference Material
     */

    const match = line.match(
      /^#\s+(.+?)\s*$/
    );

    if (match) {
      if (currentSection) {
        sections.push(currentSection);
      }

      currentSection = {
        title: match[1].trim(),
        content: [],
      };

      continue;
    }

    if (currentSection) {
      currentSection.content.push(line);
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections.map(
    (section, index) => {
      const title = section.title;

      const cleanTitle = title
        .replace(/^\d+[\s.)-]*/, "")
        .trim();

      const lowerTitle =
        cleanTitle.toLowerCase();

      let icon = "📄";

      if (
        lowerTitle.includes("overview") ||
        lowerTitle.includes("complete")
      ) {
        icon = "⚡";
      } else if (
        lowerTitle.includes("exam") ||
        lowerTitle.includes("marks")
      ) {
        icon = "🎯";
      } else if (
        lowerTitle.includes("revision") ||
        lowerTitle.includes("one-minute") ||
        lowerTitle.includes("one minute")
      ) {
        icon = "🧠";
      } else if (
        lowerTitle.includes("reference") ||
        lowerTitle.includes("material")
      ) {
        icon = "📚";
      }

      return {
        id: createSectionId(
          title,
          index
        ),
        title,
        shortTitle: cleanTitle,
        icon,
        content:
          section.content
            .join("\n")
            .trim(),
      };
    }
  );
}

/* =========================================================
COMPONENT
========================================================= */

export default function WrittenCard({
  question,
  isBookmarked,
  onBookmark,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: Props) {
  const [
    showAnswer,
    setShowAnswer,
  ] = useState(false);

  const [
    activeSection,
    setActiveSection,
  ] = useState<string | null>(
    null
  );

  const answerScrollRef =
    useRef<HTMLDivElement | null>(
      null
    );

  /*
   * Used to prevent the normal scroll detector
   * from overriding the section selected by a click.
   */
  const isProgrammaticScroll =
    useRef(false);

  /*
   * Stores the scroll position that the
   * clicked section is moving toward.
   */
  const programmaticTarget =
    useRef<number | null>(null);

  /* =======================================================
  PARSE ANSWER
  ======================================================= */

  const sections = useMemo(
    () =>
      parseAnswer(
        question.answer
      ),
    [question.answer]
  );

  /* =======================================================
  RESET WHEN QUESTION CHANGES
  ======================================================= */

  useEffect(() => {
    setShowAnswer(false);
    setActiveSection(null);

    isProgrammaticScroll.current =
      false;

    programmaticTarget.current =
      null;

    if (
      answerScrollRef.current
    ) {
      answerScrollRef.current.scrollTop = 0;
    }
  }, [question.id]);

  /* =======================================================
  SCROLL TO ANSWER SECTION
  ======================================================= */

  const scrollToSection = (
    sectionId: string
  ) => {
    const container =
      answerScrollRef.current;

    if (!container) {
      return;
    }

    const element =
      container.querySelector(
        `#${CSS.escape(sectionId)}`
      ) as HTMLElement | null;

    if (!element) {
      return;
    }

    /*
     * IMPORTANT:
     * Change the active tab immediately.
     */
    setActiveSection(sectionId);

    const containerTop =
      container.getBoundingClientRect()
        .top;

    const elementTop =
      element.getBoundingClientRect()
        .top;

    const scrollPosition =
      container.scrollTop +
      (elementTop - containerTop) -
      12;

    /*
     * If we're already at the target,
     * there is no smooth scroll to wait for.
     */
    if (
      Math.abs(
        container.scrollTop -
        scrollPosition
      ) <= 2
    ) {
      isProgrammaticScroll.current =
        false;

      programmaticTarget.current =
        null;

      return;
    }

    /*
     * Lock normal active-section detection
     * while smooth scrolling is happening.
     */
    isProgrammaticScroll.current =
      true;

    programmaticTarget.current =
      scrollPosition;

    container.scrollTo({
      top: scrollPosition,
      behavior: "smooth",
    });
  };

  /* =======================================================
  SHOW ANSWER
  ======================================================= */

  const handleShowAnswer = () => {
    const nextState =
      !showAnswer;

    setShowAnswer(
      nextState
    );

    if (!nextState) {
      setActiveSection(null);

      isProgrammaticScroll.current =
        false;

      programmaticTarget.current =
        null;

      return;
    }

    if (sections.length > 0) {
      setTimeout(() => {
        scrollToSection(
          sections[0].id
        );
      }, 50);
    }
  };

  /* =======================================================
  DETECT ACTIVE SECTION
  ======================================================= */

  useEffect(() => {
    if (!showAnswer) {
      return;
    }

    const container =
      answerScrollRef.current;

    if (
      !container ||
      sections.length === 0
    ) {
      return;
    }

    const handleScroll = () => {
      /*
       * If the user clicked a tab and smooth
       * scrolling is still happening, do NOT
       * change the active tab.
       */
      if (
        isProgrammaticScroll.current
      ) {
        const target =
          programmaticTarget.current;

        if (target !== null) {
          const distance =
            Math.abs(
              container.scrollTop -
              target
            );

          /*
           * Smooth scroll reached the target.
           * Normal scroll detection can resume.
           */
          if (distance <= 2) {
            isProgrammaticScroll.current =
              false;

            programmaticTarget.current =
              null;
          } else {
            /*
             * Keep the clicked tab active.
             */
            return;
          }
        } else {
          return;
        }
      }

      const containerTop =
        container.getBoundingClientRect()
          .top;

      let currentSection =
        sections[0].id;

      for (const section of sections) {
        const element =
          container.querySelector(
            `#${CSS.escape(section.id)}`
          ) as HTMLElement | null;

        if (!element) {
          continue;
        }

        const elementTop =
          element.getBoundingClientRect()
            .top -
          containerTop;

        if (elementTop <= 90) {
          currentSection =
            section.id;
        }
      }

      setActiveSection(
        currentSection
      );
    };

    container.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    /*
     * Detect the initial position.
     */
    handleScroll();

    return () => {
      container.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [
    showAnswer,
    sections,
  ]);

  /* =======================================================
  RENDER
  ======================================================= */

  return (
    <div
      className="
        relative
        flex
        h-[650px]
        flex-col
        overflow-hidden
        rounded-3xl
        border
        border-gray-200
        bg-white
        p-4
        shadow-sm
        transition
        hover:shadow-lg
        sm:h-[680px]
        sm:p-5
        md:h-[700px]
        md:p-6
      "
    >

      {/* =================================================
          LEFT ARROW
          EXACT CENTER OF ENTIRE CARD
      ================================================= */}

      <button
        type="button"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        aria-label="Previous question"
        className="
          absolute
          left-0
          top-1/2
          z-30
          -translate-x-[35%]
          -translate-y-1/2
          rounded-full
          p-1
          text-gray-500
          transition-all
          duration-150
          hover:bg-gray-100
          hover:text-black
          active:scale-90
          disabled:pointer-events-none
          disabled:opacity-20

          sm:left-1
          sm:translate-x-0

          md:left-2
        "
      >
        <ChevronLeft
          size={20}
        />
      </button>

      {/* =================================================
          RIGHT ARROW
          EXACT CENTER OF ENTIRE CARD
      ================================================= */}

      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Next question"
        className="
          absolute
          right-0
          top-1/2
          z-30
          translate-x-[35%]
          -translate-y-1/2
          rounded-full
          p-1
          text-gray-500
          transition-all
          duration-150
          hover:bg-gray-100
          hover:text-black
          active:scale-90
          disabled:pointer-events-none
          disabled:opacity-20

          sm:right-1
          sm:translate-x-0

          md:right-2
        "
      >
        <ChevronRight
          size={20}
        />
      </button>

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          mb-5
          flex
          shrink-0
          items-start
          justify-between
          gap-4
          px-4
          sm:px-5
        "
      >

        <div
          className="
            flex
            min-w-0
            flex-wrap
            gap-2
          "
        >

          <span
            className="
              rounded-full
              bg-blue-100
              px-3
              py-1
              text-xs
              font-semibold
              text-blue-700
              sm:text-sm
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
              font-semibold
              text-green-700
              sm:text-sm
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
              font-semibold
              text-purple-700
              sm:text-sm
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
              font-semibold
              text-orange-700
              sm:text-sm
            "
          >
            {question.topic}
          </span>

        </div>

        {/* BOOKMARK */}

        <button
          type="button"
          onClick={onBookmark}
          aria-label={
            isBookmarked
              ? "Remove bookmark"
              : "Bookmark question"
          }
          className="
            shrink-0
            rounded-full
            p-2
            transition
            hover:bg-gray-100
          "
        >
          <Bookmark
            size={22}
            className={
              isBookmarked
                ? "fill-yellow-400 text-yellow-500"
                : "text-gray-700"
            }
          />
        </button>

      </div>

      {/* =================================================
          QUESTION + ANSWER SCROLL AREA
      ================================================= */}

      <div
        ref={answerScrollRef}
        className="
          min-h-0
          flex-1
          overflow-y-auto
          px-4
          pr-6
          sm:px-5
          md:px-6
        "
      >

        {/* QUESTION */}

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

        {/* =================================================
            ANSWER
        ================================================= */}

        {showAnswer && (
          <div className="mt-5">

            {/* SECTION NAVIGATION */}

            {sections.length > 0 && (
              <div
                className="
                  sticky
                  top-0
                  z-10
                  mb-4
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white/95
                  p-2
                  shadow-sm
                  backdrop-blur
                "
              >

                <div
                  className="
                    flex
                    gap-2
                    overflow-x-auto
                    scrollbar-thin
                  "
                >

                  {sections.map(
                    (section) => {

                      const isActive =
                        activeSection ===
                        section.id;

                      return (
                        <button
                          key={
                            section.id
                          }
                          type="button"
                          onClick={() =>
                            scrollToSection(
                              section.id
                            )
                          }
                          className={`
                            flex
                            shrink-0
                            items-center
                            gap-1.5
                            rounded-xl
                            px-3
                            py-2
                            text-[11px]
                            font-semibold
                            transition
                            sm:text-sm
                            ${isActive
                              ? "bg-black text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }
                          `}
                        >
                          <span>
                            {
                              section.icon
                            }
                          </span>

                          <span>
                            {
                              section.shortTitle
                            }
                          </span>
                        </button>
                      );
                    }
                  )}

                </div>

              </div>
            )}

            {/* ANSWER CONTENT */}

            <div
              className="
                space-y-6
                pb-4
              "
            >

              {sections.length > 0 ? (

                sections.map(
                  (
                    section,
                    index
                  ) => (

                    <section
                      key={
                        section.id
                      }
                      id={
                        section.id
                      }
                      className="scroll-mt-3"
                    >

                      <div
                        className="
                          mb-3
                          flex
                          items-center
                          gap-2
                        "
                      >

                        <div
                          className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-gray-100
                          "
                        >
                          {
                            section.icon
                          }
                        </div>

                        <h3
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
                          {
                            section.title
                          }
                        </h3>

                      </div>

                      <div
                        className={`
                          rounded-2xl
                          border
                          p-3.5
                          sm:p-5
                          ${index === 0
                            ? "border-green-200 bg-green-50"
                            : "border-gray-200 bg-gray-50"
                          }
                        `}
                      >

                        <MarkdownRenderer
                          content={
                            section.content
                          }
                        />

                      </div>

                    </section>

                  )
                )

              ) : (

                <div
                  className="
                    rounded-2xl
                    border
                    border-green-200
                    bg-green-50
                    p-4
                    sm:p-5
                  "
                >

                  <MarkdownRenderer
                    content={
                      question.answer
                    }
                  />

                </div>

              )}

            </div>

          </div>
        )}

      </div>

      {/* =================================================
          SHOW / HIDE ANSWER
      ================================================= */}

      <div
        className="
          mt-4
          flex
          shrink-0
          justify-center
          border-t
          border-gray-100
          pt-4
        "
      >

        <button
          type="button"
          onClick={
            handleShowAnswer
          }
          className="
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-black
            px-5
            py-2.5
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-gray-800
            sm:py-3
          "
        >

          {showAnswer ? (
            <>
              <ChevronUp
                size={18}
              />
              Hide Answer
            </>
          ) : (
            <>
              <ChevronDown
                size={18}
              />
              Show Answer
            </>
          )}

        </button>

      </div>

    </div>
  );
}