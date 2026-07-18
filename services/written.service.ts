import {
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    writeBatch,
    deleteDoc,
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
    const q = query(
        collection(
            db,
            "writtens",
            category.toLowerCase(),
            "questions"
        ),
        orderBy("order")
    );

    const snapshot = await getDocs(q);

    const result = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
            id: doc.id,
            class: data.class ?? "",
            category: data.category ?? "",
            topic: data.topic ?? "",
            year: data.year ?? 0,
            month: data.month ?? "",
            question: data.question ?? "",
            answer: data.answer ?? "",
            order: data.order ?? 0,
            isActive: data.isActive ?? true,
        };
    });

    return result;
}

async function deleteExistingWrittenQuestions(
    category: string
) {
    const questionsRef = collection(
        db,
        "writtens",
        category,
        "questions"
    );

    const snapshot = await getDocs(
        questionsRef
    );

    const deleteBatch = writeBatch(db);

    snapshot.docs.forEach((questionDoc) => {
        deleteBatch.delete(questionDoc.ref);
    });

    await deleteBatch.commit();
}

export async function getWrittenQuestionCount(
    category: string
) {

    const snapshot =
        await getDocs(
            collection(
                db,
                "writtens",
                category,
                "questions"
            )
        );


    return snapshot.size;

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
            collection(
                db,
                "writtens",
                category.toLowerCase(),
                "questions"
            ),
            orderBy("order")
        )
    );

    return snapshot.docs.map((doc) => {
        const data = doc.data();


        return {
            id: doc.id,

            question: data.question ?? "",
            answer: data.answer ?? "",

            topic: data.topic ?? "",
            class: data.class ?? "",

            month: data.month ?? "",
            year: data.year ?? undefined,
        };
    });
}

export async function bulkUploadWrittenQuestions(
    rows: any[]
) {
    const batch = writeBatch(db);

    const orderCounter: Record<string, number> = {};
    const topicCounter: Record<string, Set<string>> = {};

    const categories = new Set<string>();

    rows.forEach((rawRow, index) => {
        const row: Record<string, any> = {};

        Object.keys(rawRow).forEach((key) => {
            row[key.trim()] = rawRow[key];
        });

        const category = String(row.Category)
            .trim()
            .toLowerCase();

        if (!category) {
            throw new Error(
                `Row ${index + 1}: Category missing`
            );
        }
        categories.add(category);

        if (!orderCounter[category]) {
            orderCounter[category] = 1;
        }

        if (!topicCounter[category]) {
            topicCounter[category] = new Set();
        }

        const topic = String(row.Topic ?? "").trim();

        if (topic) {
            topicCounter[category].add(topic);
        }

        const ref = doc(
            collection(
                db,
                "writtens",
                category,
                "questions"
            )
        );

        const answer = String(row.Answer).trim();

        batch.set(ref, {
            class: String(row.Class).trim(),

            category: String(row.Category).trim(),

            topic: String(row.Topic).trim(),

            year: Number(row.Year),

            month: String(row.Month).trim(),

            question: String(row.Question).trim(),

            answer,

            order: orderCounter[category]++,

            isActive: true,

            createdAt: serverTimestamp(),

            updatedAt: serverTimestamp(),
        });
    });

    for (const category of categories) {

        await deleteExistingWrittenQuestions(
            category
        );

    }

    await batch.commit();

    for (const category of Object.keys(orderCounter)) {

        await setDoc(
            doc(db, "writtens", category),
            {
                questionCount: orderCounter[category] - 1,
                topicCount: topicCounter[category].size,
                updatedAt: serverTimestamp(),
            },
            {
                merge: true,
            }
        );

    }
}
export async function updateWrittenQuestion(
    category: string,
    id: string,
    data: Partial<WrittenQuestion>
) {

    console.log("Type:", typeof data.answer);
    console.log("Raw:", data.answer);
    console.log("JSON:", JSON.stringify(data.answer));

    await updateDoc(
        doc(
            db,
            "writtens",
            category.toLowerCase(),
            "questions",
            id
        ),
        {
            ...data,
            updatedAt: serverTimestamp(),
        }
    );
}

export async function deleteWrittenQuestion(
    category: string,
    id: string
) {
    await deleteDoc(
        doc(
            db,
            "writtens",
            category.toLowerCase(),
            "questions",
            id
        )
    );
}
