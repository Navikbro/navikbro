import { auth } from "@/lib/firebase/firebase";

import {
    onAuthStateChanged,
    type User,
} from "firebase/auth";


export function getCurrentUser(): Promise<User | null> {

    return new Promise((resolve) => {

        const unsubscribe =
            onAuthStateChanged(
                auth,
                (user) => {

                    unsubscribe();

                    resolve(user);

                }
            );

    });

}