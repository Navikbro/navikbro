"use client";

import {
    ArrowRight,
    BookOpen,
} from "lucide-react";

interface TopicListCardProps {
    topic: string;
    questionCount?: number;
    category?: string;
    onClick?: () => void;
}

export default function TopicListCard({
    topic,
    questionCount = 0,
    category,
    onClick,
}: TopicListCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group w-full text-left"
        >
            <div className="flex h-full min-h-[170px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md">

                <div className="flex flex-1 flex-col p-5">

                    {/* TOP */}
                    <div className="flex items-start gap-3">

                        {/* ICON */}
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition-colors group-hover:bg-gray-900 group-hover:text-white">
                            <BookOpen
                                size={20}
                                strokeWidth={2}
                            />
                        </div>

                        {/* TITLE */}
                        <div className="min-w-0 flex-1">

                            {/* FN3 / FN4B / FN5 / FN6 */}
                            {category && (
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    {category}
                                </p>
                            )}

                            {/* TOPIC */}
                            <h3 className="line-clamp-2 text-base font-bold leading-snug text-gray-900">
                                {topic}
                            </h3>

                        </div>
                    </div>

                    {/* INFO */}
                    <div className="mt-auto flex items-end justify-between pt-6">

                        <div>
                            <p className="text-xs text-gray-400">
                                Questions
                            </p>

                            <p className="mt-0.5 text-sm font-semibold text-gray-800">
                                {questionCount.toLocaleString()}
                            </p>
                        </div>

                        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 transition-colors group-hover:text-gray-900">
                            <span>
                                View Topic
                            </span>

                            <ArrowRight
                                size={16}
                                className="transition-transform duration-200 group-hover:translate-x-1"
                            />
                        </div>

                    </div>
                </div>
            </div>
        </button>
    );
}