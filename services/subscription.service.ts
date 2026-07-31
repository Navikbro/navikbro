import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";

import type {
    AppUser,
    UserSubscription,
} from "@/types/user";

import { db } from "@/lib/firebase";

import {
    isTrialExpired,
    isSubscriptionExpired,
} from "@/lib/subscription";

import { Timestamp } from "firebase/firestore";

export async function startTrial(uid: string) {
    const now = new Date();

    const end = new Date(now);
    end.setHours(end.getHours() + 24);

    await updateSubscription(uid, {
        plan: "trial",
        status: "trial",
        trialStartDate: Timestamp.fromDate(now),
        trialEndDate: Timestamp.fromDate(end),
    });
}


export async function getUserSubscription(
    uid: string
): Promise<UserSubscription | null> {

    const userRef =
        doc(
            db,
            "users",
            uid
        );


    const snapshot =
        await getDoc(userRef);


    if (!snapshot.exists()) {
        return null;
    }


    const user =
        snapshot.data() as AppUser;


    return user.subscription;

}

export async function updateSubscription(
    uid: string,
    data: Partial<AppUser["subscription"]>
) {

    const userRef =
        doc(
            db,
            "users",
            uid
        );


    const snapshot =
        await getDoc(userRef);


    if (!snapshot.exists()) {
        return;
    }


    const user =
        snapshot.data() as AppUser;


    await updateDoc(
        userRef,
        {
            subscription: {
                ...user.subscription,
                ...data,
            },

            updatedAt:
                serverTimestamp(),
        }
    );

}

export async function hasActiveSubscription(
    uid: string
) {

    const subscription =
        await getUserSubscription(uid);


    if (!subscription) {
        return false;
    }


    return (
        (
            subscription.status === "active" ||
            subscription.status === "trial"
        )
        &&
        !isTrialExpired(subscription)
        &&
        !isSubscriptionExpired(subscription)
    );

}