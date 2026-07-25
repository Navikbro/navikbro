import {
    collection,
    getDocs,
    query,
    where,
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
            )
        )
    );


    const questions: WrittenQuestion[] = [];


    snapshot.docs.forEach((batchDoc) => {

        const data = batchDoc.data();


        if (
            data.category?.toLowerCase() !==
            normalizedCategory
        ) {
            return;
        }


        const batchQuestions =
            data.questions ?? [];


        batchQuestions.forEach(
            (question: WrittenQuestion) => {

                if (
                    question.isActive !== false
                ) {
                    questions.push(question);
                }

            }
        );

    });


    return questions.sort(
        (a, b) =>
            (a.order ?? 0) -
            (b.order ?? 0)
    );
}

export async function getWrittenQuestionCount(
    category: string
): Promise<number> {

    const snapshot = await getDocs(
        query(
            collection(db, "written_batches"),
            where("category", "==", category.toLowerCase())
        )
    );

    let total = 0;

    snapshot.docs.forEach((batchDoc) => {
        const data = batchDoc.data();

        if (
            data.category?.toLowerCase() ===
            category.toLowerCase()
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
    const snapshot = await getDocs(
        query(
            collection(db, "written_batches"),
            where("category", "==", category.toLowerCase())
        )
    );

    const questions: any[] = [];

    snapshot.docs.forEach((batchDoc) => {
        const data = batchDoc.data();


        if (
            data.category?.toLowerCase() !==
            category.toLowerCase()
        ) {
            return;
        }

        (data.questions ?? []).forEach((question: any) => {
            questions.push({
                id: question.id,
                question: question.question ?? "",
                answer: question.answer ?? "",
                topic: question.topic ?? "",
                class: question.class ?? "",
                month: question.month ?? "",
                year: question.year,
                order: question.order ?? 0,
            });
        });
    });


    return questions.sort(
        (a, b) => a.order - b.order
    );
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


        const questions =
            [...(batchData.questions ?? [])];


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