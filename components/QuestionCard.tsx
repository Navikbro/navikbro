"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { submitCommunityAnswer } from "@/services/firestore";
import { ChevronDown, ChevronUp } from "lucide-react";

import { getApprovedAnswers } from "@/services/firestore";
import CommunityAnswer from "./CommunityAnswer";

interface ApprovedAnswer {
    id: string;
    userName: string;
    answer: string;
    likes: number;
}

interface Props {
    questionId: string;
    category: string;

    question: string;
    answer: string;

    mmd: string;
    surveyor: string;
    topic: string;
}

export default function QuestionCard({
    questionId,
    category,
    question,
    answer,
    mmd,
    surveyor,
    topic,
}: Props) {
    const [showAnswer, setShowAnswer] = useState(false);

    const [communityAnswers, setCommunityAnswers] = useState<
        ApprovedAnswer[]
    >([]);

    const { user } = useAuth();

    const [myAnswer, setMyAnswer] = useState("");

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function loadAnswers() {
            try {
                const data = await getApprovedAnswers(
                    category,
                    questionId
                );

                setCommunityAnswers(data as ApprovedAnswer[]);
            } catch (error) {
                console.error(error);
            }
        }

        loadAnswers();
    }, [category, questionId]);

    async function handleSubmit() {
        if (!user) {
            alert("Please login first.");
            return;
        }

        if (!myAnswer.trim()) {
            alert("Please write your answer.");
            return;
        }

        try {
            setSubmitting(true);

            await submitCommunityAnswer({
                category,
                questionId,
                userId: user.uid,
                userName: user.displayName || "Anonymous",
                answer: myAnswer,
            });

            alert("Answer submitted for admin approval.");

            setMyAnswer("");
        } catch (error) {
            console.error(error);
            alert("Submission failed.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Question */}
            <h2 className="text-xl font-semibold">
                {question}
            </h2>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                    {mmd}
                </span>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                    {surveyor}
                </span>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                    {topic}
                </span>
            </div>

            {/* Official Answer */}
            <button
                onClick={() => setShowAnswer((prev) => !prev)}
                className="mt-6 flex items-center gap-2 font-medium text-blue-600"
            >
                {showAnswer ? (
                    <>
                        <ChevronUp size={18} />
                        Hide Official Answer
                    </>
                ) : (
                    <>
                        <ChevronDown size={18} />
                        Show Official Answer
                    </>
                )}
            </button>

            {showAnswer && (
                <div className="mt-4 rounded-2xl bg-gray-50 p-5">
                    <p className="whitespace-pre-wrap text-gray-700">
                        {answer}
                    </p>
                </div>
            )}

            {/* Community Answers */}
            <div className="mt-8 border-t pt-6">
                <h3 className="mb-4 text-lg font-semibold">
                    Community Answers
                </h3>

                {communityAnswers.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        No community answers yet.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {communityAnswers.map((item) => (
                            <CommunityAnswer
                                key={item.id}
                                userName={item.userName}
                                answer={item.answer}
                                likes={item.likes}
                            />
                        ))}
                    </div>
                )}

                {/* Submit Your Answer */}
                <div className="mt-8 border-t pt-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        Submit Your Answer
                    </h3>

                    <textarea
                        value={myAnswer}
                        onChange={(e) => setMyAnswer(e.target.value)}
                        placeholder="Write your answer here..."
                        className="min-h-36 w-full rounded-2xl border border-gray-300 p-4 outline-none focus:border-black"
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="mt-4 rounded-2xl bg-black px-6 py-3 text-white disabled:opacity-50"
                    >
                        {submitting ? "Submitting..." : "Submit Answer"}
                    </button>
                </div>
            </div>
        </div>
    );
}