"use client";

import { useEffect, useState } from "react";

import {
    getWrittenQuestions,
    deleteWrittenQuestion,
    updateWrittenQuestion,
} from "@/services/written.service";

import {
    getQuestions,
    updateQuestion,
    deleteQuestion,
} from "@/services/firestore";

import MarkdownRenderer from "@/components/MarkdownRenderer";

import {
    WrittenQuestion,
} from "@/services/written.service";

export default function ManageWrittenQuestionsPage() {

    const [category, setCategory] =
        useState("general");

    const [type, setType] =
        useState<"written" | "oral">("written");

    const [questions, setQuestions] =
        useState<any[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [editingQuestion, setEditingQuestion] =
        useState<any>(null);

    const [editedQuestion, setEditedQuestion] =
        useState("");

    const [editedAnswer, setEditedAnswer] =
        useState("");

    const [expandedId, setExpandedId] = useState<string | null>(null);


    async function loadQuestions() {

        try {

            setLoading(true);

            let data: any[];

            if (type === "written") {
                const written = await getWrittenQuestions(category);

                data = written.map(q => ({
                    id: q.id,
                    question: q.question,
                    answer: q.answer,
                    topic: q.topic,
                    class: q.class,
                    month: q.month,
                    year: q.year,
                }));
            } else {
                const oral = await getQuestions(category);

                data = oral.map(q => ({
                    id: q.id,
                    question: q.question,
                    answer: q.answer,
                    topic: q.topic,
                    class: q.class,
                    examDate: q.examDate,
                    mmd: q.mmd,
                    surveyor: q.surveyor,
                }));
            }

            setQuestions(data);
        }

        finally {

            setLoading(false);

        }

    }

    useEffect(() => {
        loadQuestions();
    }, [category, type]);

    async function handleDelete(id: string) {

        const confirmed = window.confirm(
            "Are you sure you want to delete this question?"
        );

        if (!confirmed) return;

        try {

            if (type === "written") {
                await deleteWrittenQuestion(category, id);
            } else {
                await deleteQuestion(category, id);
            }

            setQuestions((prev) =>
                prev.filter(
                    (question) => question.id !== id
                )
            );

            alert("Question deleted successfully.");

        } catch (error) {

            console.error(error);

            alert("Failed to delete question.");

        }

    }

    async function handleSave() {

        if (!editingQuestion) return;

        try {

            if (type === "written") {
                await updateWrittenQuestion(
                    category,
                    editingQuestion.id,
                    {
                        question: editedQuestion,
                        answer: editedAnswer,
                    }
                );
            } else {
                await updateQuestion(
                    category,
                    editingQuestion.id,
                    {
                        question: editedQuestion,
                        answer: editedAnswer,
                    }
                );
            }

            await loadQuestions();

            setEditingQuestion(null);

            alert("Question updated successfully.");

        } catch (error) {

            console.error(error);

            alert("Failed to update question.");

        }

    }

    return (
        <main className="min-h-screen bg-[#f5f5f5]">
            <div className="mx-auto max-w-7xl px-6 py-10">
                <h1 className="text-4xl font-bold">
                    MANAGE QUESTIONS ALL
                </h1>

                <p className="mt-2 text-gray-500">
                    View, edit and delete written questions.
                </p>

                <div className="mt-8 flex flex-col gap-6 md:flex-row">

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Question Type
                        </label>

                        <select
                            value={type}
                            onChange={(e) => {
                                const value = e.target.value as "written" | "oral";
                                setType(value);

                                if (value === "written") {
                                    setCategory("general");
                                } else {
                                    setCategory("FN3");
                                }
                            }}
                            className="w-full md:w-64 rounded-xl border border-gray-300 bg-white px-4 py-3"
                        >
                            <option value="written">Written</option>
                            <option value="oral">Oral</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Category
                        </label>

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full md:w-64 rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
                        >
                            {type === "written" ? (
                                <>
                                    <option value="general">General</option>
                                    <option value="mep">MEP</option>
                                    <option value="motor">Motor</option>
                                    <option value="met">MET</option>
                                    <option value="naval">Naval</option>
                                    <option value="ssep">SSEP</option>
                                </>
                            ) : (
                                <>
                                    <option value="FN3">FN3</option>
                                    <option value="FN4B">FN4B</option>
                                    <option value="FN5">FN5</option>
                                    <option value="FN6">FN6</option>
                                </>
                            )}
                        </select>
                    </div>

                </div>

                <div className="mt-8">

                    {loading ? (

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            Loading...
                        </div>

                    ) : questions.length === 0 ? (

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            No questions found.
                        </div>

                    ) : (

                        <div className="space-y-6">

                            {questions.map((question) => (
                                <div
                                    key={question.id}
                                    className="
            rounded-2xl
            border
            bg-white
            p-6
            shadow-sm
            transition
            hover:shadow-md
        "
                                >
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm">
                                            {question.class}
                                        </span>

                                        <span className="rounded-full bg-gray-200 px-3 py-1 text-sm">
                                            {question.topic}
                                        </span>

                                        {type === "written" ? (
                                            <>
                                                <span className="rounded-full bg-green-100 px-3 py-1 text-sm">
                                                    {question.month}
                                                </span>

                                                <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm">
                                                    {question.year}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="rounded-full bg-green-100 px-3 py-1 text-sm">
                                                    {question.examDate}
                                                </span>

                                                <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm">
                                                    {question.mmd}
                                                </span>

                                                <span className="rounded-full bg-purple-100 px-3 py-1 text-sm">
                                                    {question.surveyor}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <button
                                        onClick={() =>
                                            setExpandedId(
                                                expandedId === question.id
                                                    ? null
                                                    : question.id
                                            )
                                        }
                                        className="w-full text-left"
                                    >
                                        <h2 className="text-lg font-semibold whitespace-pre-wrap">
                                            {question.question}
                                        </h2>

                                        <p className="mt-2 text-sm text-gray-500">
                                            {expandedId === question.id
                                                ? "Click to collapse"
                                                : "Click to view answer"}
                                        </p>
                                    </button>

                                    {expandedId === question.id && (
                                        <>
                                            <div className="mt-5 border-t pt-5">
                                                <MarkdownRenderer
                                                    content={question.answer}
                                                />
                                            </div>

                                            {/* Existing Buttons */}
                                            <div className="mt-6 flex justify-end gap-3">
                                                <button
                                                    onClick={() => {
                                                        setEditingQuestion(question);
                                                        setEditedQuestion(question.question);
                                                        setEditedAnswer(question.answer);
                                                    }}
                                                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(question.id)}
                                                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}

                        </div>
                    )}

                </div>

                {editingQuestion && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

                        <div className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow-xl">

                            <h2 className="text-2xl font-bold">
                                Edit Written Question
                            </h2>

                            <textarea
                                value={editedQuestion}
                                onChange={(e) =>
                                    setEditedQuestion(e.target.value)
                                }
                                rows={6}
                                className="mt-6 w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-black"
                            />

                            <div className="mt-6">

                                <label className="mb-2 block text-sm font-semibold">
                                    Answer
                                </label>

                                <textarea
                                    value={editedAnswer}
                                    onChange={(e) =>
                                        setEditedAnswer(e.target.value)
                                    }
                                    rows={12}
                                    className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-black"
                                />

                            </div>

                            <div className="mt-8 flex justify-end gap-3">

                                <button
                                    onClick={() =>
                                        setEditingQuestion(null)
                                    }
                                    className="rounded-xl border px-5 py-2"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleSave}
                                    className="rounded-xl bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
                                >
                                    Save
                                </button>

                            </div>

                        </div>

                    </div>

                )
                }
            </div>
        </main >
    );
}