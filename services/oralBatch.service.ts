import {
    collection,
    doc,
    getDocs,
    getDoc,
    query,
    runTransaction,
    serverTimestamp,
    where,
    writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export const ORAL_BATCH_SIZE = 200;

const CATEGORY_MAP: Record<string, string> = {
    safety: "fn3",
    fn3: "fn3",

    motor: "fn4b",
    fn4b: "fn4b",

    electrical: "fn5",
    fn5: "fn5",

    mep: "fn6",
    fn6: "fn6",
};

const clean = (value: unknown): string =>
    String(value ?? "").trim();

const getBatchId = (
    category: string,
    batchNumber: number
): string =>
    `${category.toLowerCase()}_batch_${String(
        batchNumber
    ).padStart(3, "0")}`;

export interface OralBatchQuestion {
    id: string;
    class: string;
    category: string;
    examDate: string;
    topic: string;
    mmd: string;
    surveyor: string;
    question: string;
    answer: string;
    order: number;
    isActive: boolean;
}

export interface OralBatchDocument {
    batchId: string;
    batchNumber: number;
    category: string;
    sourceFile: string;
    questionCount: number;
    topicCount: number;
    questions: OralBatchQuestion[];
    createdAt: unknown;
    updatedAt: unknown;
}

async function setBatchCount(
    category: string,
    count: number
) {
    const counterRef = doc(
        db,
        "oral_batches_metadata",
        "counters"
    );

    await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(counterRef);

        if (!snap.exists()) {
            throw new Error(
                "oral_batches_metadata/counters document not found."
            );
        }

        transaction.update(counterRef, {
            [`${category}.batchCount`]: count,
            [`${category}.updatedAt`]: serverTimestamp(),
        });
    });
}

export async function deleteExistingBatches(
    category: string
) {
    const q = query(
        collection(db, "oral_batches"),
        where("category", "==", category.toLowerCase())
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return;
    }

    const batch = writeBatch(db);

    snapshot.docs.forEach((document) => {
        batch.delete(document.ref);
    });

    await batch.commit();
}

export async function uploadOralBatch(
    rows: any[],
    sourceFile: string
) {
    if (!rows.length) return;

    const groupedQuestions: Record<
        string,
        OralBatchQuestion[]
    > = {};

    rows
        .filter((row) => row.Question)
        .forEach((row) => {

            let category = clean(row.Category)
                .toLowerCase();

            category =
                CATEGORY_MAP[category] ?? category;

            if (!groupedQuestions[category]) {
                groupedQuestions[category] = [];
            }

            groupedQuestions[category].push({
                id: crypto.randomUUID(),

                class: clean(row.Class),
                category,

                examDate: clean(row.Date),

                topic: clean(row.Topic),

                mmd: clean(row.MMD),

                surveyor: clean(row.Surveyor),

                question: clean(row.Question),

                answer: clean(row.Answer),

                order:
                    groupedQuestions[category]
                        .length + 1,

                isActive: true,
            });
        });

    for (const category of Object.keys(groupedQuestions)) {

        await deleteExistingBatches(category);

        const questions =
            groupedQuestions[category];

        const firestoreBatch = writeBatch(db);

        const totalBatches = Math.ceil(
            questions.length / ORAL_BATCH_SIZE
        );

        for (
            let batchNumber = 1;
            batchNumber <= totalBatches;
            batchNumber++
        ) {

            const start =
                (batchNumber - 1) *
                ORAL_BATCH_SIZE;

            const batchQuestions =
                questions.slice(
                    start,
                    start + ORAL_BATCH_SIZE
                );

            const batchId = getBatchId(
                category,
                batchNumber
            );

            firestoreBatch.set(
                doc(db, "oral_batches", batchId),
                {
                    batchId,
                    batchNumber,
                    category,
                    sourceFile,

                    questionCount: batchQuestions.length,

                    topicCount: new Set(
                        batchQuestions.map((q) => q.topic)
                    ).size,

                    questions: batchQuestions,

                    createdAt: serverTimestamp(),

                    updatedAt: serverTimestamp(),
                }
            );

            console.log(
                `Uploaded ${batchId} (${batchQuestions.length} questions)`
            );
        }

        await firestoreBatch.commit();

        await setBatchCount(
            category,
            totalBatches
        );

        console.log(
            `${category}: ${questions.length} questions uploaded in ${totalBatches} batches`
        );
    }
}

export async function getOralBatchQuestions(
    category: string
): Promise<OralBatchQuestion[]> {

    const q = query(
        collection(db, "oral_batches"),
        where(
            "category",
            "==",
            category.toLowerCase()
        )
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return [];
    }

    const questions: OralBatchQuestion[] = [];

    snapshot.docs
        .sort((a, b) => {
            const first =
                a.data().batchNumber ?? 0;

            const second =
                b.data().batchNumber ?? 0;

            return first - second;
        })
        .forEach((document) => {

            const data =
                document.data() as OralBatchDocument;

            if (
                Array.isArray(data.questions)
            ) {
                questions.push(
                    ...data.questions
                );
            }

        });

    questions.sort(
        (a, b) => a.order - b.order
    );

    return questions;
}

export async function getOralBatchPage(
    category: string,
    batchNumber: number
) {

    const currentBatchId = getBatchId(
        category,
        batchNumber
    );

    const nextBatchId = getBatchId(
        category,
        batchNumber + 1
    );


    const currentSnapshot = await getDoc(
        doc(
            db,
            "oral_batches",
            currentBatchId
        )
    );


    if (!currentSnapshot.exists()) {
        return {
            questions: [],
            hasMore: false,
            nextBatch: null,
        };
    }


    const nextSnapshot = await getDoc(
        doc(
            db,
            "oral_batches",
            nextBatchId
        )
    );


    const data =
        currentSnapshot.data() as OralBatchDocument;

    const hasMore = nextSnapshot.exists();

    return {
        questions: data.questions,
        hasMore,
        nextBatch: hasMore
            ? batchNumber + 1
            : null,
    };

}