import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase";

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




