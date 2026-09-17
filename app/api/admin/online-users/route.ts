import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";

import { verifyAdmin } from "@/lib/authentication/verifyAdmin";
import { adminDb } from "@/lib/firebase/firebase-admin";

const ONLINE_WINDOW_MS = 2 * 60 * 1000;

export async function GET(request: NextRequest) {
    try {
        await verifyAdmin(request);

        const cutoff = Timestamp.fromMillis(
            Date.now() - ONLINE_WINDOW_MS
        );

        const snapshot = await adminDb
            .collection("users")
            .where("stats.lastSeen", ">=", cutoff)
            .get();

        const onlineUserIds = snapshot.docs.map((doc) => doc.id);

        const onlineUsers = onlineUserIds.length;

        return NextResponse.json({
            success: true,
            onlineUsers,
            onlineUserIds,
        });
    } catch (error) {
        console.error(
            "[Online Users] Failed:",
            error
        );

        const message =
            error instanceof Error
                ? error.message
                : "Failed to load online users.";

        const status =
            message === "Unauthorized"
                ? 401
                : message === "Forbidden"
                    ? 403
                    : 500;

        return NextResponse.json(
            {
                success: false,
                error: message,
                onlineUsers: 0,
                onlineUserIds: [],
            },
            { status }
        );
    }
}