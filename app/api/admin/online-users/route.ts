import { NextRequest, NextResponse } from "next/server";

import { verifyAdmin } from "@/lib/authentication/verifyAdmin";
import { adminDb } from "@/lib/firebase/firebase-admin";

const ONLINE_WINDOW_MS = 2 * 60 * 1000;

export async function GET(request: NextRequest) {
    try {
        await verifyAdmin(request);

        const cutoff = Date.now() - ONLINE_WINDOW_MS;

        const snapshot = await adminDb
            .collection("users")
            .get();

        let onlineUsers = 0;

        snapshot.forEach((doc) => {
            const data = doc.data();

            const lastSeen = data.stats?.lastSeen;

            if (!lastSeen) {
                return;
            }

            const lastSeenMillis =
                typeof lastSeen.toMillis === "function"
                    ? lastSeen.toMillis()
                    : new Date(lastSeen).getTime();

            if (lastSeenMillis >= cutoff) {
                onlineUsers++;
            }
        });

        return NextResponse.json({
            success: true,
            onlineUsers,
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
            },
            { status }
        );
    }
}