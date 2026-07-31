import { NextResponse } from "next/server";

export async function GET() {
    try {
        return NextResponse.json({
            projectId: process.env.FIREBASE_PROJECT_ID,
            hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
            hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: String(error),
            },
            {
                status: 500,
            }
        );
    }
}