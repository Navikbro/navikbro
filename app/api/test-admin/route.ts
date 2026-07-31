import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function GET() {
    try {
        const result = await adminAuth.listUsers(1);

        return NextResponse.json({
            success: true,
            users: result.users.length,
        });
    } catch (error) {
        console.error("TEST ADMIN ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            },
            {
                status: 500,
            }
        );
    }
}