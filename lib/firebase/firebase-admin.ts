import {
    cert,
    getApps,
    initializeApp,
} from "firebase-admin/app";

import {
    getFirestore,
} from "firebase-admin/firestore";


import {
    getAuth,
} from "firebase-admin/auth";


import {
    getMessaging,
} from "firebase-admin/messaging";


console.log("🔥 FIREBASE ADMIN FILE LOADED");


const adminApp =
    getApps().length === 0
        ? initializeApp({

            credential:
                cert({

                    projectId:
                        process.env.FIREBASE_PROJECT_ID,


                    clientEmail:
                        process.env.FIREBASE_CLIENT_EMAIL,


                    privateKey:
                        process.env.FIREBASE_PRIVATE_KEY?.replace(
                            /\\n/g,
                            "\n"
                        ),

                }),

        })

        : getApps()[0];



export const adminAuth =
    getAuth(adminApp);



export const adminMessaging =
    getMessaging(adminApp);

export const adminDb =
    getFirestore(adminApp);