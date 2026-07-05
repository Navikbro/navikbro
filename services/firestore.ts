import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export interface Question {
    id: string;
    question: string;
    answer: string;
    mmd: string;
    surveyor: string;
    topic: string;
    order: number;
    isActive: boolean;
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

    return snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
            id: doc.id,
            question: data.question ?? "",
            answer: data.answer ?? "",
            mmd: data.mmd ?? "",
            surveyor: data.surveyor ?? "",
            topic: data.topic ?? "",
            order: data.order ?? 0,
            isActive: data.isActive ?? true,
        };
    });
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

/* ===========================
   BULK EXCEL UPLOAD
=========================== */

export async function bulkUploadQuestions(rows: any[]) {
    const batch = writeBatch(db);

    const orderCounter: Record<string, number> = {};

    rows.forEach((rawRow, index) => {
        // Remove hidden spaces from Excel column names
        const row: Record<string, any> = {};

        Object.keys(rawRow).forEach((key) => {
            row[key.trim()] = rawRow[key];
        });

        console.log("Uploading Row", index + 1, row);

        const category = String(row.Category ?? "")
            .trim()
            .toLowerCase();

        if (!category) {
            throw new Error(
                `Row ${index + 1}: Category is missing.`
            );
        }

        if (!orderCounter[category]) {
            orderCounter[category] = 1;
        }

        const ref = doc(
            collection(db, "orals", category, "questions")
        );

        batch.set(ref, {
            question: String(row.Question ?? "").trim(),
            answer: String(row.Answer ?? "").trim(),
            topic: String(row.Topic ?? "").trim(),
            mmd: String(row.MMD ?? "").trim(),
            surveyor: String(row.Surveyor ?? "").trim(),

            order: orderCounter[category]++,

            isActive: true,

            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    });

    await batch.commit();
}