import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
    CachedUser,
} from "@/types/admin";

const PAGE_SIZE = 100;

export async function addUserToAdminCache(
    user: CachedUser
) {

    const pageRef = doc(
        db,
        "adminCache",
        "users",
        "pages",
        "page_1"
    );

    const snapshot = await getDoc(pageRef);

    if (!snapshot.exists()) {

        await setDoc(
            pageRef,
            {
                pageNumber: 1,
                totalUsers: 1,
                users: [user],
                updatedAt: serverTimestamp(),
            }
        );

        return;
    }

    const data = snapshot.data();

    const existingUsers: CachedUser[] =
        data.users ?? [];

    // Prevent duplicate users
    const alreadyExists = existingUsers.some(
        (cachedUser) => cachedUser.uid === user.uid
    );

    if (alreadyExists) {
        return;
    }

    // Page full (pagination will be implemented later)
    if (existingUsers.length >= PAGE_SIZE) {

        console.warn(
            "Admin cache page_1 is full. Pagination not implemented yet."
        );

        return;
    }

    const updatedUsers = [
        ...existingUsers,
        user,
    ];

    await setDoc(
        pageRef,
        {
            pageNumber: 1,
            totalUsers: updatedUsers.length,
            users: updatedUsers,
            updatedAt: serverTimestamp(),
        },
        {
            merge: true,
        }
    );
}

export async function getAdminUserPage(
    pageNumber: number
) {

    const pageRef = doc(
        db,
        "adminCache",
        "users",
        "pages",
        `page_${pageNumber}`
    );

    const snapshot = await getDoc(pageRef);

    if (!snapshot.exists()) {
        return null;
    }

    return snapshot.data() as {
        pageNumber: number;
        totalUsers: number;
        users: CachedUser[];
    };

}

export async function toggleCachedUserBlock(
    uid: string,
    isBlocked: boolean
) {

    await updateUserInPage(
        1,
        (users) =>
            users.map((user) =>
                user.uid === uid
                    ? {
                        ...user,
                        isBlocked,
                    }
                    : user
            )
    );
}

export async function updateCachedSubscription(
    uid: string,
    plan: string,
    status: string,
    endDate: Timestamp | null
) {

    await updateUserInPage(
        1,
        (users) =>
            users.map((user) =>
                user.uid === uid
                    ? {
                        ...user,
                        plan,
                        status,
                        endDate,
                    }
                    : user
            )
    );
}

export async function removeCachedUser(
    uid: string
) {

    await updateUserInPage(
        1,
        (users) =>
            users.filter(
                (user) => user.uid !== uid
            )
    );
}

async function updateUserInPage(
    pageNumber: number,
    updater: (users: CachedUser[]) => CachedUser[]
) {

    const pageRef = doc(
        db,
        "adminCache",
        "users",
        "pages",
        `page_${pageNumber}`
    );

    const snapshot = await getDoc(pageRef);

    if (!snapshot.exists()) {
        return;
    }

    const data = snapshot.data() as {
        users: CachedUser[];
    };

    const users: CachedUser[] =
        data.users ?? [];


    const updatedUsers =
        updater(users);

    await setDoc(
        pageRef,
        {
            users: updatedUsers,
            totalUsers: updatedUsers.length,
            updatedAt: serverTimestamp(),
        },
        {
            merge: true,
        }
    );
}