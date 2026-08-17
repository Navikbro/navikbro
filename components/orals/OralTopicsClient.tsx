"use client";

import {
    useEffect,
    useState,
} from "react";

import TopicCard, {
    type TopicCardTopic,
} from "@/components/orals/TopicCard";


/* =========================================================
   CLIENT TOPIC TYPE
========================================================= */

export interface SerializedOralTopic
    extends TopicCardTopic {
    category?: string;
    updatedAt?: string | number | null;
    createdAt?: string | number | null;
    questionCount?: number;
    class?: string;
}


/* =========================================================
   PROPS
========================================================= */

interface OralTopicsClientProps {
    topics: SerializedOralTopic[];
}


/* =========================================================
   COMPONENT
========================================================= */

export default function OralTopicsClient({
    topics,
}: OralTopicsClientProps) {

    const [
        selectedIndex,
        setSelectedIndex,
    ] = useState(0);


    /* =====================================================
       KEEP INDEX VALID WHEN TOPICS CHANGE
    ===================================================== */

    useEffect(() => {
        setSelectedIndex((current) =>
            Math.min(
                current,
                Math.max(
                    0,
                    topics.length - 1
                )
            )
        );
    }, [topics.length]);


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    if (topics.length === 0) {
        return (
            <div className="mt-2">

                <div
                    className="
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white
                        px-5
                        py-12
                        text-center
                        shadow-sm
                    "
                >

                    <p
                        className="
                            text-sm
                            font-medium
                            text-gray-700
                        "
                    >
                        No topics found.
                    </p>

                    <p
                        className="
                            mt-1
                            text-sm
                            text-gray-500
                        "
                    >
                        Topics will appear here
                        when they are available.
                    </p>

                </div>

            </div>
        );
    }


    /* =====================================================
       SELECTED TOPIC
    ===================================================== */

    const selectedTopic =
        topics[selectedIndex];


    if (!selectedTopic) {
        return null;
    }


    /* =====================================================
       TOPIC VIEW
    ===================================================== */

    return (
        <div className="mt-2">

            {/* =================================================
                TOPIC COUNTER

                Example:
                1 / 1
                1 / 5
                2 / 5
            ================================================= */}

            <div
                className="
                    mb-3
                    flex
                    justify-end
                "
            >
                <div
                    className="
                        shrink-0
                        rounded-full
                        bg-white
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
                        text-gray-600
                        shadow-sm
                        ring-1
                        ring-gray-200
                    "
                >
                    {selectedIndex + 1} /{" "}
                    {topics.length}
                </div>
            </div>


            {/* =================================================
                TOPIC NAME

                This is intentionally OUTSIDE TopicCard.
            ================================================= */}

            <h1
                className="
                    mb-4
                    text-2xl
                    font-bold
                    tracking-tight
                    text-gray-900
                    sm:text-3xl
                "
            >
                {selectedTopic.name}
            </h1>


            {/* =================================================
                TOPIC CARD

                Topic name is still passed because
                TopicCardTopic requires it.

                If TopicCard currently renders its own
                title, remove that title from TopicCard.tsx
                so only the heading above is visible.
            ================================================= */}

            <TopicCard
                topic={{
                    id: selectedTopic.id,
                    name: selectedTopic.name,
                    overview:
                        selectedTopic.overview,
                }}

                onPrevious={() => {
                    setSelectedIndex(
                        (current) =>
                            Math.max(
                                0,
                                current - 1
                            )
                    );
                }}

                onNext={() => {
                    setSelectedIndex(
                        (current) =>
                            Math.min(
                                topics.length - 1,
                                current + 1
                            )
                    );
                }}

                canGoPrevious={
                    selectedIndex > 0
                }

                canGoNext={
                    selectedIndex <
                    topics.length - 1
                }
            />

        </div>
    );
}