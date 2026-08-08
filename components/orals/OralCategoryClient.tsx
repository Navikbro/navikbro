"use client";

import { useState } from "react";
import Link from "next/link";

import UserGreeting from "@/components/home/UserGreeting";
import QuestionsContainer from "@/components/questions/QuestionsContainer";

import { ArrowLeft, Sailboat } from "lucide-react";

import type {
    OralBatchQuestion,
    OralFilters,
} from "@/services/orals/oralBatch.service";

interface Props {
    category: string;

    initialQuestions: OralBatchQuestion[];

    filters: OralFilters;

    mmdData: Record<
        string,
        {
            questionCount: number;
            batchCount: number;
            topics: string[];
            surveyors: string[];
        }
    >;

    totalQuestions: number;

    topicCount: number;

    title: string;
    subtitle: string;
    quote: string;
}

export default function OralCategoryClient({
    category,
    initialQuestions,
    filters,
    mmdData,
    totalQuestions,
    topicCount,
    title,
    subtitle,
    quote,
}: Props) {
    const [initialLoadComplete, setInitialLoadComplete] =
        useState(false);

    return (
        <div className="relative">

            {/* =====================================================
                ACTUAL PAGE
                -----------------------------------------------------
                Keep this mounted from the beginning.

                QuestionsContainer must be mounted so that it can
                finish its initial loading and call
                onInitialLoadComplete().
            ===================================================== */}

            <div
                className={
                    initialLoadComplete
                        ? "opacity-100"
                        : "pointer-events-none opacity-0"
                }
            >

                {/* HEADER */}
                <div className="mb-6 rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-sm">

                    {/* Top Row */}
                    <div className="flex items-center justify-between">

                        <Link
                            href="/"
                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 transition hover:bg-gray-50"
                        >
                            <ArrowLeft size={19} />
                        </Link>

                        <div className="flex h-10 w-10 items-center justify-center rotate-[-8deg]">
                            <Sailboat
                                size={28}
                                strokeWidth={2}
                                className="text-black"
                            />
                        </div>

                    </div>

                    {/* Greeting */}
                    <div className="mt-5">
                        <UserGreeting />
                    </div>

                    {/* Quote */}
                    <div className="mt-4 border-l-4 border-black pl-3">
                        <p className="text-xs italic leading-5 text-gray-600">
                            {quote}
                        </p>
                    </div>

                    {/* Category */}
                    <div className="mt-4 flex items-center gap-2">

                        <span className="inline-flex rounded-lg bg-black px-3 py-1 text-xs font-semibold tracking-wider text-white">
                            {title}
                        </span>

                        <h1 className="text-lg font-bold tracking-tight">
                            {subtitle}
                        </h1>

                    </div>

                    {/* Stats */}
                    <div className="mt-4 flex items-center gap-3 text-xs font-medium text-gray-600">

                        <span>
                            {totalQuestions} Questions
                        </span>

                        <span>•</span>

                        <span>
                            {topicCount} Topics
                        </span>

                    </div>

                </div>

                {/* QUESTIONS */}
                <QuestionsContainer
                    category={category}
                    initialQuestions={initialQuestions}
                    filters={filters}
                    mmdData={mmdData}
                    totalQuestions={totalQuestions}
                    onInitialLoadComplete={() => {
                        setInitialLoadComplete(true);
                    }}
                />

            </div>


            {/* =====================================================
                SINGLE INITIAL PAGE SKELETON
                -----------------------------------------------------
                This remains visible while ALL initial data loads.

                It disappears only when QuestionsContainer calls
                onInitialLoadComplete().
            ===================================================== */}

            {!initialLoadComplete && (
                <div className="absolute inset-0 z-50">

                    <div className="mb-6 rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-sm animate-pulse">

                        {/* Top Row */}
                        <div className="flex items-center justify-between">

                            <div className="h-10 w-10 rounded-2xl bg-gray-200" />

                            <div className="h-10 w-10 rounded-full bg-gray-200" />

                        </div>

                        {/* Greeting */}
                        <div className="mt-5 h-5 w-32 rounded bg-gray-200" />

                        {/* Quote */}
                        <div className="mt-4 space-y-2 border-l-4 border-gray-200 pl-3">
                            <div className="h-3 w-4/5 rounded bg-gray-200" />
                            <div className="h-3 w-3/5 rounded bg-gray-200" />
                        </div>

                        {/* Category */}
                        <div className="mt-4 flex items-center gap-2">

                            <div className="h-6 w-12 rounded-lg bg-gray-200" />

                            <div className="h-5 w-28 rounded bg-gray-200" />

                        </div>

                        {/* Stats */}
                        <div className="mt-4 flex items-center gap-3">

                            <div className="h-3 w-24 rounded bg-gray-200" />

                            <div className="h-3 w-2 rounded bg-gray-200" />

                            <div className="h-3 w-20 rounded bg-gray-200" />

                        </div>

                    </div>


                    {/* Search */}
                    <div className="h-14 rounded-2xl bg-gray-200 animate-pulse" />


                    {/* Filters + Bookmark */}
                    <div className="mt-4 grid grid-cols-2 gap-3">

                        <div className="h-14 rounded-2xl bg-gray-200 animate-pulse" />

                        <div className="h-14 rounded-2xl bg-gray-200 animate-pulse" />

                    </div>


                    {/* Questions */}
                    <div className="mt-8 space-y-4">

                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-32 rounded-3xl bg-gray-200 animate-pulse"
                            />
                        ))}

                    </div>

                </div>
            )}

        </div>
    );
}
