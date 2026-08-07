"use client";

import { useEffect, useState } from "react";

import {
    getWrittenQuestions,
    deleteWrittenQuestion,
    updateWrittenQuestion,
    getWrittenTopics,
    addWrittenTopic,
    deleteWrittenTopic,
    generateWrittenTopics,
} from "@/services/writtens/written.service";

import {
    getOralBatchQuestions,
    deleteOralBatchQuestion,
    updateOralBatchQuestion,
    getOralTopics,
    addOralTopic,
    deleteOralTopic,
    generateOralTopics,
} from "@/services/orals/oralBatch.service";

import MarkdownRenderer from "@/components/shared/MarkdownRenderer";


export default function ManageWrittenQuestionsPage() {

    const [category, setCategory] =
        useState("general");

    const [type, setType] =
        useState<"written" | "oral">("written");

    const [editedTopic, setEditedTopic] = useState("");

    const [showTopics, setShowTopics] = useState(false);
    const [questions, setQuestions] =
        useState<any[]>([]);

    const [selectedTopic, setSelectedTopic] = useState("");

    const [topics, setTopics] =
        useState<string[]>([]);

    const [newTopic, setNewTopic] =
        useState("");


    const [loading, setLoading] =
        useState(true);

    const [hasPendingChanges, setHasPendingChanges] =
        useState(false);


    const [editingQuestion, setEditingQuestion] =
        useState<any>(null);


    const [editedQuestion, setEditedQuestion] =
        useState("");


    const [editedAnswer, setEditedAnswer] =
        useState("");


    const [expandedId, setExpandedId] =
        useState<string | null>(null);



    async function loadQuestions() {

        try {

            setLoading(true);

            let data: any[];


            if (type === "written") {

                const written =
                    await getWrittenQuestions(category);


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


                const oral =
                    await getOralBatchQuestions(category);


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

        } finally {

            setLoading(false);

        }

    }



    useEffect(() => {

        loadQuestions();

        loadTopics();

    }, [category, type]);

    async function loadTopics() {

        try {

            if (type === "written") {

                const data =
                    await getWrittenTopics(category);

                setTopics(data);

            } else {

                const data =
                    await getOralTopics(category);

                setTopics(data);

            }

        } catch (error) {

            console.error(error);

            setTopics([]);

        }

    }





    async function handleDelete(id: string) {


        const confirmed =
            window.confirm(
                "Are you sure you want to delete this question?"
            );


        if (!confirmed) return;



        try {


            if (type === "written") {


                await deleteWrittenQuestion(
                    category,
                    id
                );



            } else {


                await deleteOralBatchQuestion(
                    category,
                    id
                );
            }



            setQuestions(prev =>
                prev.filter(
                    question =>
                        question.id !== id
                )
            );

            setHasPendingChanges(true);


            alert(
                "Question deleted successfully."
            );


        } catch (error) {


            console.error(error);


            alert(
                "Failed to delete question."
            );

        }

    }






    async function handleSave() {


        if (!editingQuestion)
            return;



        try {


            if (type === "written") {

                await updateWrittenQuestion(
                    category,
                    editingQuestion.id,
                    {
                        question: editedQuestion,
                        answer: editedAnswer,
                        topic: editedTopic,
                    }
                );

            } else {

                await updateOralBatchQuestion(
                    category,
                    editingQuestion.id,
                    {
                        question: editedQuestion,
                        answer: editedAnswer,
                        topic: editedTopic,
                    }
                );

            }




            await loadQuestions();
            await loadTopics();

            setHasPendingChanges(true);

            setEditingQuestion(null);



            alert(
                "Question updated successfully."
            );



        } catch (error) {


            console.error(error);


            alert(
                "Failed to update question."
            );

        }

    }






    async function refreshWrittenCache() {


        if (type !== "written")
            return;



        const res =
            await fetch(
                "/api/revalidate/written",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body:
                        JSON.stringify({
                            category
                        }),
                }
            );



        if (!res.ok) {

            throw new Error(
                "Cache revalidation failed"
            );

        }

    }

    async function refreshOralCache() {
        if (type !== "oral") return;

        const res = await fetch("/api/revalidate/orals/batch", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                categories: [category],
            }),
        });

        if (!res.ok) {
            throw new Error("Oral cache revalidation failed");
        }
    }


    console.log("Topics:", topics);

    async function handleRefreshCache() {
        try {

            if (type === "written") {
                await refreshWrittenCache();
            } else {
                await refreshOralCache();
            }

            setHasPendingChanges(false);

            alert("Cache refreshed successfully.");

        } catch (error) {

            console.error(error);

            alert("Failed to refresh cache.");

        }
    }



    return (

        <main className="min-h-screen bg-[#f5f5f5]">

            <div className="mx-auto max-w-5xl px-5 py-8">


                <h1 className="text-4xl font-bold">
                    MANAGE QUESTIONS ALL
                </h1>


                <div className="mt-2 flex items-center justify-between">

                    <p className="text-gray-500">
                        View, edit and delete questions.
                    </p>

                    <button
                        onClick={handleRefreshCache}
                        disabled={!hasPendingChanges}
                        className={`rounded-xl px-5 py-2 font-medium text-white ${hasPendingChanges
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {hasPendingChanges
                            ? "Publish Changes"
                            : "Everything Published"}
                    </button>

                </div>

                {type === "written" && (
                    <div className="mt-4">
                        <button
                            onClick={async () => {

                                if (type === "written") {
                                    await generateWrittenTopics();
                                } else {
                                    await generateOralTopics();
                                }

                                await loadTopics();

                                setHasPendingChanges(true);

                                alert("Topics generated successfully!");

                            }}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-white"
                        >
                            Generate Topics
                        </button>
                    </div>
                )}



                <div className="mt-8 flex flex-col gap-6 md:flex-row">


                    <div>

                        <label className="mb-2 block text-sm font-medium">
                            Question Type
                        </label>


                        <select

                            value={type}

                            onChange={(e) => {

                                const value =
                                    e.target.value as
                                    "written" | "oral";


                                setType(value);


                                if (value === "written")
                                    setCategory("general");
                                else
                                    setCategory("FN3");

                            }}

                            className="w-full md:w-64 rounded-xl border border-gray-300 bg-white px-4 py-3"

                        >

                            <option value="written">
                                Written
                            </option>

                            <option value="oral">
                                Oral
                            </option>

                        </select>

                    </div>




                    <div>

                        <label className="mb-2 block text-sm font-medium">
                            Category
                        </label>


                        <select

                            value={category}

                            onChange={(e) =>
                                setCategory(e.target.value)
                            }

                            className="w-full md:w-64 rounded-xl border border-gray-300 bg-white px-4 py-3"

                        >


                            {
                                type === "written" ? (

                                    <>

                                        <option value="general">
                                            General
                                        </option>

                                        <option value="mep">
                                            MEP
                                        </option>

                                        <option value="motor">
                                            Motor
                                        </option>

                                        <option value="met">
                                            MET
                                        </option>

                                        <option value="naval">
                                            Naval
                                        </option>

                                        <option value="ssep">
                                            SSEP
                                        </option>

                                    </>


                                ) : (

                                    <>

                                        <option value="FN3">
                                            FN3
                                        </option>

                                        <option value="FN4B">
                                            FN4B
                                        </option>

                                        <option value="FN5">
                                            FN5
                                        </option>

                                        <option value="FN6">
                                            FN6
                                        </option>

                                    </>

                                )

                            }


                        </select>


                    </div>


                </div>
                <div className="mt-8">

                    <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

                        <div className="flex items-center justify-between">

                            <h2 className="text-xl font-bold">
                                Topics
                            </h2>

                            <button
                                onClick={() => setShowTopics(!showTopics)}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                            >
                                {showTopics ? "Close" : "Show Topics"}
                            </button>

                        </div>

                        {showTopics && (
                            <>
                                <div className="mt-6 flex flex-wrap gap-2">

                                    {topics.map((topic) => (

                                        <div
                                            key={topic}
                                            className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2"
                                        >
                                            <span>{topic}</span>

                                            <button
                                                onClick={async () => {

                                                    const used = questions.some(q => q.topic === topic);

                                                    if (used) {
                                                        alert("This topic is used by one or more questions. Change those questions to another topic before deleting it.");
                                                        return;
                                                    }

                                                    if (type === "written") {
                                                        await deleteWrittenTopic(category, topic);
                                                    } else {
                                                        await deleteOralTopic(category, topic);
                                                    }

                                                    await loadTopics();

                                                    setHasPendingChanges(true);

                                                }}
                                                className="text-red-600 font-bold"
                                            >
                                                ×
                                            </button>

                                        </div>


                                    ))}

                                </div>

                                <div className="mt-6 flex gap-3">

                                    <select
                                        value={selectedTopic}
                                        onChange={(e) => setSelectedTopic(e.target.value)}
                                        className="flex-1 rounded-xl border px-4 py-2"
                                    >
                                        <option value="">
                                            Select Topic
                                        </option>

                                        {topics.map((topic) => (
                                            <option key={topic} value={topic}>
                                                {topic}
                                            </option>
                                        ))}

                                        <option value="__new__">
                                            + Add New Topic
                                        </option>
                                    </select>

                                    {selectedTopic === "__new__" && (
                                        <input
                                            value={newTopic}
                                            onChange={(e) => setNewTopic(e.target.value)}
                                            placeholder="Enter new topic"
                                            className="flex-1 rounded-xl border px-4 py-2 mt-3"
                                        />
                                    )}

                                    <button
                                        onClick={async () => {

                                            if (selectedTopic !== "__new__") return;

                                            if (!newTopic.trim()) return;

                                            if (type === "written") {
                                                await addWrittenTopic(category, newTopic.trim());
                                            } else {
                                                await addOralTopic(category, newTopic.trim());
                                            }

                                            setNewTopic("");
                                            setSelectedTopic("");

                                            await loadTopics();

                                            setHasPendingChanges(true);

                                        }}
                                        className="rounded-xl bg-blue-600 px-5 py-2 text-white"
                                    >
                                        Add Topic
                                    </button>

                                </div>
                            </>
                        )}

                    </div>


                    {
                        loading ? (

                            <div className="rounded-2xl bg-white p-6 shadow-sm">
                                Loading...
                            </div>


                        ) : questions.length === 0 ? (


                            <div className="rounded-2xl bg-white p-6 shadow-sm">
                                No questions found.
                            </div>


                        ) : (


                            <div className="space-y-6">


                                {
                                    questions.map((question) => (

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



                                                {
                                                    type === "written" ? (

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

                                                    )
                                                }


                                            </div>




                                            <button

                                                onClick={() =>
                                                    setExpandedId(prev =>
                                                        prev === question.id
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

                                                    {
                                                        expandedId === question.id
                                                            ? "Click to collapse"
                                                            : "Click to view answer"
                                                    }

                                                </p>


                                            </button>





                                            {
                                                expandedId === question.id && (


                                                    <>

                                                        <div className="mt-5 border-t pt-5">

                                                            <MarkdownRenderer
                                                                content={
                                                                    question.answer
                                                                }
                                                            />

                                                        </div>




                                                        <div className="mt-6 flex justify-end gap-3">


                                                            <button

                                                                onClick={() => {

                                                                    setEditingQuestion(question);

                                                                    setEditedQuestion(question.question);

                                                                    setEditedAnswer(question.answer);

                                                                    setEditedTopic(question.topic);

                                                                }}

                                                                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white"

                                                            >

                                                                Edit

                                                            </button>




                                                            <button

                                                                onClick={() =>
                                                                    handleDelete(
                                                                        question.id
                                                                    )
                                                                }

                                                                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white"

                                                            >

                                                                Delete

                                                            </button>



                                                        </div>


                                                    </>


                                                )
                                            }



                                        </div>


                                    ))
                                }



                            </div>


                        )
                    }


                </div>





                {
                    editingQuestion && (


                        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-6">


                            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-xl">


                                <h2 className="text-2xl font-bold">

                                    Edit {
                                        type === "oral"
                                            ? "Oral"
                                            : "Written"
                                    } Question

                                </h2>




                                <textarea

                                    value={editedQuestion}

                                    onChange={(e) =>
                                        setEditedQuestion(
                                            e.target.value
                                        )
                                    }

                                    rows={6}

                                    className="mt-6 w-full rounded-xl border border-gray-300 p-4"

                                />


                                <div className="mt-6">

                                    <label className="mb-2 block text-sm font-semibold">
                                        Topic
                                    </label>

                                    <select
                                        value={editedTopic}
                                        onChange={(e) => setEditedTopic(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 p-4"
                                    >
                                        <option value="">
                                            Select Topic
                                        </option>

                                        {topics.map((topic) => (
                                            <option
                                                key={topic}
                                                value={topic}
                                            >
                                                {topic}
                                            </option>
                                        ))}
                                    </select>

                                </div>


                                <div className="mt-6">


                                    <label className="mb-2 block text-sm font-semibold">

                                        Answer

                                    </label>



                                    <textarea

                                        value={editedAnswer}

                                        onChange={(e) =>
                                            setEditedAnswer(
                                                e.target.value
                                            )
                                        }

                                        rows={12}

                                        className="w-full rounded-xl border border-gray-300 p-4"

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

                                        className="rounded-xl bg-blue-600 px-5 py-2 text-white"

                                    >

                                        Save

                                    </button>



                                </div>



                            </div>



                        </div>


                    )
                }



            </div>


        </main>

    );


}