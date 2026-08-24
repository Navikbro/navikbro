import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import {
    adminAuth,
    adminDb,
} from "@/lib/firebase/firebase-admin";


// =========================================================
// POST /api/user/initialize
// =========================================================

export async function POST(
    request: NextRequest
) {
    try {

        // -----------------------------------------------------
        // AUTHENTICATE USER
        // -----------------------------------------------------

        const authorization =
            request.headers.get("authorization");

        if (
            !authorization ||
            !authorization.startsWith("Bearer ")
        ) {
            return NextResponse.json(
                {
                    error: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const idToken =
            authorization.substring(7);

        const decodedToken =
            await adminAuth.verifyIdToken(idToken);

        const uid =
            decodedToken.uid;


        // -----------------------------------------------------
        // READ SAFE USER INFORMATION
        // -----------------------------------------------------

        const body =
            await request.json().catch(
                () => ({})
            );

        const displayName =
            typeof body.displayName === "string"
                ? body.displayName.trim()
                : "";

        const email =
            typeof body.email === "string"
                ? body.email.trim()
                : "";

        const photoURL =
            typeof body.photoURL === "string"
                ? body.photoURL.trim()
                : null;


        // -----------------------------------------------------
        // USER DOCUMENT
        // -----------------------------------------------------

        const userRef =
            adminDb
                .collection("users")
                .doc(uid);

        const snapshot =
            await userRef.get();


        // =====================================================
        // EXISTING USER
        // =====================================================

        if (snapshot.exists) {

            const existingData =
                snapshot.data() ?? {};

            const existingStats =
                existingData.stats ?? {};

            await userRef.update({

                updatedAt:
                    FieldValue.serverTimestamp(),

                "stats.loginCount":
                    Number(
                        existingStats.loginCount ?? 0
                    ) + 1,

                "stats.lastLogin":
                    FieldValue.serverTimestamp(),

            });


            const updatedSnapshot =
                await userRef.get();

            return NextResponse.json({
                success: true,
                created: false,
                profile:
                    updatedSnapshot.data(),
            });
        }


        // =====================================================
        // NEW USER
        // =====================================================

        const newUser = {

            uid,

            name:
                displayName ||
                "Anonymous",

            email,

            photoURL,

            role:
                "student",

            createdAt:
                FieldValue.serverTimestamp(),

            updatedAt:
                FieldValue.serverTimestamp(),

            isBlocked:
                false,

            subscription: {

                plan:
                    "free",

                status:
                    "inactive",

                trialStartDate:
                    null,

                trialEndDate:
                    null,

                startDate:
                    null,

                endDate:
                    null,

                paymentId:
                    null,

                autoRenew:
                    false,

                amount:
                    149,

                lockedPrice:
                    149,

                currency:
                    "INR",

            },

            stats: {

                loginCount:
                    1,

                lastLogin:
                    FieldValue.serverTimestamp(),

            },

        };


        await userRef.set(newUser);


        return NextResponse.json({
            success: true,
            created: true,
            profile: newUser,
        });

    } catch (error) {

        console.error(
            "USER INITIALIZATION ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "User initialization failed",
            },
            {
                status: 500,
            }
        );
    }
}