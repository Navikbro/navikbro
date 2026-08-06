"use client";

import { Bookmark } from "lucide-react";

interface QuestionRowProps {
    question: string;
    examDate: string;
    mmd: string;
    surveyor: string;
    topic: string;
    showMmd: boolean;
    showSurveyor: boolean;
    showTopic: boolean;
    isBookmarked: boolean;
    onBookmark: () => void;
    onClick: () => void;
}

export default function QuestionRow({
    question,
    examDate,
    mmd,
    surveyor,
    topic,
    showMmd,
    showSurveyor,
    showTopic,
    isBookmarked,
    onBookmark,
    onClick,
}: QuestionRowProps) {

    return (

        <div
            onClick={onClick}
            className="cursor-pointer rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-black hover:shadow-md"
        >

            <div className="flex items-start justify-between gap-4">

                <h2 className="flex-1 text-lg font-semibold leading-7">

                    {question}

                </h2>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onBookmark();
                    }}
                    className="rounded-lg p-2 hover:bg-gray-100"
                >

                    <Bookmark
                        size={20}
                        className={
                            isBookmarked
                                ? "fill-yellow-400 text-yellow-500"
                                : "text-gray-400"
                        }
                    />

                </button>

            </div>

            <div className="mt-5 flex flex-wrap gap-2">

                <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm">
                    📅 {examDate}
                </span>

                {showMmd && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                        🏢 {mmd}
                    </span>
                )}

                {showSurveyor && (
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-sm text-purple-700">
                        ⚓ {surveyor}
                    </span>
                )}

                {showTopic && (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-sm text-green-700">
                        📚 {topic}
                    </span>
                )}

            </div>

        </div>

    );

}