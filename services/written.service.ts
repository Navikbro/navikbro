import {
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    writeBatch,
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

    return snapshot.docs.map((doc) => {
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
}

export async function bulkUploadWrittenQuestions(
    rows: any[]
) {
    const batch = writeBatch(db);

    const orderCounter: Record<string, number> = {};

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

        if (!orderCounter[category]) {
            orderCounter[category] = 1;
        }

        const ref = doc(
            collection(
                db,
                "writtens",
                category,
                "questions"
            )
        );

        batch.set(ref, {
            class: String(row.Class).trim(),

            category: String(row.Category).trim(),

            topic: String(row.Topic).trim(),

            year: Number(row.Year),

            month: String(row.Month).trim(),

            question: String(row.Question).trim(),

            answer: String(row.Answer).trim(),

            order: orderCounter[category]++,

            isActive: true,

            createdAt: serverTimestamp(),

            updatedAt: serverTimestamp(),
        });
    });

    await batch.commit();
}