"use client";

import { useEffect, useRef, useState } from "react";

import QuestionsList from "./QuestionsList";

import {
    getQuestionsByOrder,
    Question,
} from "@/services/firestore";

interface Props {
    category: string;
}

export default function QuestionsContainer({
    category,
}: Props) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    const [lastOrder, setLastOrder] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const hasMoreRef = useRef(false);
    const loadingRef = useRef(false);
    const loadingMoreRef = useRef(false);
    const lastOrderRef = useRef(0);

    useEffect(() => {
        setQuestions([]);
        setLoading(true);
        setLastOrder(0);
        setHasMore(false);

        lastOrderRef.current = 0;
        hasMoreRef.current = false;
        loadingRef.current = true;
        loadingMoreRef.current = false;

        loadFirstPage();
    }, [category]);

    async function loadFirstPage() {
        try {
            loadingRef.current = true;
            setLoading(true);

            const result = await getQuestionsByOrder(category);

            setQuestions(result.questions);
            setLastOrder(result.lastOrder ?? 0);
            const nextOrder = result.lastOrder ?? 0;

            setLastOrder(nextOrder);
            lastOrderRef.current = nextOrder;

            setHasMore(result.hasMore);
            hasMoreRef.current = result.hasMore;
            setHasMore(result.hasMore);
            hasMoreRef.current = result.hasMore;
        } catch (err) {
            console.error(err);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }

    async function loadMore() {
        if (
            !hasMoreRef.current ||
            loadingRef.current ||
            loadingMoreRef.current
        ) {
            return;
        }

        try {
            setLoadingMore(true);
            loadingMoreRef.current = true;

            const result = await getQuestionsByOrder(
                category,
                lastOrderRef.current
            );

            setQuestions((prev) => {
                const ids = new Set(prev.map((q) => q.id));

                return [
                    ...prev,
                    ...result.questions.filter(
                        (q) => !ids.has(q.id)
                    ),
                ];
            });

            const nextOrder = result.lastOrder ?? lastOrderRef.current;

            setLastOrder(nextOrder);
            lastOrderRef.current = nextOrder;
            setHasMore(result.hasMore);
        } catch (err) {
            console.error(err);
        } finally {
            loadingMoreRef.current = false;
            setLoadingMore(false);
        }
    }

    useEffect(() => {
        hasMoreRef.current = hasMore;
    }, [hasMore]);

    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    useEffect(() => {
        loadingMoreRef.current = loadingMore;
    }, [loadingMore]);

    useEffect(() => {
        lastOrderRef.current = lastOrder;
    }, [lastOrder]);

    useEffect(() => {
        const element = loadMoreRef.current;

        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (
                    entry.isIntersecting &&
                    hasMoreRef.current &&
                    !loadingRef.current &&
                    !loadingMoreRef.current
                ) {
                    loadMore();
                }
            },
            {
                rootMargin: "300px",
            }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [hasMore]);

    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-28 animate-pulse rounded-2xl bg-gray-200"
                    />
                ))}
            </div>
        );
    }

    return (
        <>
            <QuestionsList
                category={category}
                questions={questions}
            />

            {/* Infinite Scroll Trigger */}
            {hasMore && (
                <div
                    ref={loadMoreRef}
                    className="flex justify-center py-8"
                >
                    {loadingMore && (
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    )}
                </div>
            )}

            {/* End Message */}
            {!hasMore && questions.length > 0 && (
                <div className="py-10 text-center">
                    <div className="mx-auto mb-4 h-px w-24 bg-gray-300" />

                    <p className="text-sm text-gray-500">
                        You've reached the end.
                    </p>
                </div>
            )}
        </>
    );
}