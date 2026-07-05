"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/app/context/AuthContext";
import { isUserAdmin } from "@/services/admin";
import {
    getPendingAnswers,
    approveAnswer,
    rejectAnswer,
} from "@/services/firestore";

import AdminAnswerCard from "@/components/AdminAnswerCard";

interface PendingAnswer {
    id: string;
    questionId: string;
    category: string;
    userName: string;
    answer: string;
}

export default function AdminPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [checking, setChecking] = useState(true);
    const [answers, setAnswers] = useState<PendingAnswer[]>([]);

    useEffect(() => {
        async function init() {
            if (loading) return;

            if (!user) {
                router.replace("/");
                return;
            }

            const admin = await isUserAdmin(user.uid);

            if (!admin) {
                router.replace("/");
                return;
            }

            const pending = await getPendingAnswers();

            setAnswers(pending as PendingAnswer[]);
            setChecking(false);
        }

        init();
    }, [user, loading, router]);

    async function handleApprove(id: string) {
        await approveAnswer(id);

        setAnswers((prev) =>
            prev.filter((answer) => answer.id !== id)
        );
    }

    async function handleReject(id: string) {
        await rejectAnswer(id);

        setAnswers((prev) =>
            prev.filter((answer) => answer.id !== id)
        );
    }

    if (checking) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Checking permissions...
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#f5f5f5]">
            <div className="mx-auto max-w-6xl px-6 py-10">

                <h1 className="text-4xl font-bold">
                    Admin Dashboard
                </h1>

                <p className="mt-2 text-gray-500">
                    Manage uploads and community answers.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">

                    <Link
                        href="/admin/orals"
                        className="rounded-2xl bg-black px-6 py-3 text-white transition hover:opacity-90"
                    >
                        Upload Oral Questions
                    </Link>

                    <Link
                        href="/admin/writtens"
                        className="rounded-2xl bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
                    >
                        Upload Written Questions
                    </Link>

                </div>

                <div className="mt-12">

                    <h2 className="text-2xl font-bold">
                        Pending Community Answers
                    </h2>

                    <div className="mt-6 space-y-6">

                        {answers.length === 0 && (
                            <div className="rounded-3xl border border-gray-200 bg-white p-8">
                                No pending answers.
                            </div>
                        )}

                        {answers.map((answer) => (
                            <AdminAnswerCard
                                key={answer.id}
                                id={answer.id}
                                questionId={answer.questionId}
                                category={answer.category}
                                userName={answer.userName}
                                answer={answer.answer}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        ))}

                    </div>

                </div>

            </div>
        </main>
    );
}