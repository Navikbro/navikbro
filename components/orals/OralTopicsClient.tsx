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

   Values are already serialized by the server page.
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
    category: string;
}


/* =========================================================
   COMPONENT
========================================================= */

export default function OralTopicsClient({
    topics,
    category,
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
            <div className="mt-5">

                {/* CATEGORY HEADER */}

                <div className="mb-6">
                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            gap-4
                        "
                    >
                        <div>
                            <p
                                className="
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-wider
                                    text-gray-400
                                "
                            >
                                Oral Topics
                            </p>

                            <h1
                                className="
                                    mt-1
                                    text-2xl
                                    font-bold
                                    tracking-tight
                                    text-gray-900
                                    sm:text-3xl
                                "
                            >
                                {category.toUpperCase()}
                            </h1>
                        </div>

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
                            0 Topics
                        </div>
                    </div>
                </div>


                {/* EMPTY */}

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


    /*
     * This should theoretically never happen because
     * selectedIndex is kept within bounds above.
     *
     * The guard makes the component defensive against
     * unexpected prop changes during rendering.
     */

    if (!selectedTopic) {
        return null;
    }


    /* =====================================================
       TOPIC VIEW
       
       IMPORTANT:
       There is ONLY ONE TopicCard.

       Previous / Next changes the topic
       inside this same viewer.
    ===================================================== */

    return (
        <div className="mt-5">

            {/* CATEGORY HEADER */}

            <div className="mb-6">
                <div
                    className="
                        flex
                        items-center
                        justify-between
                        gap-4
                    "
                >
                    <div>
                        <p
                            className="
                                text-xs
                                font-bold
                                uppercase
                                tracking-wider
                                text-gray-400
                            "
                        >
                            Oral Topics
                        </p>

                        <h1
                            className="
                                mt-1
                                text-2xl
                                font-bold
                                tracking-tight
                                text-gray-900
                                sm:text-3xl
                            "
                        >
                            {category.toUpperCase()}
                        </h1>
                    </div>

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
            </div>


            {/* =================================================
                SINGLE TOPIC VIEWER

                Intentionally ONE TopicCard.
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