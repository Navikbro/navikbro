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

  const sectionNavRef =
    useRef<HTMLDivElement | null>(null);

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

  const navigationDirection =
    useRef<"forward" | "backward">(
      "forward"
    );

  const previousSectionIndex =
    useRef<number>(0);


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

  const scrollNavToSection = (
    sectionId: string
  ) => {
    const nav = sectionNavRef.current;

    if (!nav) {
      return;
    }

    const isMobile =
      nav.clientWidth < 640;

    const button =
      nav.querySelector(
        `[data-section-id="${CSS.escape(sectionId)}"]`
      ) as HTMLElement | null;

    if (!button) {
      return;
    }

    const buttonIndex =
      Array.from(
        nav.querySelectorAll(
          "[data-section-id]"
        )
      ).indexOf(button);

    const buttons =
      Array.from(
        nav.querySelectorAll(
          "[data-section-id]"
        )
      ) as HTMLElement[];

    const nextButton =
      buttons[buttonIndex + 1] ?? null;

    const previousButton =
      buttons[buttonIndex - 1] ?? null;

    const navRect =
      nav.getBoundingClientRect();

    const buttonRect =
      button.getBoundingClientRect();

    if (
      isMobile &&
      navigationDirection.current === "forward" &&
      nextButton
    ) {
      const nextButtonRect =
        nextButton.getBoundingClientRect();

      const nextButtonVisible =
        nextButtonRect.right <= navRect.right;

      if (!nextButtonVisible) {
        nav.scrollTo({
          left:
            nextButton.offsetLeft -
            nav.clientWidth +
            nextButton.offsetWidth,
          behavior: "smooth",
        });

        return;
      }
    }

    if (
      isMobile &&
      previousButton &&
      navigationDirection.current ===
      "backward"
    ) {
      const previousButtonRect =
        previousButton.getBoundingClientRect();

      const previousButtonVisible =
        previousButtonRect.left >= navRect.left;

      if (!previousButtonVisible) {
        nav.scrollTo({
          left:
            previousButton.offsetLeft,
          behavior: "smooth",
        });

        return;
      }
    }

    if (!isMobile) {
      /*
       * Desktop:
       * Keep the existing behavior —
       * move the active heading to the left.
       */
      if (
        buttonRect.left >= navRect.left &&
        buttonRect.right <= navRect.right
      ) {
        return;
      }

      nav.scrollTo({
        left:
          button.offsetLeft -
          nav.offsetLeft,
        behavior: "smooth",
      });
    }
  };

  /* =======================================================
  SCROLL TO ANSWER SECTION
  ======================================================= */

  const scrollToSection = (
    sectionId: string
  ) => {
    const clickedIndex =
      sections.findIndex(
        (section) =>
          section.id === sectionId
      );

    const currentIndex =
      previousSectionIndex.current;

    if (
      clickedIndex !== -1 &&
      clickedIndex !== currentIndex
    ) {
      navigationDirection.current =
        clickedIndex > currentIndex
          ? "forward"
          : "backward";

      previousSectionIndex.current =
        clickedIndex;
    }

    scrollNavToSection(sectionId);

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

    const nav =
      sectionNavRef.current;

    const navHeight =
      nav?.getBoundingClientRect()
        .height ?? 0;

    const scrollPosition =
      container.scrollTop +
      (elementTop - containerTop) -
      navHeight -
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
      if (isProgrammaticScroll.current) {
        const target =
          programmaticTarget.current;

        if (target !== null) {
          const distance =
            Math.abs(
              container.scrollTop -
              target
            );

          if (distance <= 2) {
            isProgrammaticScroll.current =
              false;

            programmaticTarget.current =
              null;

            return;
          }

          return;
        }

        return;
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

      const currentSectionIndex =
        sections.findIndex(
          (section) =>
            section.id === currentSection
        );

      if (
        currentSectionIndex !==
        previousSectionIndex.current
      ) {
        navigationDirection.current =
          currentSectionIndex >
            previousSectionIndex.current
            ? "forward"
            : "backward";

        previousSectionIndex.current =
          currentSectionIndex;
      }

      setActiveSection(
        currentSection
      );

      scrollNavToSection(
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
    text-[10.4px]
    leading-[16px]
    sm:text-[14.4px]
    sm:leading-[25.6px]
    md:text-[16px]
    md:leading-[25.6px]
    font-medium
    text-gray-900
  "
        >
          {question.question}
        </h2>

        {/* =================================================
            ANSWER
        ================================================= */}

        {showAnswer && (
          <div className="mt-3 sm:mt-5">

            {/* SECTION NAVIGATION */}

            {sections.length > 0 && (
              <div
                className="
    sticky
    top-0
    z-10
    mb-3
    rounded-xl
    border
    border-gray-200
    bg-white/95
    p-1.5
    shadow-sm
    backdrop-blur
  "
              >

                <div
                  ref={sectionNavRef}
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
                          data-section-id={section.id}
                          onClick={() =>
                            scrollToSection(
                              section.id
                            )
                          }
                          className={`
  flex
  shrink-0
  items-center
  gap-1
  rounded-lg
  px-2.5
  py-1.5
  text-[10px]
  font-semibold
  transition
  sm:gap-1.5
  sm:rounded-xl
  sm:px-3
  sm:py-2
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
    flex
    flex-col
    items-start
    space-y-2
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
                      key={section.id}
                      id={section.id}
                      className="scroll-mt-3 w-full flex-none self-start"
                    >
                      <div
                        className="
    mb-3
    rounded-xl
    bg-black
    px-4
    py-3
    text-left
    transition
    hover:bg-gray-800
    sm:px-5
  "
                      >
                        <h3
                          className="
      flex
      min-w-0
      items-center
      gap-2
      text-sm
      font-semibold
      leading-5
      text-white
      sm:text-base
      sm:leading-6
    "
                        >
                          <span className="shrink-0">
                            {section.icon}
                          </span>

                          <span className="min-w-0">
                            {section.title}
                          </span>
                        </h3>
                      </div>

                      <div
                        className={`
    w-full
    flex-none
    self-start
    h-auto
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
                        <div className="w-full">
                          <MarkdownRenderer
                            content={section.content}
                          />
                        </div>
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

                  <div className="w-full">
                    <MarkdownRenderer
                      content={question.answer}
                    />
                  </div>

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

    </div >
  );
}