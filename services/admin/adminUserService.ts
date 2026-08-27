import {
    collection,
    doc,
    getCountFromServer,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
    Timestamp,
    updateDoc,
    type DocumentSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase";

import {
    CachedUser,
} from "@/types/admin";


const PAGE_SIZE = 50;

const USERS_COLLECTION = "users";


/* =========================================================
   USER → ADMIN USER FORMAT
   ========================================================= */

function mapUser(
    snapshot: DocumentSnapshot
): CachedUser {

    const data =
        snapshot.data() ?? {};


    const subscription =
        typeof data.subscription === "object" &&
        data.subscription !== null
            ? data.subscription
            : {};


    return {

        uid:
            snapshot.id,

        name:
            typeof data.name === "string"
                ? data.name
                : "Anonymous",

        email:
            typeof data.email === "string"
                ? data.email
                : "",

        photoURL:
            typeof data.photoURL === "string"
                ? data.photoURL
                : null,

        plan:
            typeof subscription.plan === "string"
                ? subscription.plan
                : "free",

        status:
            typeof subscription.status === "string"
                ? subscription.status
                : "inactive",

        endDate:
            subscription.endDate instanceof Timestamp
                ? subscription.endDate
                : null,

        isBlocked:
            data.isBlocked === true,

        stats: {

            lastSeen:
                data.stats?.lastSeen instanceof Timestamp
                    ? data.stats.lastSeen
                    : null,

        },

    };
}


/* =========================================================
   GET USERS PAGE
   ========================================================= */

/**
 * Reads users directly from:
 *
 * users/{uid}
 *
 * This is the single source of truth for the
 * Admin Users page.
 *
 * Returns:
 *
 * - pageNumber
 * - totalUsers
 * - users
 * - hasMore
 * - lastDoc
 */

export async function getAdminUserPage(
    pageNumber: number = 1,
    lastDoc?: DocumentSnapshot
) {

    const usersRef =
        collection(
            db,
            USERS_COLLECTION
        );


    /* -----------------------------------------------------
       ACTUAL TOTAL USER COUNT
       ----------------------------------------------------- */

    const countSnapshot =
        await getCountFromServer(
            usersRef
        );


    const totalUsers =
        countSnapshot.data().count;


    /* -----------------------------------------------------
       PAGINATED QUERY
       ----------------------------------------------------- */

    const usersQuery =
        pageNumber > 1 && lastDoc

            ? query(

                usersRef,

                orderBy(
                    "createdAt",
                    "desc"
                ),

                startAfter(
                    lastDoc
                ),

                limit(
                    PAGE_SIZE
                )

            )

            : query(

                usersRef,

                orderBy(
                    "createdAt",
                    "desc"
                ),

                limit(
                    PAGE_SIZE
                )

            );


    /* -----------------------------------------------------
       READ USERS
       ----------------------------------------------------- */

    const snapshot =
        await getDocs(
            usersQuery
        );


    const users: CachedUser[] =
        snapshot.docs.map(
            (document) =>
                mapUser(document)
        );


    /* -----------------------------------------------------
       RETURN
       ----------------------------------------------------- */

    return {

        pageNumber,

        totalUsers,

        users,

        hasMore:
            snapshot.docs.length ===
            PAGE_SIZE,

        lastDoc:
            snapshot.docs.length > 0
                ? snapshot.docs[
                    snapshot.docs.length - 1
                ]
                : null,

    };
}


/* =========================================================
   GET TOTAL USER COUNT
   ========================================================= */

/**
 * Returns the actual number of documents in:
 *
 * users/
 *
 * This does NOT use adminCache.
 */

export async function getAdminUserCount() {

    const usersRef =
        collection(
            db,
            USERS_COLLECTION
        );


    const snapshot =
        await getCountFromServer(
            usersRef
        );


    return snapshot.data().count;
}


/* =========================================================
   UPDATE USER BLOCK STATUS
   ========================================================= */

/**
 * Update the real users/{uid} document.
 *
 * No admin cache exists in this flow.
 */

export async function toggleCachedUserBlock(
    uid: string,
    isBlocked: boolean
) {

    const userRef =
        doc(
            db,
            USERS_COLLECTION,
            uid
        );


    await updateDoc(
        userRef,
        {
            isBlocked,
        }
    );
}


/* =========================================================
   UPDATE USER SUBSCRIPTION
   ========================================================= */

/**
 * Update subscription directly in:
 *
 * users/{uid}
 *
 * Kept under the old function name temporarily so that
 * existing imports do not break.
 */

export async function updateCachedSubscription(
    uid: string,
    plan: string,
    status: string,
    endDate: Timestamp | null
) {

    const userRef =
        doc(
            db,
            USERS_COLLECTION,
            uid
        );


    await updateDoc(
        userRef,
        {

            "subscription.plan":
                plan,

            "subscription.status":
                status,

            "subscription.endDate":
                endDate,

        }
    );
}


/* =========================================================
   REMOVE USER
   ========================================================= */

/**
 * Compatibility function.
 *
 * This does NOT delete the actual Firebase user.
 *
 * Real user deletion should be implemented separately
 * because Firebase Authentication and Firestore are
 * separate systems.
 */

export async function removeCachedUser(
    uid: string
) {

    console.warn(
        `removeCachedUser(${uid}) is deprecated.`
    );

}


/* =========================================================
   LEGACY ADMIN CACHE FUNCTION
   ========================================================= */

/**
 * Compatibility only.
 *
 * IMPORTANT:
 *
 * This function intentionally does nothing.
 *
 * New users are stored in:
 *
 * users/{uid}
 *
 * The Admin Users page reads directly from users/.
 */

export async function addUserToAdminCache(
    user: CachedUser
) {

    console.warn(
        "addUserToAdminCache() is deprecated. " +
        "Admin users are now read directly from users/.",
        user.uid
    );

}