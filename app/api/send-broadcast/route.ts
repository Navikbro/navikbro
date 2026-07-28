import { NextRequest, NextResponse } from "next/server";
import { sendNotification } from "@/services/notificationService";
import { verifyAdmin } from "@/lib/verifyAdmin";

export async function POST(
    request: NextRequest
) {

    await verifyAdmin(request);
    
    try {

        const {
            title,
            body,
            batch,
        } = await request.json();

        const result =
            await sendNotification({
                title,
                body,
                batch,
            });

        return NextResponse.json(result);

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                error: "Notification failed",
            },
            {
                status: 500,
            }
        );
    }
}