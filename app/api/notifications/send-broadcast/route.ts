import { NextRequest, NextResponse } from "next/server";
import { sendNotification } from "@/services/notification/notificationService";
import { verifyAdmin } from "@/lib/authentication/verifyAdmin";

export async function POST(request: NextRequest) {
    try {
        await verifyAdmin(request);

        const {
            title,
            body,
            batch,
        } = await request.json();

        const result = await sendNotification({
            title,
            body,
            batch,
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("Send notification error:", error);

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Notification failed",
            },
            {
                status: 500,
            }
        );
    }
}