"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    ChevronLeft,
    ChevronRight,
    Bookmark,
} from "lucide-react";

import MarkdownRenderer from "@/components/shared/MarkdownRenderer";

/* =========================================================
   CLIENT TOPIC TYPE
========================================================= */

export interface TopicCardTopic {
    id: string;
    name: string;
    overview: string;
}

/* =========================================================
   PROPS
========================================================= */

interface Props {
    topic: TopicCardTopic;

    isBookmarked?: boolean;

    onBookmark?: () => void;

    onPrevious: () => void;

    onNext: () => void;

    canGoPrevious: boolean;

    canGoNext: boolean;
}

/* =========================================================
   OVERVIEW SECTION TYPE
========================================================= */

interface OverviewSection {
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

    return `topic-section-${slug || index}`;
}

/* =========================================================
   PARSE TOPIC OVERVIEW
========================================================= */

function parseOverview(
    overview: string
): OverviewSection[] {
    if (!overview?.trim()) {
        return [];
    }

    const lines =
        overview.split(/\r?\n/);

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
         * Backend section format:
         *
         * # 1. Complete Overview
         * # 2. Exam Points
         * # 3. One-Minute Revision
         * # 4. Reference Material
         */

        const match =
            line.match(
                /^#\s+(.+?)\s*$/
            );

        if (match) {
            if (currentSection) {
                sections.push(
                    currentSection
                );
            }

            currentSection = {
                title:
                    match[1].trim(),
                content: [],
            };

            continue;
        }

        if (currentSection) {
            currentSection.content.push(
                line
            );
        }
    }

    if (currentSection) {
        sections.push(
            currentSection
        );
    }

    /*
     * If backend did not provide
     * section headings, treat the
     * entire overview as one section.
     */

    if (sections.length === 0) {
        return [
            {
                id: createSectionId(
                    "Complete Overview",
                    0
                ),

                title:
                    "Complete Overview",

                shortTitle:
                    "Overview",

                icon: "⚡",

                content:
                    overview.trim(),
            },
        ];
    }

    return sections.map(
        (
            section,
            index
        ) => {
            const title =
                section.title;

            const cleanTitle =
                title
                    .replace(
                        /^\d+[\s.)-]*/,
                        ""
                    )
                    .trim();

            const lowerTitle =
                cleanTitle.toLowerCase();

            let icon = "📄";

            if (
                lowerTitle.includes(
                    "overview"
                ) ||
                lowerTitle.includes(
                    "complete"
                )
            ) {
                icon = "⚡";
            } else if (
                lowerTitle.includes(
                    "exam"
                ) ||
                lowerTitle.includes(
                    "marks"
                ) ||
                lowerTitle.includes(
                    "important"
                )
            ) {
                icon = "🎯";
            } else if (
                lowerTitle.includes(
                    "revision"
                ) ||
                lowerTitle.includes(
                    "one-minute"
                ) ||
                lowerTitle.includes(
                    "one minute"
                )
            ) {
                icon = "🧠";
            } else if (
                lowerTitle.includes(
                    "reference"
                ) ||
                lowerTitle.includes(
                    "material"
                )
            ) {
                icon = "📚";
            }

            return {
                id: createSectionId(
                    title,
                    index
                ),

                title,

                shortTitle:
                    cleanTitle,

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

export default function TopicCard({
    topic,

    isBookmarked = false,

    onBookmark,

    onPrevious,

    onNext,

    canGoPrevious,

    canGoNext,
}: Props) {
    /* =====================================================
       STATE
    ===================================================== */

    const [
        activeSection,
        setActiveSection,
    ] = useState<string | null>(
        null
    );

    /* =====================================================
       REFS
    ===================================================== */

    const overviewScrollRef =
        useRef<HTMLDivElement | null>(
            null
        );

    const sectionNavRef =
        useRef<HTMLDivElement | null>(
            null
        );

    const isProgrammaticScroll =
        useRef(false);

    const programmaticTarget =
        useRef<number | null>(
            null
        );

    const navigationDirection =
        useRef<
            "forward" | "backward"
        >("forward");

    const previousSectionIndex =
        useRef<number>(0);

    /* =====================================================
       PARSE OVERVIEW
    ===================================================== */

    const sections = useMemo(
        () =>
            parseOverview(
                topic.overview
            ),
        [topic.overview]
    );

    /* =====================================================
       RESET WHEN TOPIC CHANGES
    ===================================================== */

    useEffect(() => {
        /*
         * Reset section state.
         */

        setActiveSection(
            sections[0]?.id ?? null
        );

        isProgrammaticScroll.current =
            false;

        programmaticTarget.current =
            null;

        navigationDirection.current =
            "forward";

        previousSectionIndex.current =
            0;

        /*
         * Reset the topic viewer
         * back to the top.
         */

        requestAnimationFrame(() => {
            const container =
                overviewScrollRef.current;

            if (container) {
                container.scrollTo({
                    top: 0,
                    behavior: "instant",
                });
            }

            const nav =
                sectionNavRef.current;

            if (nav) {
                nav.scrollTo({
                    left: 0,
                    behavior: "instant",
                });
            }
        });
    }, [
        topic.id,
        sections,
    ]);

    /* =====================================================
       SCROLL NAV TO SECTION
    ===================================================== */

    const scrollNavToSection = (
        sectionId: string
    ) => {
        const nav =
            sectionNavRef.current;

        if (!nav) {
            return;
        }

        const isMobile =
            nav.clientWidth < 640;

        const button =
            nav.querySelector(
                `[data-section-id="${CSS.escape(
                    sectionId
                )}"]`
            ) as HTMLElement | null;

        if (!button) {
            return;
        }

        const buttons =
            Array.from(
                nav.querySelectorAll(
                    "[data-section-id]"
                )
            ) as HTMLElement[];

        const buttonIndex =
            buttons.indexOf(
                button
            );

        const nextButton =
            buttons[
                buttonIndex + 1
            ] ?? null;

        const previousButton =
            buttons[
                buttonIndex - 1
            ] ?? null;

        const navRect =
            nav.getBoundingClientRect();

        const buttonRect =
            button.getBoundingClientRect();

        /* =================================================
           MOBILE FORWARD
        ================================================= */

        if (
            isMobile &&
            navigationDirection.current ===
                "forward" &&
            nextButton
        ) {
            const nextButtonRect =
                nextButton.getBoundingClientRect();

            const nextButtonVisible =
                nextButtonRect.right <=
                navRect.right;

            if (!nextButtonVisible) {
                nav.scrollTo({
                    left:
                        nextButton.offsetLeft -
                        nav.clientWidth +
                        nextButton.offsetWidth,

                    behavior:
                        "smooth",
                });

                return;
            }
        }

        /* =================================================
           MOBILE BACKWARD
        ================================================= */

        if (
            isMobile &&
            navigationDirection.current ===
                "backward" &&
            previousButton
        ) {
            const previousButtonRect =
                previousButton.getBoundingClientRect();

            const previousButtonVisible =
                previousButtonRect.left >=
                navRect.left;

            if (!previousButtonVisible) {
                nav.scrollTo({
                    left:
                        previousButton.offsetLeft,

                    behavior:
                        "smooth",
                });

                return;
            }
        }

        /* =================================================
           DESKTOP
        ================================================= */

        if (!isMobile) {
            const buttonVisible =
                buttonRect.left >=
                    navRect.left &&
                buttonRect.right <=
                    navRect.right;

            if (buttonVisible) {
                return;
            }

            nav.scrollTo({
                left:
                    button.offsetLeft -
                    nav.offsetLeft,

                behavior:
                    "smooth",
            });
        }
    };

    /* =====================================================
       SCROLL TO SECTION
    ===================================================== */

    const scrollToSection = (
        sectionId: string
    ) => {
        const clickedIndex =
            sections.findIndex(
                (section) =>
                    section.id ===
                    sectionId
            );

        const currentIndex =
            previousSectionIndex.current;

        if (
            clickedIndex !== -1 &&
            clickedIndex !==
                currentIndex
        ) {
            navigationDirection.current =
                clickedIndex >
                currentIndex
                    ? "forward"
                    : "backward";

            previousSectionIndex.current =
                clickedIndex;
        }

        /*
         * Immediately activate
         * clicked section.
         */

        setActiveSection(
            sectionId
        );

        /*
         * Also move the navigation
         * strip if necessary.
         */

        scrollNavToSection(
            sectionId
        );

        const container =
            overviewScrollRef.current;

        if (!container) {
            return;
        }

        const element =
            container.querySelector(
                `#${CSS.escape(
                    sectionId
                )}`
            ) as HTMLElement | null;

        if (!element) {
            return;
        }

        const nav =
            sectionNavRef.current;

        const navHeight =
            nav?.offsetHeight ?? 0;

        const scrollPosition =
            Math.max(
                0,
                element.offsetTop -
                    navHeight -
                    8
            );

        /*
         * Already at target.
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
         * Lock automatic section
         * detection while smooth
         * scrolling.
         */

        isProgrammaticScroll.current =
            true;

        programmaticTarget.current =
            scrollPosition;

        container.scrollTo({
            top:
                scrollPosition,

            behavior:
                "smooth",
        });
    };

    /* =====================================================
       DETECT ACTIVE SECTION
    ===================================================== */

    useEffect(() => {
        const container =
            overviewScrollRef.current;

        if (
            !container ||
            sections.length === 0
        ) {
            return;
        }

        const handleScroll = () => {
            /*
             * Do not allow normal scroll
             * detection to override a
             * clicked section while the
             * smooth scroll is running.
             */

            if (
                isProgrammaticScroll.current
            ) {
                const target =
                    programmaticTarget.current;

                if (
                    target !== null
                ) {
                    const distance =
                        Math.abs(
                            container.scrollTop -
                                target
                        );

                    if (
                        distance <= 2
                    ) {
                        isProgrammaticScroll.current =
                            false;

                        programmaticTarget.current =
                            null;
                    }
                }

                return;
            }

            const containerTop =
                container
                    .getBoundingClientRect()
                    .top;

            let currentSection =
                sections[0].id;

            for (
                const section of sections
            ) {
                const element =
                    container.querySelector(
                        `#${CSS.escape(
                            section.id
                        )}`
                    ) as HTMLElement | null;

                if (!element) {
                    continue;
                }

                const elementTop =
                    element
                        .getBoundingClientRect()
                        .top -
                    containerTop;

                if (
                    elementTop <= 90
                ) {
                    currentSection =
                        section.id;
                }
            }

            const currentSectionIndex =
                sections.findIndex(
                    (section) =>
                        section.id ===
                        currentSection
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
         * Initial detection.
         */

        handleScroll();

        return () => {
            container.removeEventListener(
                "scroll",
                handleScroll
            );
        };
    }, [sections]);

    /* =====================================================
       RENDER
    ===================================================== */

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
            ================================================= */}

            <button
                type="button"
                onClick={onPrevious}
                disabled={
                    !canGoPrevious
                }
                aria-label="Previous topic"
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
            ================================================= */}

            <button
                type="button"
                onClick={onNext}
                disabled={
                    !canGoNext
                }
                aria-label="Next topic"
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
                    justify-end
                    px-4

                    sm:px-5
                "
            >
                {onBookmark && (
                    <button
                        type="button"
                        onClick={
                            onBookmark
                        }
                        aria-label={
                            isBookmarked
                                ? "Remove topic bookmark"
                                : "Bookmark topic"
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
                )}
            </div>

            {/* =================================================
                SCROLL AREA
            ================================================= */}

            <div
                ref={
                    overviewScrollRef
                }
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
                {/* =================================================
                    TOPIC NAME
                ================================================= */}

                <h2
                    className="
                        whitespace-pre-wrap
                        break-words
                        text-[16px]
                        font-medium
                        leading-[25.6px]
                        text-gray-900

                        sm:text-[18px]
                        sm:leading-[28px]

                        md:text-[20px]
                        md:leading-[30px]
                    "
                >
                    {topic.name}
                </h2>

                {/* =================================================
                    OVERVIEW
                ================================================= */}

                <div
                    className="
                        mt-3

                        sm:mt-5
                    "
                >
                    {/* =================================================
                        SECTION NAVIGATION
                    ================================================= */}

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
                                ref={
                                    sectionNavRef
                                }
                                className="
                                    flex
                                    gap-2
                                    overflow-x-auto
                                    scrollbar-thin
                                    pb-2
                                "
                            >
                                {sections.map(
                                    (
                                        section
                                    ) => {
                                        const isActive =
                                            activeSection ===
                                            section.id;

                                        return (
                                            <button
                                                key={
                                                    section.id
                                                }
                                                type="button"
                                                data-section-id={
                                                    section.id
                                                }
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

                                                    ${
                                                        isActive
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

                    {/* =================================================
                        CONTENT
                    ================================================= */}

                    <div
                        className="
                            flex
                            flex-col
                            items-start
                            space-y-2
                            pb-4
                        "
                    >
                        {sections.length >
                        0 ? (
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
                                        className="
                                            scroll-mt-3
                                            w-full
                                            flex-none
                                            self-start
                                        "
                                    >
                                        {/* SECTION HEADING */}

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
                                                    {
                                                        section.icon
                                                    }
                                                </span>

                                                <span className="min-w-0 break-words">
                                                    {
                                                        section.title
                                                    }
                                                </span>
                                            </h3>
                                        </div>

                                        {/* SECTION CONTENT */}

                                        <div
                                            className={`
                                                w-full
                                                flex-none
                                                self-start
                                                rounded-2xl
                                                border
                                                p-3.5

                                                sm:p-5

                                                ${
                                                    index ===
                                                    0
                                                        ? "border-green-200 bg-green-50"
                                                        : "border-gray-200 bg-gray-50"
                                                }
                                            `}
                                        >
                                            <div className="w-full">
                                                <MarkdownRenderer
                                                    content={
                                                        section.content
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </section>
                                )
                            )
                        ) : (
                            <div
                                className="
                                    w-full
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
                                        content={
                                            topic.overview
                                        }
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}