import {
    getMessaging,
    getToken,
} from "firebase/messaging";

import app from "@/lib/firebase/firebase";


export async function requestNotificationPermission() {

    if (
        typeof window === "undefined"
    ) {
        return null;
    }


    const permission =
        await Notification.requestPermission();


    if (
        permission !== "granted"
    ) {

        console.log(
            "Notification permission denied"
        );

        return null;
    }


    const messaging =
        getMessaging(app);


    const token =
        await getToken(
            messaging,
            {
                vapidKey:
                    process.env
                        .NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            }
        );


    return token;

}