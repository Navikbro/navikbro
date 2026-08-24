import { adminDb, adminMessaging } from "@/lib/firebase/firebase-admin";

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

    const usersQuery =
        batch === "all"
            ? adminDb.collection("users")
            : adminDb
                .collection("users")
                .where("batch", "==", batch);

    const snapshot = await usersQuery.get();

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