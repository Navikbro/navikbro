import {
    collection,
    doc,
    getDocs,
    getDoc,
    query,
    runTransaction,
    serverTimestamp,
    updateDoc,
    increment,
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

export interface OralFilters {
    topics: string[];
    surveyors: string[];
    mmds: string[];
    classes: string[];
}

async function updateOralMetadata(
    category: string,
    batchCountAdded: number,
    questions: OralBatchQuestion[],
    topics: string[],
    surveyors: string[],
    mmds: string[],
    classes: string[]
) {
    const counterRef = doc(
        db,
        "oral_batches_metadata",
        "counters"
    );

    await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(counterRef);

        if (!snapshot.exists()) {
            throw new Error(
                "oral_batches_metadata/counters document not found."
            );
        }

        const data = snapshot.data();

        const existing = data[category] ?? {};

        const mergedTopics = [
            ...new Set([
                ...(existing.topics ?? []),
                ...topics,
            ]),
        ].sort();

        const mergedSurveyors = [
            ...new Set([
                ...(existing.surveyors ?? []),
                ...surveyors,
            ]),
        ].sort();

        const mergedMmds = [
            ...new Set([
                ...(existing.mmds ?? []),
                ...mmds,
            ]),
        ].sort();

        const mergedClasses = [
            ...new Set([
                ...(existing.classes ?? []),
                ...classes,
            ]),
        ].sort();

        transaction.update(counterRef, {
            [`${category}.batchCount`]:
                (existing.batchCount ?? 0) + batchCountAdded,

            [`${category}.questionCount`]:
                (existing.questionCount ?? 0) + questions.length,

            [`${category}.topicCount`]:
                mergedTopics.length,

            [`${category}.topics`]:
                mergedTopics,

            [`${category}.surveyors`]:
                mergedSurveyors,

            [`${category}.mmds`]:
                mergedMmds,

            [`${category}.classes`]:
                mergedClasses,

            [`${category}.updatedAt`]:
                serverTimestamp(),
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
    sourceFile: string,
    onProgress?: (uploaded: number, total: number) => void
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

        const questions =
            groupedQuestions[category];

        const topics = [...new Set(questions.map(q => q.topic))].sort();

        const surveyors = [...new Set(questions.map(q => q.surveyor))].sort();

        const mmds = [...new Set(questions.map(q => q.mmd))].sort();

        const classes = [...new Set(questions.map(q => q.class))].sort();

        const firestoreBatch = writeBatch(db);

        const totalBatches = Math.ceil(
            questions.length / ORAL_BATCH_SIZE
        );


        const firstBatchNumber =
            await getNextOralBatchNumber(category);


        for (
            let i = 0;
            i < totalBatches;
            i++
        ) {

            const batchNumber =
                firstBatchNumber + i;


            const start =
                i * ORAL_BATCH_SIZE;

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

        await updateOralMetadata(
            category,
            totalBatches,
            questions,
            topics,
            surveyors,
            mmds,
            classes
        );

        console.log(
            `${category}: ${questions.length} questions uploaded in ${totalBatches} batches`
        );
    }
}

async function getNextOralBatchNumber(
    category: string
) {
    const counterRef = doc(
        db,
        "oral_batches_metadata",
        "counters"
    );

    return await runTransaction(
        db,
        async (transaction) => {

            const snapshot =
                await transaction.get(counterRef);


            if (!snapshot.exists()) {
                throw new Error(
                    "oral counter missing"
                );
            }


            const data =
                snapshot.data();


            return (
                data[category]?.batchCount ?? 0
            ) + 1;

        }
    );
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

    return questions;
}

export async function getOralBatchPage(
    category: string,
    batchNumber: number,
    batchCount: number
) {
    const currentBatchId = getBatchId(
        category,
        batchNumber
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

    const data =
        currentSnapshot.data() as OralBatchDocument;

    const hasMore = batchNumber < batchCount;

    return {
        questions: data.questions,
        hasMore,
        nextBatch: hasMore
            ? batchNumber + 1
            : null,
    };
}


export async function getOralCategoryMeta(
    category: string
): Promise<{
    batchCount: number;
    questionCount: number;
    topicCount: number;
}> {
    const snapshot = await getDoc(
        doc(db, "oral_batches_metadata", "counters")
    );

    if (!snapshot.exists()) {
        return {
            batchCount: 0,
            questionCount: 0,
            topicCount: 0,
        };
    }

    const data = snapshot.data();

    const meta = data[category.toLowerCase()] ?? {};

    return {
        batchCount: meta.batchCount ?? 0,
        questionCount: meta.questionCount ?? 0,
        topicCount: meta.topicCount ?? 0,
    };
}

export async function getOralCategoryData(
    category: string
): Promise<{
    batchCount: number;
    questionCount: number;
    topicCount: number;
    filters: OralFilters;
}> {

    const snapshot = await getDoc(
        doc(db, "oral_batches_metadata", "counters")
    );

    if (!snapshot.exists()) {
        return {
            batchCount: 0,
            questionCount: 0,
            topicCount: 0,
            filters: {
                topics: [],
                surveyors: [],
                mmds: [],
                classes: [],
            },
        };
    }

    const data = snapshot.data();

    const meta = data[category.toLowerCase()] ?? {};

    return {
        batchCount: meta.batchCount ?? 0,
        questionCount: meta.questionCount ?? 0,
        topicCount: meta.topicCount ?? 0,

        filters: {
            topics: meta.topics ?? [],
            surveyors: meta.surveyors ?? [],
            mmds: meta.mmds ?? [],
            classes: meta.classes ?? [],
        },
    };
}

export async function deleteOralBatchQuestion(
    category: string,
    questionId: string
) {
    const q = query(
        collection(db, "oral_batches"),
        where("category", "==", category.toLowerCase())
    );

    const snapshot = await getDocs(q);

    for (const batchDoc of snapshot.docs) {

        const data =
            batchDoc.data() as OralBatchDocument;

        const index = data.questions.findIndex(
            q => q.id === questionId
        );

        if (index === -1) continue;

        data.questions.splice(index, 1);

        data.questions.forEach((q, i) => {
            q.order = i + 1;
        });

        await updateDoc(batchDoc.ref, {
            questions: data.questions,
            questionCount: data.questions.length,
            topicCount: new Set(
                data.questions.map(q => q.topic)
            ).size,
            updatedAt: serverTimestamp(),
        });

        await runTransaction(db, async (transaction) => {

            const counterRef = doc(
                db,
                "oral_batches_metadata",
                "counters"
            );

            transaction.update(counterRef, {
                [`${category.toLowerCase()}.questionCount`]:
                    increment(-1),
            });

        });

        return;
    }

    throw new Error("Question not found.");
}

export async function updateOralBatchQuestion(
    category: string,
    id: string,
    data: {
        question: string;
        answer: string;
    }
) {

    const snapshot = await getDocs(
        query(
            collection(db, "oral_batches"),
            where(
                "category",
                "==",
                category.toLowerCase()
            )
        )
    );

    for (const batchDoc of snapshot.docs) {

        const batchData = batchDoc.data();

        const questions = [...(batchData.questions ?? [])];

        const index = questions.findIndex(
            (q: OralBatchQuestion) => q.id === id
        );

        if (index === -1) {
            continue;
        }

        questions[index] = {
            ...questions[index],
            question: data.question,
            answer: data.answer,
        };

        await updateDoc(
            batchDoc.ref,
            {
                questions,
                updatedAt: serverTimestamp(),
            }
        );

        return;
    }

    throw new Error("Question not found");
}

export async function deleteOralBatchQuestions(
    category: string,
    ids: string[]
) {
    const normalizedCategory = category.toLowerCase();

    const snapshot = await getDocs(
        query(
            collection(db, "oral_batches"),
            where(
                "category",
                "==",
                normalizedCategory
            )
        )
    );


    let deletedCount = 0;


    for (const batchDoc of snapshot.docs) {

        const batchData = batchDoc.data();

        const questions: OralBatchQuestion[] =
            batchData.questions ?? [];


        const updatedQuestions =
            questions.filter(
                (q: OralBatchQuestion) =>
                    !ids.includes(q.id)
            );


        if (
            updatedQuestions.length ===
            questions.length
        ) {
            continue;
        }


        deletedCount +=
            questions.length -
            updatedQuestions.length;


        updatedQuestions.forEach((q, index) => {
            q.order = index + 1;
        });


        const topicCount =
            new Set(
                updatedQuestions.map(
                    (q) => q.topic
                )
            ).size;


        await updateDoc(
            batchDoc.ref,
            {
                questions: updatedQuestions,

                questionCount:
                    updatedQuestions.length,

                topicCount,

                updatedAt:
                    serverTimestamp(),
            }
        );


        console.log(
            "Updated batch:",
            batchDoc.id
        );

    }



    // Update metadata counter
    if (deletedCount > 0) {

        await runTransaction(
            db,
            async (transaction) => {

                const counterRef =
                    doc(
                        db,
                        "oral_batches_metadata",
                        "counters"
                    );


                const counterSnap =
                    await transaction.get(
                        counterRef
                    );


                if (!counterSnap.exists()) {
                    return;
                }


                const data =
                    counterSnap.data();


                const currentCount =
                    data[normalizedCategory]
                        ?.questionCount ?? 0;



                transaction.update(
                    counterRef,
                    {

                        [`${normalizedCategory}.questionCount`]:
                            Math.max(
                                currentCount -
                                deletedCount,
                                0
                            ),


                        [`${normalizedCategory}.updatedAt`]:
                            serverTimestamp(),

                    }
                );

            }
        );

    }


}




export async function getOralFilters(
    category: string
): Promise<OralFilters> {

    const snapshot = await getDoc(
        doc(db, "oral_batches_metadata", "counters")
    );

    if (!snapshot.exists()) {
        return {
            topics: [],
            surveyors: [],
            mmds: [],
            classes: [],
        };
    }

    const data = snapshot.data();

    const meta = data[category.toLowerCase()] ?? {};

    return {
        topics: meta.topics ?? [],
        surveyors: meta.surveyors ?? [],
        mmds: meta.mmds ?? [],
        classes: meta.classes ?? [],
    };
}

export async function getAllOralBatchQuestions(
    category: string
): Promise<OralBatchQuestion[]> {


    const meta =
        await getOralCategoryMeta(category);


    const batchCount =
        meta.batchCount;


    const allQuestions: OralBatchQuestion[] = [];



    for (
        let batchNumber = batchCount;
        batchNumber >= 1;
        batchNumber--
    ) {
        const page =
            await getOralBatchPage(
                category,
                batchNumber,
                batchCount
            );

        allQuestions.push(
            ...page.questions
        );
    }

    return allQuestions;
}

export async function getOralQuestionsForExport(
    category: string
) {
    const questions = await getAllOralBatchQuestions(category);

    return questions.map((q) => ({
        Category: q.category.toUpperCase(),
        Class: q.class,
        Date: q.examDate,
        MMD: q.mmd,
        Surveyor: q.surveyor,
        Topic: q.topic,
        Question: q.question,
        Answer: q.answer,
    }));
}

export async function getAllOralQuestionCounts(): Promise<Record<string, number>> {
    const snapshot = await getDoc(
        doc(db, "oral_batches_metadata", "counters")
    );

    if (!snapshot.exists()) {
        return {
            FN3: 0,
            FN4B: 0,
            FN5: 0,
            FN6: 0,
        };
    }

    const data = snapshot.data();

    return {
        FN3: data.fn3?.questionCount ?? 0,
        FN4B: data.fn4b?.questionCount ?? 0,
        FN5: data.fn5?.questionCount ?? 0,
        FN6: data.fn6?.questionCount ?? 0,
    };
}