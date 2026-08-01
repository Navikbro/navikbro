import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export interface WrittenQuestion {
    id: string;
    class: string;
    category: string;
    topic: string;
    year: number;
    month: string;
    question: string;
    answer: string;
    order: number;
    isActive: boolean;
}

export async function getWrittenQuestions(
    category: string
): Promise<WrittenQuestion[]> {

    const normalizedCategory =
        category.trim().toLowerCase();


    const snapshot = await getDocs(
        query(
            collection(db, "written_batches"),
            where(
                "category",
                "==",
                normalizedCategory
            ),
            orderBy("batchNumber", "asc")
        )
    );


    const questions: WrittenQuestion[] = [];


    for (const batchDoc of snapshot.docs) {

        const data = batchDoc.data();

        if (
            data.category?.toLowerCase() !==
            normalizedCategory
        ) {
            continue;
        }

        const batchQuestions = [...(data.questions ?? [])].sort(
            (a: WrittenQuestion, b: WrittenQuestion) =>
                (a.order ?? 0) - (b.order ?? 0)
        );

        batchQuestions.forEach(
            (question: WrittenQuestion) => {

                if (question.isActive !== false) {
                    questions.push(question);
                }

            }
        );

    }

    return questions;
}

export async function getWrittenQuestionCount(
    category: string
): Promise<number> {

    const normalizedCategory =
        category.trim().toLowerCase();

    const snapshot = await getDocs(
        query(
            collection(db, "written_batches"),
            where("category", "==", normalizedCategory)
        )
    );

    let total = 0;

    snapshot.docs.forEach((batchDoc) => {
        const data = batchDoc.data();

        if (
            data.category?.toLowerCase() ===
            normalizedCategory
        ) {
            total += data.questionCount ?? 0;
        }
    });

    return total;
}

export async function getAllWrittenQuestionCounts() {

    const categories = [
        "general",
        "motor",
        "mep",
        "ssep",
        "naval",
        "met",
    ];

    const counts: Record<string, number> = {};

    for (const category of categories) {

        counts[category.toUpperCase()] =
            await getWrittenQuestionCount(category);

    }

    return counts;
}


export async function getWrittenQuestionsForExport(
    category: string
) {

    const normalizedCategory =
        category.trim().toLowerCase();

    const snapshot = await getDocs(
        query(
            collection(db, "written_batches"),
            where("category", "==", normalizedCategory),
            orderBy("batchNumber", "asc")
        )
    );

    const questions: any[] = [];

    for (const batchDoc of snapshot.docs) {

        const data = batchDoc.data();

        if (
            data.category?.toLowerCase() !==
            normalizedCategory
        ) {
            continue;
        }

        const batchQuestions = [...(data.questions ?? [])].sort(
            (a: any, b: any) =>
                (a.order ?? 0) - (b.order ?? 0)
        );

        batchQuestions.forEach((question: any) => {

            questions.push({
                id: question.id,
                question: question.question ?? "",
                answer: question.answer ?? "",
                topic: question.topic ?? "",
                class: question.class ?? "",
                category: question.category ?? "",
                month: question.month ?? "",
                year: question.year,
                order: question.order ?? 0,
            });

        });

    }


    return questions;
}

export async function updateWrittenQuestion(
    category: string,
    id: string,
    data: Partial<WrittenQuestion>
) {

    const normalizedCategory =
        category.trim().toLowerCase();


    const snapshot = await getDocs(
        query(
            collection(db, "written_batches"),
            where(
                "category",
                "==",
                normalizedCategory
            )
        )
    );


    for (const batchDoc of snapshot.docs) {

        const batchData = batchDoc.data();


        const questions = [...(batchData.questions ?? [])];


        const index =
            questions.findIndex(
                (q: WrittenQuestion) =>
                    q.id === id
            );


        if (index === -1) {
            continue;
        }


        questions[index] = {
            ...questions[index],
            ...data,
        };


        await updateDoc(
            batchDoc.ref,
            {
                questions,
                updatedAt:
                    serverTimestamp(),
            }
        );


        return;
    }


    throw new Error(
        "Question not found"
    );
}

export async function deleteWrittenQuestion(
    category: string,
    id: string
) {

    const normalizedCategory =
        category.trim().toLowerCase();


    const snapshot = await getDocs(
        query(
            collection(db, "written_batches"),
            where(
                "category",
                "==",
                normalizedCategory
            )
        )
    );


    for (const batchDoc of snapshot.docs) {

        const batchData = batchDoc.data();


        const questions =
            [...(batchData.questions ?? [])];


        const updatedQuestions =
            questions.filter(
                (q: WrittenQuestion) =>
                    q.id !== id
            );


        if (
            updatedQuestions.length ===
            questions.length
        ) {
            continue;
        }


        await updateDoc(
            batchDoc.ref,
            {
                questions:
                    updatedQuestions,
                questionCount:
                    updatedQuestions.length,
                updatedAt:
                    serverTimestamp(),
            }
        );


        return;
    }


    throw new Error(
        "Question not found"
    );
}