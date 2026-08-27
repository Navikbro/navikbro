import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
    increment,
    arrayUnion,
} from "firebase/firestore";

import {
    incrementTotalUsers,
} from "@/services/admin/adminService";

import { db } from "@/lib/firebase/firebase";

import {
    AppUser,
} from "@/types/user";


interface FirebaseUserData {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
}


/* =========================================================
   CREATE USER PROFILE
   ========================================================= */

/**
 * Create user profile after first login.
 *
 * If the user already exists, return the existing profile.
 *
 * IMPORTANT:
 * The users/{uid} document is the single source of truth.
 *
 * There is NO admin user cache update here.
 */

export async function createUserProfile(
    firebaseUser: FirebaseUserData
) {

    const userRef = doc(
        db,
        "users",
        firebaseUser.uid
    );


    const snapshot =
        await getDoc(userRef);


    /* =====================================================
       EXISTING USER
       ===================================================== */

    if (snapshot.exists()) {

        const existingUser =
            snapshot.data();


        await updateDoc(
            userRef,
            {

                uid:
                    firebaseUser.uid,

                updatedAt:
                    serverTimestamp(),

                role:
                    existingUser.role === "admin"
                        ? "admin"
                        : "student",

                isBlocked:
                    existingUser.isBlocked ?? false,

                subscription: {

                    plan: "free",

                    status: "inactive",

                    trialStartDate: null,

                    trialEndDate: null,

                    startDate: null,

                    endDate: null,

                    paymentId: null,

                    autoRenew: false,

                    amount: 149,

                    lockedPrice: 149,

                    currency: "INR",

                    ...(typeof existingUser.subscription === "object"
                        ? existingUser.subscription
                        : {}),

                },

                "stats.loginCount":
                    existingUser.stats?.loginCount ?? 0,

                "stats.lastLogin":
                    serverTimestamp(),

            }
        );


        return {
            ...existingUser,
        };

    }


    /* =====================================================
       NEW USER
       ===================================================== */

    const newUser = {

        uid:
            firebaseUser.uid,

        name:
            firebaseUser.displayName ||
            "Anonymous",

        email:
            firebaseUser.email ||
            "",

        photoURL:
            firebaseUser.photoURL ||
            null,

        role:
            "student",

        createdAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp(),

        isBlocked:
            false,

        subscription: {

            plan: "free",

            status: "inactive",

            trialStartDate: null,

            trialEndDate: null,

            startDate: null,

            endDate: null,

            paymentId: null,

            autoRenew: false,

            amount: 149,

            lockedPrice: 149,

            currency: "INR",

        },

        stats: {

            loginCount: 1,

            lastLogin:
                serverTimestamp(),

        },

    };


    await setDoc(
        userRef,
        newUser
    );


    /*
     * Keep the dashboard counter.
     *
     * This is NOT used by the Admin Users table.
     * The Admin Users table now gets its actual count
     * directly from users/.
     */

    await incrementTotalUsers();


    return newUser;
}


/* =========================================================
   UPDATE USER LOGIN
   ========================================================= */

/**
 * Update user login activity.
 * Called every successful login.
 */

export async function updateUserLogin(
    uid: string
) {

    const userRef =
        doc(
            db,
            "users",
            uid
        );


    await updateDoc(
        userRef,
        {

            updatedAt:
                serverTimestamp(),

            "stats.loginCount":
                increment(1),

            "stats.lastLogin":
                serverTimestamp(),

        }
    );

}


/* =========================================================
   UPDATE USER PRESENCE
   ========================================================= */

/**
 * Update user's online presence.
 *
 * This is NOT a login event.
 * It is updated periodically while the user
 * is actively using NAVIK.
 */

export async function updateUserPresence(
    uid: string
) {

    const userRef =
        doc(
            db,
            "users",
            uid
        );


    await updateDoc(
        userRef,
        {

            "stats.lastSeen":
                serverTimestamp(),

        }
    );

}


/* =========================================================
   GET USER PROFILE
   ========================================================= */

/**
 * Get complete user profile.
 */

export async function getUserProfile(
    uid: string
) {

    const userRef =
        doc(
            db,
            "users",
            uid
        );


    const snapshot =
        await getDoc(userRef);


    if (!snapshot.exists()) {
        return null;
    }


    return snapshot.data() as AppUser;

}


/* =========================================================
   BLOCK USER
   ========================================================= */

/**
 * Block user from accessing the app.
 */

export async function blockUser(
    uid: string
) {

    const userRef =
        doc(
            db,
            "users",
            uid
        );


    await updateDoc(
        userRef,
        {

            isBlocked:
                true,

            updatedAt:
                serverTimestamp(),

        }
    );

}


/* =========================================================
   UNBLOCK USER
   ========================================================= */

/**
 * Restore blocked user.
 */

export async function unblockUser(
    uid: string
) {

    const userRef =
        doc(
            db,
            "users",
            uid
        );


    await updateDoc(
        userRef,
        {

            isBlocked:
                false,

            updatedAt:
                serverTimestamp(),

        }
    );

}


/* =========================================================
   UPDATE USER SUBSCRIPTION
   ========================================================= */

/**
 * Update user's subscription.
 *
 * The real users/{uid} document is updated directly.
 */

export async function updateUserSubscription(
    uid: string,
    subscription: Partial<AppUser["subscription"]>
) {

    const userRef =
        doc(
            db,
            "users",
            uid
        );


    const snapshot =
        await getDoc(userRef);


    const existing =
        snapshot.data()?.subscription ?? {};


    await updateDoc(
        userRef,
        {

            subscription: {

                ...existing,

                ...subscription,

            },

            updatedAt:
                serverTimestamp(),

        }
    );

}


/* =========================================================
   SAVE FCM TOKEN
   ========================================================= */

/**
 * Save Firebase Cloud Messaging token.
 */

export async function saveFCMToken(
    uid: string,
    token: string
) {

    const userRef =
        doc(
            db,
            "users",
            uid
        );


    await updateDoc(
        userRef,
        {

            fcmTokens:
                arrayUnion(token),

            updatedAt:
                serverTimestamp(),

        }
    );

}


/* =========================================================
   INITIALIZE USER
   ========================================================= */

/**
 * Initialize the authenticated Firebase user.
 *
 * This is the main function used after authentication.
 *
 * IMPORTANT:
 * There is deliberately NO adminCache operation here.
 *
 * The users/{uid} document is the source of truth.
 */

export async function initializeUser(
    firebaseUser: FirebaseUserData
) {

    const userRef =
        doc(
            db,
            "users",
            firebaseUser.uid
        );


    /*
     * ONE AND ONLY READ
     */

    const snapshot =
        await getDoc(userRef);


    /* =====================================================
       EXISTING USER
       ===================================================== */

    if (snapshot.exists()) {

        const existingUser =
            snapshot.data();


        await updateDoc(
            userRef,
            {

                updatedAt:
                    serverTimestamp(),

                role:
                    existingUser.role === "admin"
                        ? "admin"
                        : "student",

                isBlocked:
                    existingUser.isBlocked ?? false,

                subscription: {

                    plan: "free",

                    status: "inactive",

                    trialStartDate: null,

                    trialEndDate: null,

                    startDate: null,

                    endDate: null,

                    paymentId: null,

                    autoRenew: false,

                    amount: 149,

                    lockedPrice: 149,

                    currency: "INR",

                    ...(typeof existingUser.subscription === "object"
                        ? existingUser.subscription
                        : {}),

                },

                "stats.loginCount":
                    increment(1),

                "stats.lastLogin":
                    serverTimestamp(),

            }
        );


        return {

            uid:
                firebaseUser.uid,

            name:
                existingUser.name ??
                firebaseUser.displayName ??
                "Anonymous",

            email:
                existingUser.email ??
                firebaseUser.email ??
                "",

            photoURL:
                existingUser.photoURL ??
                firebaseUser.photoURL ??
                null,

            role:
                existingUser.role === "admin"
                    ? "admin"
                    : "student",

            isBlocked:
                existingUser.isBlocked ??
                false,

            subscription:
                typeof existingUser.subscription === "object"
                    ? existingUser.subscription
                    : {

                        plan: "free",

                        status: "inactive",

                        trialStartDate: null,

                        trialEndDate: null,

                        startDate: null,

                        endDate: null,

                        paymentId: null,

                        autoRenew: false,

                        amount: 149,

                        lockedPrice: 149,

                    },

        };

    }


    /* =====================================================
       NEW USER
       ===================================================== */

    const newUser = {

        uid:
            firebaseUser.uid,

        name:
            firebaseUser.displayName ||
            "Anonymous",

        email:
            firebaseUser.email ||
            "",

        photoURL:
            firebaseUser.photoURL ||
            null,

        role:
            "student",

        createdAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp(),

        isBlocked:
            false,

        subscription: {

            plan: "free",

            status: "inactive",

            trialStartDate: null,

            trialEndDate: null,

            startDate: null,

            endDate: null,

            paymentId: null,

            autoRenew: false,

            amount: 149,

            lockedPrice: 149,

        },

        stats: {

            loginCount: 1,

            lastLogin:
                serverTimestamp(),

        },

    };


    /*
     * Create the real user document.
     */

    await setDoc(
        userRef,
        newUser
    );


    /*
     * Update dashboard statistics.
     *
     * This is independent from the Admin Users list.
     */

    await incrementTotalUsers();


    /*
     * DO NOT call:
     *
     * addUserToAdminCache()
     *
     * The Admin Users page now reads directly
     * from users/{uid}.
     */


    return newUser;
}