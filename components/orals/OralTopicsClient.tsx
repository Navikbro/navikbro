"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    ArrowLeft,
    Sailboat,
} from "lucide-react";

import Link from "next/link";

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
    backHref: string;
}


/* =========================================================
   COMPONENT
========================================================= */

export default function OralTopicsClient({
    topics,
    backHref,
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
                SMALL TOPIC HEADER
            ================================================= */}

            <div
                className="
                    mb-5
                    flex
                    items-center
                    justify-between
                    rounded-3xl
                    border
                    border-gray-200
                    bg-white
                    px-3
                    py-3
                    shadow-sm
                    sm:px-4
                "
            >

                {/* =================================================
                    BACK BUTTON
                ================================================= */}

                <Link
                    href={backHref}
                    className="
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        rounded-2xl
        border
        border-gray-200
        bg-white
        transition
        hover:bg-gray-50
    "
                    aria-label="Back to oral category"
                >
                    <ArrowLeft size={18} />
                </Link>


                {/* =================================================
                    TOPIC NAME + COUNTER
                ================================================= */}

                <div
                    className="
                        flex
                        min-w-0
                        flex-1
                        items-center
                        justify-center
                        gap-2
                        px-3
                    "
                >

                    <h1
                        className="
                            truncate
                            text-sm
                            font-bold
                            tracking-tight
                            text-gray-900
                            sm:text-base
                        "
                    >
                        {selectedTopic.name}
                    </h1>

                    <span
                        className="
                            shrink-0
                            text-xs
                            font-semibold
                            text-gray-400
                        "
                    >
                        {selectedIndex + 1} /{" "}
                        {topics.length}
                    </span>

                </div>


                {/* =================================================
                    NAVIK LOGO ONLY
                ================================================= */}

                <div
                    className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                    "
                    aria-label="NAVIK"
                >
                    <Sailboat
                        size={25}
                        strokeWidth={2}
                        className="
                            rotate-[-8deg]
                            text-black
                        "
                    />
                </div>

            </div>


            {/* =================================================
                TOPIC CARD
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