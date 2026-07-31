import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function GET() {
    try {
        await adminAuth.getUser("dummy");

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                error: String(error),
            },
            {
                status: 500,
            }
        );
    }
}