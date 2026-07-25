import {
    doc,
    getDoc,
    runTransaction,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

async function getNextBatchNumber(category: string) {
    const counterRef = doc(
        db,
        "written_batches_metadata",
        "counters"
    );

    return await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(counterRef);

        if (!snapshot.exists()) {
            throw new Error("Batch counter document not found.");
        }

        const data = snapshot.data();

        const current = data[category] ?? 0;
        const next = current + 1;

        transaction.update(counterRef, {
            [category]: next,
        });

        return next;
    });
}

export async function uploadWrittenBatch(
    rows: any[],
    sourceFile: string
) {

    try {
        if (!rows.length) return;

        const category = String(rows[0].Category)
            .trim()
            .toLowerCase();

        const batchNumber = await getNextBatchNumber(category);

        const batchId = `${category}_batch_${String(batchNumber).padStart(3, "0")}`;

        const questions = rows.map((row: any, index: number) => ({
            id: crypto.randomUUID(),
            class: String(row.Class).trim(),
            category: category,
            topic: String(row.Topic).trim(),
            year: Number(row.Year),
            month: String(row.Month).trim(),
            question: String(row.Question).trim(),
            answer: String(row.Answer).trim(),
            order: index + 1,
            isActive: true,
        }));

        const topicCount = new Set(
            questions.map((q) => q.topic)
        ).size;

        console.log("Creating batch:", batchId);
        console.log("Category:", category);
        console.log("Questions:", questions.length);

        const batchRef = doc(
            db,
            "written_batches",
            batchId
        );

        console.log("Writing document:", batchRef.path);

        await setDoc(
            batchRef,
            {
                batchId,
                batchNumber,
                category,
                sourceFile,
                questionCount: questions.length,
                topicCount,
                questions,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }
        );

        console.log(
            "Batch created successfully:",
            batchId
        );

    } catch (error) {
        console.error(
            "BATCH CREATION ERROR:",
            error
        );

        throw error;
    }

}