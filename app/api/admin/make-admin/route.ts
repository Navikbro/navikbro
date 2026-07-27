import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: Request) {
    try {
        const { uid } = await req.json();

        await adminAuth.setCustomUserClaims(uid, {
            admin: true,
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error("MAKE ADMIN ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error
                    ? error.message
                    : String(error),
            },
            {
                status: 500,
            }
        );
    }
}