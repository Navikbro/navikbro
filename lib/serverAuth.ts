import { NextRequest } from "next/server";

import { adminAuth } from "@/lib/firebase-admin";

export async function getAuthenticatedUser(
    request: NextRequest
) {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
        throw new Error("Unauthorized");
    }

    const idToken = authHeader.replace("Bearer ", "");

    const decodedToken =
        await adminAuth.verifyIdToken(idToken);

    return decodedToken;
}