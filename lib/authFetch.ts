"use client";

import { auth } from "@/lib/firebase";

export async function authFetch(
    input: RequestInfo | URL,
    init?: RequestInit
) {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("User not logged in.");
    }

    const token = await user.getIdToken();

    return fetch(input, {
        ...init,
        headers: {
            ...(init?.headers ?? {}),
            Authorization: `Bearer ${token}`,
        },
    });
}