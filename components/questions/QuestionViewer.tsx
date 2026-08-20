"use client";
import {
    useEffect,
    useState,
} from "react";

import {
    ArrowLeft,
    Bookmark,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ClipboardList,
} from "lucide-react";

import type {
    OralBatchQuestion,
} from "@/services/orals/oralBatch.service";

import {
    AnimatePresence,
    motion,
} from "framer-motion";

import { useAuth } from "@/providers/AuthContext";

import { submitCommunityAnswer } from "@/services/orals/firestore";

import { getCachedApprovedAnswers } from "@/lib/cache/community-cache";

import CommunityAnswer from "@/components/community/CommunityAnswer";

interface ApprovedAnswer {
    id: string;
    userName: string;
    answer: string;
    likes: number;
}


interface QuestionViewerProps {

    open: boolean;

    questions: OralBatchQuestion[];

    currentIndex: number | null;

    bookmarked: boolean;

    onClose: () => void;

    onBookmark: () => void;

    onPrevious: () => void;

    onNext: () => void;

}


export default function QuestionViewer({

    open,

    questions,

    currentIndex,

    bookmarked,

    onClose,

    onBookmark,

    onPrevious,

    onNext,

}: QuestionViewerProps) {

    const { user } = useAuth();

    const [communityAnswers, setCommunityAnswers] =
        useState<ApprovedAnswer[]>([]);

    const [communityLoaded, setCommunityLoaded] =
        useState(false);

    const [showCommunity, setShowCommunity] =
        useState(false);

    const [myAnswer, setMyAnswer] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);


    useEffect(() => {

        if (open) {

            document.body.style.overflow = "hidden";

        } else {

            document.body.style.overflow = "";

        }


        return () => {

            document.body.style.overflow = "";

        };


    }, [open]);

    useEffect(() => {

        if (!open) {

            setShowCommunity(false);

            setCommunityLoaded(false);

            setCommunityAnswers([]);

            setMyAnswer("");

        }

    }, [open]);

    useEffect(() => {

        if (
            !showCommunity ||
            communityLoaded
        ) {

            return;

        }
        async function loadAnswers() {

            if (
                currentIndex === null ||
                !questions[currentIndex]
            ) {
                return;
            }

            const currentQuestion =
                questions[currentIndex];

            try {

                const data =
                    await getCachedApprovedAnswers(
                        currentQuestion.category,
                        currentQuestion.id
                    );

                setCommunityAnswers(
                    data as ApprovedAnswer[]
                );

                setCommunityLoaded(true);

            } catch (error) {

                console.error(error);

            }

        }

        loadAnswers();

    }, [
        showCommunity,
        communityLoaded,
        currentIndex,
        questions,
    ]);



    if (
        !open ||
        currentIndex === null ||
        !questions[currentIndex]
    ) {

        return null;

    }




    const question =
        questions[currentIndex];

    const category =
        question.category;


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

                questionId: question.id,

                userId: user.uid,

                userName:
                    user.displayName ||
                    "Anonymous",

                answer: myAnswer,

            });

            alert(
                "Answer submitted for admin approval."
            );

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
            fixed
            inset-0
            z-50
            bg-[#f6f6f6]
            "
        >


            <div
                className="
                flex
                h-full
                flex-col
                "
            >


                {/* HEADER */}
                <header
                    className="
        sticky
        top-0
        z-20
        bg-[#f6f6f6]
        pt-4
        pb-3
    "
                >
                    <div
                        className="
            mx-auto
            w-full
            max-w-5xl
            rounded-3xl
            border
            border-gray-200
            bg-white
            px-5
            py-4
            shadow-sm
        "
                    >
                        <div
                            className="
                flex
                items-center
                justify-between
            "
                        >
                            <button
                                onClick={onClose}
                                className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    transition
                    hover:bg-gray-50
                    active:scale-95
                "
                            >
                                <ArrowLeft size={20} />
                            </button>

                            <div className="text-center">
                                <p className="text-xs text-gray-500">
                                    Question
                                </p>

                                <p className="font-bold">
                                    {currentIndex + 1} / {questions.length}
                                </p>
                            </div>

                            <button
                                onClick={onBookmark}
                                className="
                    rounded-full
                    p-3
                    transition
                    hover:bg-gray-100
                    active:scale-95
                "
                            >
                                <Bookmark
                                    size={22}
                                    className={
                                        bookmarked
                                            ? "fill-yellow-400 text-yellow-500"
                                            : "text-gray-500"
                                    }
                                />
                            </button>
                        </div>
                    </div>
                </header>

                {/* BODY */}

                <main
                    className="
                    flex-1
                    overflow-y-auto
                    "
                >

                    <motion.div
                        key={question.id}
                        initial={{
                            opacity: 0,
                            y: 20
                        }}
                        animate={{
                            opacity: 1,
                            y: 0
                        }}
                        transition={{
                            duration: 0.2
                        }}
                        className="
    mx-auto
    w-full
    max-w-5xl
    space-y-6
    px-0
    py-6
    pb-32
"
                    >

                        {/* QUESTION CARD */}


                        <section
                            className="
                            rounded-3xl
                            border
                            bg-white
                            p-6
                            shadow-sm
                            "
                        >


                            <div
                                className="
                                flex
                                items-center
                                gap-2
                                text-sm
                                font-semibold
                                text-gray-500
                                "
                            >

                                <ClipboardList
                                    size={18}
                                    className="text-green-600"
                                />


                                QUESTION
                                {" "}
                                {currentIndex + 1}


                            </div>



                            <h1
                                className="
                                mt-5
                                text-xl
                                sm:text-2xl
                                font-bold
                                leading-relaxed
                                text-gray-900
                                "
                            >

                                {question.question}


                            </h1>



                            {/* META */}

                            <div
                                className="
                                mt-6
                                grid
                                grid-cols-2
                                gap-3
                                sm:grid-cols-4
                                "
                            >


                                <div
                                    className="
                                    rounded-2xl
                                    bg-yellow-50
                                    p-3
                                    "
                                >

                                    <p className="text-xs text-gray-500">
                                        Exam
                                    </p>

                                    <p className="mt-1 text-sm font-semibold">
                                        📅 {question.examDate}
                                    </p>

                                </div>




                                <div
                                    className="
                                    rounded-2xl
                                    bg-blue-50
                                    p-3
                                    "
                                >

                                    <p className="text-xs text-gray-500">
                                        MMD
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-blue-700">
                                        🏢 {question.mmd}
                                    </p>

                                </div>




                                <div
                                    className="
                                    rounded-2xl
                                    bg-purple-50
                                    p-3
                                    "
                                >

                                    <p className="text-xs text-gray-500">
                                        Surveyor
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-purple-700">
                                        ⚓ {question.surveyor}
                                    </p>

                                </div>



                                <div
                                    className="
                                    rounded-2xl
                                    bg-green-50
                                    p-3
                                    "
                                >

                                    <p className="text-xs text-gray-500">
                                        Topic
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-green-700">
                                        📚 {question.topic}
                                    </p>

                                </div>


                            </div>


                        </section>
                        {/* ANSWER CARD */}


                        <section
                            className="
                            rounded-3xl
                            border
                            border-green-200
                            bg-green-50
                            p-6
                            "
                        >


                            <div
                                className="
                                flex
                                items-center
                                justify-between
                                "
                            >

                                <h2
                                    className="
                                    text-xl
                                    font-bold
                                    text-gray-900
                                    "
                                >
                                    ✓ Official Answer
                                </h2>


                            </div>



                            <p
                                className="
                                mt-5
                                whitespace-pre-wrap
                                leading-8
                                text-gray-700
                                "
                            >

                                {question.answer}


                            </p>


                        </section>




                        {/* DISCUSSION PLACEHOLDER */}


                        <section
                            className="
    rounded-3xl
    border
    bg-white
    p-6
    shadow-sm
    "
                        >

                            <button
                                onClick={() =>
                                    setShowCommunity(!showCommunity)
                                }
                                className="
        flex
        w-full
        items-center
        justify-between
        rounded-xl
        border
        border-gray-200
        bg-gray-50
        px-5
        py-4
        text-left
        font-semibold
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

                            <AnimatePresence initial={false}>

                                {showCommunity && (

                                    <motion.div

                                        initial={{
                                            height: 0,
                                            opacity: 0,
                                        }}

                                        animate={{
                                            height: "auto",
                                            opacity: 1,
                                        }}

                                        exit={{
                                            height: 0,
                                            opacity: 0,
                                        }}

                                        transition={{
                                            duration: 0.2,
                                        }}

                                        className="overflow-hidden"

                                    >

                                        <div className="mt-6">

                                            <h2
                                                className="
                        text-lg
                        font-bold
                        "
                                            >
                                                Community Answers
                                            </h2>

                                            {communityAnswers.length === 0 ? (

                                                <p className="mt-3 text-sm text-gray-500">

                                                    No community answers yet.

                                                </p>

                                            ) : (

                                                <div className="mt-5 space-y-4">

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

                                            <div
                                                className="
                        mt-8
                        border-t
                        pt-6
                        "
                                            >

                                                <h3
                                                    className="
                            text-lg
                            font-semibold
                            "
                                                >

                                                    Submit Your Answer

                                                </h3>

                                                <textarea

                                                    value={myAnswer}

                                                    onChange={(e) =>
                                                        setMyAnswer(
                                                            e.target.value
                                                        )
                                                    }

                                                    placeholder="Write your answer..."

                                                    className="
                            mt-4
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
                            mt-5
                            rounded-2xl
                            bg-black
                            px-6
                            py-3
                            text-white
                            disabled:opacity-50
                            "

                                                >

                                                    {submitting
                                                        ? "Submitting..."
                                                        : "Submit Answer"}

                                                </button>

                                            </div>

                                        </div>

                                    </motion.div>

                                )}

                            </AnimatePresence>

                        </section>



                    </motion.div>


                </main>



                {/* BOTTOM NAVIGATION */}


                <footer
                    className="
                    fixed
                    bottom-0
                    left-0
                    right-0
                    border-t
                    bg-white
                    "
                >


                    <div
                        className="
                        mx-auto
                        flex
                        max-w-4xl
                        items-center
                        justify-between
                        gap-4
                        px-5
                        py-4
                        "
                    >



                        <button
                            onClick={onPrevious}
                            disabled={currentIndex === 0}
                            className={`
        flex
        items-center
        gap-2
        rounded-2xl
        px-5
        py-3
        transition-colors
        ${currentIndex === 0
                                    ? "border bg-white text-gray-400 cursor-not-allowed"
                                    : "bg-black text-white hover:bg-gray-800"
                                }
    `}
                        >

                            <ChevronLeft size={18} />

                            Previous

                        </button>


                        <button
                            onClick={onNext}
                            disabled={
                                currentIndex === questions.length - 1
                            }
                            className="
                            flex
                            items-center
                            gap-2
                            rounded-2xl
                            bg-black
                            px-6
                            py-3
                            text-white
                            disabled:opacity-40
                            "
                        >

                            Next

                            <ChevronRight
                                size={18}
                            />

                        </button>



                    </div>


                </footer>



            </div>


        </div>

    );

}