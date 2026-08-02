"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/providers/AuthContext";
import {
    getPendingAnswers,
} from "@/services/orals/firestore";

import {
    approveCommunityAnswer,
    rejectCommunityAnswer,
} from "@/app/actions/communityActions";

import AdminAnswerCard from "@/components/admin/AdminAnswerCard";

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

    const [answers, setAnswers] = useState<PendingAnswer[]>([]);

    useEffect(() => {
        async function loadAnswers() {
            if (loading || !user) return;

            const pending = await getPendingAnswers();
            setAnswers(pending as PendingAnswer[]);
        }

        loadAnswers();
    }, [user, loading]);

    async function handleApprove(
        id: string,
        category: string,
        questionId: string
    ) {
        try {
            await approveCommunityAnswer(
                id,
                category,
                questionId
            );

            setAnswers((prev) =>
                prev.filter((answer) => answer.id !== id)
            );
        } catch (error) {
            console.error(error);
        }
    }
    async function handleReject(
        id: string,
        category: string,
        questionId: string
    ) {
        try {
            await rejectCommunityAnswer(
                id,
                category,
                questionId
            );

            setAnswers((prev) =>
                prev.filter((answer) => answer.id !== id)
            );
        } catch (error) {
            console.error(error);
        }
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
                        href="/admin/content/orals"
                        className="rounded-2xl bg-black px-6 py-3 text-white transition hover:opacity-90"
                    >
                        Upload Oral Questions
                    </Link>

                    <Link
                        href="/admin/content/writtens"
                        className="rounded-2xl bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
                    >
                        Upload Written Questions
                    </Link>

                    <Link
                        href="/admin/content/downloads"
                        className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
                    >
                        <h2 className="text-lg font-semibold">
                            Download Questions
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Download the latest Oral and Written question banks.
                        </p>
                    </Link>

                    <Link
                        href="/admin/manage"
                        className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
                    >
                        <h2 className="text-l font-semibold">
                            MANAGE QUESTIONS ALL
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            View, edit and delete written questions.
                        </p>
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
