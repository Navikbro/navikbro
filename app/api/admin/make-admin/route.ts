import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/firebase-admin";

export async function POST(req: Request) {
    try {
        // Get authorization token
        const authHeader =
            req.headers.get("authorization");

        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json(
                {
                    error: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const token =
            authHeader.split("Bearer ")[1];


        // Verify Firebase ID token
        const decodedToken =
            await adminAuth.verifyIdToken(token);


        // Check admin claim
        if (decodedToken.admin !== true) {
            return NextResponse.json(
                {
                    error: "Admin access required",
                },
                {
                    status: 403,
                }
            );
        }


        const { uid } = await req.json();


        if (!uid) {
            return NextResponse.json(
                {
                    error: "UID required",
                },
                {
                    status: 400,
                }
            );
        }


        // Create admin claim
        await adminAuth.setCustomUserClaims(uid, {
            admin: true,
        });


        return NextResponse.json({
            success: true,
            message: "User is now admin",
        });


    } catch (error) {

        console.error(
            "MAKE ADMIN ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error",
            },
            {
                status: 500,
            }
        );
    }
}