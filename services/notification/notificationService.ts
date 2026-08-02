import {
    collection,
    getDocs,
    query,
    where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase";
import { adminMessaging } from "@/lib/firebase/firebase-admin";

interface SendNotificationParams {
    title: string;
    body: string;
    batch: string;
}

export async function sendNotification({
    title,
    body,
    batch,
}: SendNotificationParams) {

    let usersQuery;

    if (batch === "all") {
        usersQuery = collection(db, "users");
    } else {
        usersQuery = query(
            collection(db, "users"),
            where("batch", "==", batch)
        );
    }

    const snapshot = await getDocs(usersQuery);

    const tokens: string[] = [];

    snapshot.forEach((doc) => {
        const data = doc.data();

        if (Array.isArray(data.fcmTokens)) {
            tokens.push(...data.fcmTokens);
        }
    });

    if (tokens.length === 0) {
        return {
            success: false,
            message: "No FCM tokens found",
        };
    }

    const result =
        await adminMessaging.sendEachForMulticast({
            tokens,
            notification: {
                title,
                body,
            },
        });

    return {
        success: true,
        totalUsers: tokens.length,
        sent: result.successCount,
        failed: result.failureCount,
    };
}