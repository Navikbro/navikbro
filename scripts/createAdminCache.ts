import {
    doc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";

import { db } from "../lib/firebase";


async function createAdminCache() {

    const pageRef = doc(
        db,
        "adminCache",
        "users",
        "pages",
        "page_1"
    );


    await setDoc(pageRef, {

        pageNumber: 1,

        totalUsers: 0,

        users: [],

        updatedAt: serverTimestamp(),

    });


    console.log("Admin cache created successfully");

    process.exit(0);
}


createAdminCache();