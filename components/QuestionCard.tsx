"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { submitCommunityAnswer } from "@/services/firestore";
import { ChevronDown, ChevronUp, ClipboardList } from "lucide-react";

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

    isOpen: boolean;
    onToggle: () => void;

    showMmd: boolean;
    showSurveyor: boolean;
    showTopic: boolean;
}

export default function QuestionCard({
    questionId,
    category,
    question,
    answer,
    mmd,
    surveyor,
    topic,
    isOpen,
    onToggle,
    showMmd,
    showSurveyor,
    showTopic,
}: Props) {

    const [communityAnswers, setCommunityAnswers] = useState<
        ApprovedAnswer[]
    >([]);

    const { user } = useAuth();

    const [myAnswer, setMyAnswer] = useState("");

    const [submitting, setSubmitting] = useState(false);

    const [showCommunity, setShowCommunity] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setShowCommunity(false);
        }
    }, [isOpen]);

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
            setShowCommunity(false);


            setMyAnswer("");
        } catch (error) {
            console.error(error);
            alert("Submission failed.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div
            className="
    rounded-2xl
    border
    border-gray-200
    bg-white
    p-4
    sm:p-5
    md:p-6
    shadow-sm
    transition
    hover:shadow-md
    "
        >
            <div
                onClick={onToggle}
                className="
    cursor-pointer
    select-none
    "
            >
                <div
                    className="
    flex
    items-start
    justify-between
    gap-3
    "
                >

                    <div
                        className="
    flex
    min-w-0
    items-start
    gap-3
    "
                    >
                        <ClipboardList
                            className="mt-1 h-5 w-5 shrink-0 flex-none text-green-600"
                        />

                        <h2
                            className="
    text-base
    sm:text-lg
    md:text-xl
    font-semibold
    leading-6
    sm:leading-7
    break-words
    text-gray-900
    "
                        >
                            {question}
                        </h2>
                    </div>

                    {isOpen ? (
                        <ChevronUp size={20} />
                    ) : (
                        <ChevronDown size={20} />
                    )}

                </div>

                {(showMmd || showSurveyor || showTopic) && (
                    <div className="mt-4 flex flex-wrap gap-2">

                        {showMmd && (
                            <span
                                className="
        rounded-full
        bg-blue-50
        px-3
        py-1
        text-xs
        sm:text-sm
        font-medium
        text-blue-700
        max-w-full
        truncate
        "
                            >
                                🏢 {mmd}
                            </span>
                        )}

                        {showSurveyor && (
                            <span
                                className="
        rounded-full
        bg-purple-50
        px-3
        py-1
        text-xs
        sm:text-sm
        font-medium
        text-purple-500
        max-w-full
        truncate
        "
                            >
                                ⚓ {surveyor}
                            </span>
                        )}

                        {showTopic && (
                            <span
                                className="
        rounded-full
        bg-green-50
        px-3
        py-1
        text-xs
        sm:text-sm
        font-medium
        text-green-700
        max-w-full
        truncate
        "
                            >
                                📚 {topic}
                            </span>
                        )}

                    </div>
                )}
            </div>

            {/* Official Answer */}


            <div
                className={`
    overflow-hidden
    transition-all
    duration-300
    ease-in-out
   ${isOpen ? "max-h-[10000px] opacity-100 mt-4" : "max-h-0 opacity-0"}
    `}
            >
                {/* Official Answer */}
                <div
                    className="
    mt-4
    rounded-2xl
    bg-green-50
    border
    border-green-100
    p-4
    sm:p-5
    "
                >
                    <p
                        className="
    whitespace-pre-wrap
    text-sm
    sm:text-base
    leading-6
    text-gray-700
    "
                    >
                        {answer}
                    </p>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowCommunity(!showCommunity);
                    }}
                    className="
    mt-6
    flex
    w-full
    items-center
    justify-between
    rounded-xl
    border
    border-gray-200
    bg-gray-50
    px-4
    py-3
    text-sm
    sm:text-base
    font-semibold
    text-gray-700
    hover:bg-gray-100
    "
                >
                    <span>
                        💬 Community Discussion
                    </span>

                    {showCommunity ? (
                        <ChevronUp size={18} />
                    ) : (
                        <ChevronDown size={18} />
                    )}

                </button>

                <div
                    className={`
    overflow-hidden
    transition-all
    duration-300
    ease-in-out
    ${showCommunity
                            ? "max-h-[10000px] opacity-100 mt-4"
                            : "max-h-0 opacity-0 pointer-events-none"
                        }
    `}
                >

                    <h3
                        className="
mb-4
text-lg
font-semibold
"
                    >
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

                    <div
                        className="
        mt-8
        border-t
        pt-6
        "
                    >

                        <h3
                            className="
            mb-4
            text-lg
            font-semibold
            "
                        >
                            Submit Your Answer
                        </h3>


                        <textarea
                            value={myAnswer}
                            onChange={(e) => setMyAnswer(e.target.value)}
                            placeholder="Write your answer here..."
                            className="
            min-h-36
            w-full
            rounded-2xl
            border
            border-gray-300
            p-4
            outline-none
            focus:border-black
            "
                        />


                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="
            mt-4
            w-full
            sm:w-auto
            rounded-2xl
            bg-black
            px-6
            py-3
            text-white
            disabled:opacity-50
            "
                        >
                            {submitting ? "Submitting..." : "Submit Answer"}
                        </button>


                    </div>


                </div>



            </div>

        </div >
    );
}