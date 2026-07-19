"use client";

import { useEffect, useRef, useState } from "react";

import {
    getWrittenQuestions,
    deleteWrittenQuestion,
    updateWrittenQuestion,
} from "@/services/written.service";

import {
    getQuestions,
    updateQuestion,
    deleteQuestion,
    deleteQuestionsBatch,
    moveQuestionsBatch,
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

    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

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

    const [selectionMode, setSelectionMode] = useState(false);

    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const [showMoveDialog, setShowMoveDialog] = useState(false);

    const [moveCategory, setMoveCategory] = useState("FN3");

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

    async function handleBulkDelete() {
        try {
            await deleteQuestionsBatch(
                category,
                selectedQuestions
            );

            await loadQuestions();

            setSelectedQuestions([]);
            setSelectionMode(false);
            setShowDeleteDialog(false);

            alert("Questions deleted successfully.");
        } catch (error) {
            console.error(error);
            alert("Failed to delete questions.");
        }
    }

    async function handleBulkMove() {
        try {

            const questionsToMove = questions.filter((q) =>
                selectedQuestions.includes(q.id)
            );

            await moveQuestionsBatch(
                questionsToMove,
                category,
                moveCategory
            );

            await loadQuestions();

            setSelectedQuestions([]);
            setSelectionMode(false);
            setShowMoveDialog(false);

            alert("Questions moved successfully.");

        } catch (error) {

            console.error(error);
            alert("Failed to move questions.");

        }
    }


    function toggleSelection(id: string) {
        setSelectedQuestions((prev) =>
            prev.includes(id)
                ? prev.filter((q) => q !== id)
                : [...prev, id]
        );
    }

    function startLongPress(id: string) {
        if (type !== "oral") return;

        longPressTimer.current = setTimeout(() => {
            setSelectionMode(true);
            setSelectedQuestions([id]);
        }, 500);
    }

    function cancelLongPress() {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }

    function handleQuestionClick(id: string) {
        if (selectionMode) {
            toggleSelection(id);
            return;
        }

        setExpandedId((prev) => (prev === id ? null : id));
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

                {selectionMode && (
                    <div className="sticky top-4 z-40 mb-6 rounded-2xl border bg-white p-4 shadow-lg">
                        <div className="flex flex-wrap items-center justify-between gap-4">

                            <span className="font-semibold text-lg">
                                {selectedQuestions.length} Selected
                            </span>

                            <div className="flex gap-3">

                                <button
                                    onClick={() => {
                                        const categories = ["FN3", "FN4B", "FN5", "FN6"];
                                        setMoveCategory(
                                            categories.find(
                                                (c) => c !== category.toUpperCase()
                                            ) || "FN3"
                                        );
                                        setShowMoveDialog(true);
                                    }}
                                    className="rounded-xl bg-blue-600 px-5 py-2 text-white"
                                >
                                    Move
                                </button>

                                <button
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="rounded-xl bg-red-600 px-5 py-2 text-white"
                                >
                                    Delete
                                </button>

                                <button
                                    onClick={() => {
                                        setSelectionMode(false);
                                        setSelectedQuestions([]);
                                    }}
                                    className="rounded-xl border px-5 py-2"
                                >
                                    Cancel
                                </button>

                            </div>

                        </div>
                    </div>
                )}

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
                                        onClick={() => handleQuestionClick(question.id)}
                                        onMouseDown={() => startLongPress(question.id)}
                                        onMouseUp={cancelLongPress}
                                        onMouseLeave={cancelLongPress}
                                        onTouchStart={() => startLongPress(question.id)}
                                        onTouchEnd={cancelLongPress}
                                        className={`w-full text-left transition ${selectionMode &&
                                            selectedQuestions.includes(question.id)
                                            ? "rounded-xl bg-blue-50"
                                            : ""
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {selectionMode && (
                                                <span className="mt-1 text-lg">
                                                    {selectedQuestions.includes(question.id)
                                                        ? "✅"
                                                        : "⭕"}
                                                </span>
                                            )}

                                            <h2 className="text-lg font-semibold whitespace-pre-wrap">
                                                {question.question}
                                            </h2>
                                        </div>

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

            {showMoveDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

                        <h2 className="text-2xl font-bold text-blue-600">
                            Move Questions
                        </h2>

                        <p className="mt-4 text-gray-600">
                            Move <b>{selectedQuestions.length}</b> selected question(s) to:
                        </p>

                        <select
                            value={moveCategory}
                            onChange={(e) => setMoveCategory(e.target.value)}
                            className="mt-5 w-full rounded-xl border border-gray-300 p-3"
                        >
                            <option value="FN3">FN3</option>
                            <option value="FN4B">FN4B</option>
                            <option value="FN5">FN5</option>
                            <option value="FN6">FN6</option>
                        </select>

                        <div className="mt-8 flex justify-end gap-3">

                            <button
                                onClick={() => setShowMoveDialog(false)}
                                className="rounded-xl border px-5 py-2"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleBulkMove}
                                className="rounded-xl bg-blue-600 px-5 py-2 text-white"
                            >
                                Move
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {showDeleteDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

                        <h2 className="text-2xl font-bold text-red-600">
                            Delete Questions
                        </h2>

                        <p className="mt-4 text-gray-600">
                            Are you sure you want to delete{" "}
                            <b>{selectedQuestions.length}</b> selected question(s)?
                        </p>

                        <p className="mt-2 text-sm text-red-500">
                            This action cannot be undone.
                        </p>

                        <div className="mt-8 flex justify-end gap-3">

                            <button
                                onClick={() => setShowDeleteDialog(false)}
                                className="rounded-xl border px-5 py-2"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleBulkDelete}
                                className="rounded-xl bg-red-600 px-5 py-2 text-white"
                            >
                                Delete
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {showMoveDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

                        <h2 className="text-2xl font-bold">
                            Move Questions
                        </h2>

                        <p className="mt-3 text-gray-600">
                            Move <b>{selectedQuestions.length}</b> selected question(s) to:
                        </p>

                        <div className="mt-6 grid grid-cols-2 gap-3">

                            {["FN3", "FN4B", "FN5", "FN6"].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setMoveCategory(cat)}
                                    className={`rounded-xl border px-4 py-3 font-semibold transition ${moveCategory === cat
                                        ? "border-blue-600 bg-blue-600 text-white"
                                        : "border-gray-300 hover:bg-gray-100"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}

                        </div>

                        <div className="mt-8 flex justify-end gap-3">

                            <button
                                onClick={() => setShowMoveDialog(false)}
                                className="rounded-xl border px-5 py-2"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleBulkMove}
                                className="rounded-xl bg-blue-600 px-5 py-2 text-white"
                            >
                                Move
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {showMoveDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

                        <h2 className="text-2xl font-bold">
                            Move Questions
                        </h2>

                        <p className="mt-4 text-gray-600">
                            Move <b>{selectedQuestions.length}</b> selected question(s) to:
                        </p>

                        <select
                            value={moveCategory}
                            onChange={(e) => setMoveCategory(e.target.value)}
                            className="mt-5 w-full rounded-xl border border-gray-300 p-3"
                        >
                            {["FN3", "FN4B", "FN5", "FN6"]
                                .filter((c) => c !== category.toUpperCase())
                                .map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                        </select>

                        <div className="mt-8 flex justify-end gap-3">

                            <button
                                onClick={() => setShowMoveDialog(false)}
                                className="rounded-xl border px-5 py-2"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleBulkMove}
                                className="rounded-xl bg-blue-600 px-5 py-2 text-white"
                            >
                                Move
                            </button>

                        </div>

                    </div>
                </div>
            )}
        </main >
    );
}