

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    getDoc,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
    writeBatch,
    limit,
    startAfter,
    QueryDocumentSnapshot,
    DocumentData,
} from "firebase/firestore";


import { db } from "@/lib/firebase";

let uploadRunning = false;

const questionCache = new Map<string, Question[]>();

export function clearQuestionCache(
    category?: string
) {
    if (category) {
        questionCache.delete(
            category.toLowerCase()
        );
    } else {
        questionCache.clear();
    }
}

export interface Question {
    id: string;
    question: string;
    answer: string;
    topic: string;
    mmd: string;
    surveyor: string;

    class: string;

    examDate: string;

    order: number;
    isActive: boolean;
}

export interface PaginatedQuestions {
    questions: Question[];
    lastDoc: QueryDocumentSnapshot<DocumentData> | null;
    hasMore: boolean;
}

export interface CommunityAnswer {
    id: string;
    category: string;
    questionId: string;
    userId: string;
    userName: string;
    answer: string;
    status: string;
    likes: number;
}

export async function getQuestions(
    category: string
): Promise<Question[]> {
    const key = category.toLowerCase();

    if (questionCache.has(key)) {
        return questionCache.get(key)!;
    }
    const q = query(
        collection(
            db,
            "orals",
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
            question: data.question,
            answer: data.answer,
            topic: data.topic,
            mmd: data.mmd,
            surveyor: data.surveyor,

            class: data.class ?? "",

            examDate: data.examDate ?? "",

            order: data.order,
            isActive: data.isActive,
        };
    });

    questionCache.set(key, result);

    return result;
}

export async function getQuestionsPaginated(
    category: string,
    lastDoc: QueryDocumentSnapshot<DocumentData> | null = null,
    pageSize = 20
): Promise<PaginatedQuestions> {

    let q;

    if (lastDoc) {
        q = query(
            collection(
                db,
                "orals",
                category.toLowerCase(),
                "questions"
            ),
            orderBy("order"),
            startAfter(lastDoc),
            limit(pageSize)
        );
    } else {
        q = query(
            collection(
                db,
                "orals",
                category.toLowerCase(),
                "questions"
            ),
            orderBy("order"),
            limit(pageSize)
        );
    }

    const snapshot = await getDocs(q);

    const questions = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
            id: doc.id,
            question: data.question,
            answer: data.answer,
            topic: data.topic,
            mmd: data.mmd,
            surveyor: data.surveyor,
            class: data.class ?? "",
            examDate: data.examDate ?? "",
            order: data.order,
            isActive: data.isActive,
        };
    });

    return {
        questions,
        lastDoc:
            snapshot.docs.length > 0
                ? snapshot.docs[snapshot.docs.length - 1]
                : null,
        hasMore: snapshot.docs.length === pageSize,
    };
}

export async function submitCommunityAnswer(data: {
    category: string;
    questionId: string;
    userId: string;
    userName: string;
    answer: string;
}) {
    await addDoc(collection(db, "communityAnswers"), {
        ...data,
        status: "pending",
        likes: 0,
        createdAt: serverTimestamp(),
    });
}

export async function getApprovedAnswers(
    category: string,
    questionId: string
): Promise<CommunityAnswer[]> {
    const q = query(
        collection(db, "communityAnswers"),
        where("category", "==", category),
        where("questionId", "==", questionId),
        where("status", "==", "approved")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<CommunityAnswer, "id">),
    }));
}

export async function getPendingAnswers(): Promise<
    CommunityAnswer[]
> {
    const q = query(
        collection(db, "communityAnswers"),
        where("status", "==", "pending")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<CommunityAnswer, "id">),
    }));
}

export async function approveAnswer(id: string) {
    await updateDoc(doc(db, "communityAnswers", id), {
        status: "approved",
    });
}

export async function rejectAnswer(id: string) {
    await deleteDoc(doc(db, "communityAnswers", id));
}

async function deleteExistingOralQuestions(category: string) {

    const questionsRef = collection(
        db,
        "orals",
        category.toLowerCase(),
        "questions"
    );


    const snapshot = await getDocs(
        questionsRef
    );


    if (snapshot.empty) {
        console.log(
            `No existing questions in ${category}`
        );
        return;
    }


    const docs = snapshot.docs;


    const CHUNK_SIZE = 500;


    for (
        let i = 0;
        i < docs.length;
        i += CHUNK_SIZE
    ) {


        const batch = writeBatch(db);


        docs
            .slice(i, i + CHUNK_SIZE)
            .forEach((docSnap) => {

                batch.delete(
                    docSnap.ref
                );

            });


        await batch.commit();


        console.log(
            `Deleted ${Math.min(
                i + CHUNK_SIZE,
                docs.length
            )} / ${docs.length} from ${category}`
        );

    }

}

export async function getOralQuestionCount(
    category: string
) {
    const snapshot = await getDocs(
        collection(
            db,
            "orals",
            category.toLowerCase(),
            "questions"
        )
    );

    return snapshot.size;
}

export async function getAllOralQuestionCounts() {

    const categories = [
        "FN3",
        "FN4B",
        "FN5",
        "FN6",
    ];

    const counts: Record<string, number> = {};

    for (const category of categories) {

        counts[category] =
            await getOralQuestionCount(category);

    }

    return counts;
}

export interface OralCategoryMeta {
    questionCount: number;
    topicCount: number;
}

export async function getOralCategoryMeta(
    category: string
): Promise<OralCategoryMeta> {
    const snapshot = await getDoc(
        doc(
            db,
            "orals",
            category.toLowerCase()
        )
    );

    if (!snapshot.exists()) {
        return {
            questionCount: 0,
            topicCount: 0,
        };
    }

    const data = snapshot.data();

    return {
        questionCount: data.questionCount ?? 0,
        topicCount: data.topicCount ?? 0,
    };
}

export async function getOralQuestionsForExport(
    category: string
) {

    const snapshot = await getDocs(
        query(
            collection(
                db,
                "orals",
                category.toLowerCase(),
                "questions"
            ),
            orderBy("order")
        )
    );

    return snapshot.docs.map((doc) => {

        const data = doc.data();

        return {
            Category: category.toUpperCase(),
            Class: data.class ?? "",
            Date: data.examDate ?? "",
            MMD: data.mmd ?? "",
            Surveyor: data.surveyor ?? "",
            Topic: data.topic ?? "",
            Question: data.question ?? "",
            Answer: data.answer ?? "",
        };

    });

}

/* ===========================
   BULK EXCEL UPLOAD
=========================== */
export async function bulkUploadQuestions(
    rows: any[],
    onProgress?: (uploaded: number, total: number) => void
) {

    if (uploadRunning) {
        throw new Error("Upload already running");
    }

    uploadRunning = true;

    try {

        const orderCounter: Record<string, number> = {};
        const topicCounter: Record<string, Set<string>> = {};

        const categories = new Set<string>();

        const uploadData: {
            category: string;
            data: any;
        }[] = [];


        for (const [index, rawRow] of rows.entries()) {

            const row: Record<string, any> = {};

            Object.keys(rawRow).forEach((key) => {
                row[key.trim()] = rawRow[key];
            });


            let category = String(row.Category ?? "")
                .trim()
                .toLowerCase();


            const categoryMap: Record<string, string> = {
                safety: "fn3",
                fn3: "fn3",

                motor: "fn4b",
                fn4b: "fn4b",

                electrical: "fn5",
                fn5: "fn5",

                mep: "fn6",
                fn6: "fn6",
            };


            category = categoryMap[category] ?? category;


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


            topicCounter[category].add(
                String(row.Topic ?? "").trim()
            );


            uploadData.push({

                category,

                data: {

                    question:
                        String(row.Question ?? "").trim(),

                    answer:
                        String(row.Answer ?? "").trim(),

                    topic:
                        String(row.Topic ?? "").trim(),

                    mmd:
                        String(row.MMD ?? "").trim(),

                    surveyor:
                        String(row.Surveyor ?? "").trim(),

                    class:
                        String(row.Class ?? "").trim(),

                    examDate:
                        String(row.Date ?? "").trim(),


                    order:
                        orderCounter[category]++,


                    isActive: true,


                    createdAt:
                        serverTimestamp(),


                    updatedAt:
                        serverTimestamp(),

                },

            });

        }


        console.log("Deleting existing questions...");


        for (const category of categories) {

            await deleteExistingOralQuestions(category);

        }


        console.log("Uploading new questions...");


        const CHUNK_SIZE = 500;


        for (
            let i = 0;
            i < uploadData.length;
            i += CHUNK_SIZE
        ) {


            const batch = writeBatch(db);


            uploadData
                .slice(i, i + CHUNK_SIZE)
                .forEach((item) => {


                    const ref = doc(
                        collection(
                            db,
                            "orals",
                            item.category,
                            "questions"
                        )
                    );


                    batch.set(
                        ref,
                        item.data
                    );


                });


            await batch.commit();



            const uploaded = Math.min(
                i + CHUNK_SIZE,
                uploadData.length
            );


            onProgress?.(
                uploaded,
                uploadData.length
            );


            console.log(
                `Uploaded ${uploaded} / ${uploadData.length}`
            );

        }



        console.log("Updating metadata...");


        for (
            const category of Object.keys(orderCounter)
        ) {


            await setDoc(

                doc(
                    db,
                    "orals",
                    category
                ),

                {

                    questionCount:
                        orderCounter[category] - 1,


                    topicCount:
                        topicCounter[category].size,


                    updatedAt:
                        serverTimestamp(),

                },

                {
                    merge: true,
                }

            );


            clearQuestionCache(category);

        }


        console.log("Upload complete.");


    } finally {

        uploadRunning = false;

    }

}


export async function updateQuestion(
    category: string,
    id: string,
    data: {
        question: string;
        answer: string;
    }
) {

    await updateDoc(
        doc(
            db,
            "orals",
            category.toLowerCase(),
            "questions",
            id
        ),
        {
            question: data.question,
            answer: data.answer,
            updatedAt: serverTimestamp(),
        }
    );

    clearQuestionCache(category);
}

export async function deleteQuestion(
    category: string,
    id: string
) {
    await deleteDoc(
        doc(
            db,
            "orals",
            category.toLowerCase(),
            "questions",
            id
        )
    );

    clearQuestionCache(category);
}

export async function updateQuestionTopic(
    category: string,
    id: string,
    topic: string
) {
    await updateDoc(
        doc(
            db,
            "orals",
            category.toLowerCase(),
            "questions",
            id
        ),
        {
            topic,
            updatedAt: serverTimestamp(),
        }
    );

    clearQuestionCache(category);
}
export async function moveQuestionsBatch(
    questions: any[],
    fromCategory: string,
    toCategory: string
) {
    const batch = writeBatch(db);

    questions.forEach((question) => {

        const newRef = doc(
            collection(
                db,
                "orals",
                toCategory.toLowerCase(),
                "questions"
            )
        );

        const { id, ...data } = question;

        batch.set(newRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });

        batch.delete(
            doc(
                db,
                "orals",
                fromCategory.toLowerCase(),
                "questions",
                question.id
            )
        );
    });

    await batch.commit();

    clearQuestionCache(fromCategory);
    clearQuestionCache(toCategory);
}

export async function deleteQuestionsBatch(
    category: string,
    ids: string[]
) {
    const batch = writeBatch(db);

    ids.forEach((id) => {
        batch.delete(
            doc(
                db,
                "orals",
                category.toLowerCase(),
                "questions",
                id
            )
        );
    });

    await batch.commit();

    clearQuestionCache(category);
}

export interface OrderPaginationResult {
    questions: Question[];
    lastOrder: number | null;
    hasMore: boolean;
}

export async function getQuestionsByOrder(
    category: string,
    lastOrder = 0,
    pageSize = 20
): Promise<OrderPaginationResult> {

    const q = query(
        collection(
            db,
            "orals",
            category.toLowerCase(),
            "questions"
        ),
        where("order", ">", lastOrder),
        orderBy("order"),
        limit(pageSize)
    );

    const snapshot = await getDocs(q);

    const questions = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
            id: doc.id,
            question: data.question,
            answer: data.answer,
            topic: data.topic,
            mmd: data.mmd,
            surveyor: data.surveyor,
            class: data.class ?? "",
            examDate: data.examDate ?? "",
            order: data.order,
            isActive: data.isActive,
        };
    });

    return {
        questions,
        lastOrder:
            questions.length > 0
                ? questions[questions.length - 1].order
                : null,
        hasMore: questions.length === pageSize,
    };
}

