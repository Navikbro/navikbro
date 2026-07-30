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
    addUserToAdminCache,
} from "@/services/adminUserService";

import {
    incrementTotalUsers,
} from "@/services/adminService";

import { db } from "@/lib/firebase";

import {
    AppUser,
} from "@/types/user";


interface FirebaseUserData {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
}


/**
 * Create user profile after first login
 * If user already exists, return existing profile
 */
export async function createUserProfile(
    firebaseUser: FirebaseUserData
) {

    const userRef = doc(
        db,
        "users",
        firebaseUser.uid
    );


    const snapshot = await getDoc(userRef);


    if (snapshot.exists()) {

        const existingUser = snapshot.data();


        await updateDoc(
            userRef,
            {

                uid: firebaseUser.uid,

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


    const newUser = {

        uid: firebaseUser.uid,

        name:
            firebaseUser.displayName ||
            "Anonymous",

        email:
            firebaseUser.email ||
            "",

        photoURL:
            firebaseUser.photoURL ||
            null,


        role: "student",


        createdAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp(),


        isBlocked: false,


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


    // Update admin dashboard counters
    await incrementTotalUsers();


    // Update admin user cache
    await addUserToAdminCache({

        uid: firebaseUser.uid,

        name:
            firebaseUser.displayName ||
            "Anonymous",

        email:
            firebaseUser.email ||
            "",

        photoURL:
            firebaseUser.photoURL ||
            null,

        plan: "free",

        status: "inactive",

        endDate: null,

        isBlocked: false,

    });


    return newUser;

}


/**
 * Update user login activity
 * Called every successful login
 */
export async function updateUserLogin(
    uid: string
) {

    const userRef = doc(
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


/**
 * Get complete user profile
 */
export async function getUserProfile(
    uid: string
) {

    const userRef = doc(
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


/**
 * Block user from accessing app
 */
export async function blockUser(
    uid: string
) {

    const userRef = doc(
        db,
        "users",
        uid
    );


    await updateDoc(
        userRef,
        {

            isBlocked: true,

            updatedAt:
                serverTimestamp(),

        }
    );

}


/**
 * Restore blocked user
 */
export async function unblockUser(
    uid: string
) {

    const userRef = doc(
        db,
        "users",
        uid
    );


    await updateDoc(
        userRef,
        {

            isBlocked: false,

            updatedAt:
                serverTimestamp(),

        }
    );

}

export async function updateUserSubscription(
    uid: string,
    subscription: Partial<AppUser["subscription"]>
) {
    const userRef = doc(db, "users", uid);

    // Read existing document
    const snapshot = await getDoc(userRef);

    // Get current subscription
    const existing =
        snapshot.data()?.subscription ?? {};

    // Merge and save
    await updateDoc(userRef, {
        subscription: {
            ...existing,
            ...subscription,
        },
        updatedAt: serverTimestamp(),
    });
}

/**
 * Save Firebase Cloud Messaging token
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

export async function initializeUser(
    firebaseUser: FirebaseUserData
) {

    const userRef = doc(
        db,
        "users",
        firebaseUser.uid
    );

    // ONE AND ONLY READ
    const snapshot = await getDoc(userRef);

    // ===========================
    // EXISTING USER
    // ===========================
    if (snapshot.exists()) {

        const existingUser = snapshot.data();

        await updateDoc(
            userRef,
            {
                updatedAt: serverTimestamp(),

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

                "stats.loginCount": increment(1),

                "stats.lastLogin": serverTimestamp(),
            }
        );

        return {
            uid: firebaseUser.uid,

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
                existingUser.isBlocked ?? false,

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

    // ===========================
    // NEW USER
    // ===========================

    const newUser = {
        uid: firebaseUser.uid,

        name:
            firebaseUser.displayName ||
            "Anonymous",

        email:
            firebaseUser.email || "",

        photoURL:
            firebaseUser.photoURL || null,

        role: "student",

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp(),

        isBlocked: false,

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
            lastLogin: serverTimestamp(),
        },
    };

    await setDoc(
        userRef,
        newUser
    );

    await incrementTotalUsers();

    await addUserToAdminCache({
        uid: firebaseUser.uid,
        name:
            firebaseUser.displayName ||
            "Anonymous",
        email:
            firebaseUser.email || "",
        photoURL:
            firebaseUser.photoURL || null,
        plan: "free",
        status: "inactive",
        endDate: null,
        isBlocked: false,
    });

    return newUser;
}