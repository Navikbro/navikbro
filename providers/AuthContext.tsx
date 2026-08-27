"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    getRedirectResult,
    onAuthStateChanged,
    signOut,
    type User,
} from "firebase/auth";

import { auth } from "@/lib/firebase/firebase";

import {
    initializeUser,
    saveFCMToken,
    updateUserPresence,
} from "@/services/users/userService";

import {
    requestNotificationPermission,
} from "@/lib/firebase/firebaseMessaging";


interface AuthContextType {
    user: User | null;
    loading: boolean;
    role: "admin" | "student";
}


const AuthContext =
    createContext<AuthContextType>({
        user: null,
        loading: true,
        role: "student",
    });


export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const [user, setUser] =
        useState<User | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [role, setRole] =
        useState<"admin" | "student">(
            "student"
        );


    /*
     * =========================================================
     * FIREBASE AUTH STATE
     * =========================================================
     */

    useEffect(() => {

        let mounted = true;


        /*
         * ---------------------------------------------------------
         * HANDLE GOOGLE REDIRECT RESULT
         * ---------------------------------------------------------
         *
         * This only consumes the redirect result.
         *
         * User initialization is handled exclusively by
         * onAuthStateChanged below.
         */

        getRedirectResult(auth)
            .then((result) => {

                if (!mounted) {
                    return;
                }


                if (result?.user) {

                    console.log(
                        "Google redirect sign-in successful:",
                        result.user.uid
                    );

                }

            })
            .catch((error: any) => {

                console.error(
                    "Google redirect sign-in failed:",
                    {
                        code: error?.code,
                        message: error?.message,
                        name: error?.name,
                        error,
                    }
                );

            });


        /*
         * ---------------------------------------------------------
         * AUTH STATE
         * ---------------------------------------------------------
         */

        const unsubscribe =
            onAuthStateChanged(
                auth,
                async (firebaseUser) => {

                    if (!mounted) {
                        return;
                    }


                    /*
                     * -------------------------------------------------
                     * USER SIGNED OUT
                     * -------------------------------------------------
                     */

                    if (!firebaseUser) {

                        setUser(null);

                        setRole("student");

                        setLoading(false);

                        return;
                    }


                    /*
                     * -------------------------------------------------
                     * AUTH INITIALIZATION STARTED
                     * -------------------------------------------------
                     */

                    setLoading(true);


                    try {

                        /*
                         * -------------------------------------------------
                         * ADMIN CLAIM
                         * -------------------------------------------------
                         *
                         * Force-refresh the ID token so that a recently
                         * assigned admin claim is detected.
                         */

                        const token =
                            await firebaseUser
                                .getIdTokenResult(true);


                        if (!mounted) {
                            return;
                        }


                        const isAdmin =
                            token.claims.admin === true;


                        setRole(
                            isAdmin
                                ? "admin"
                                : "student"
                        );


                        /*
                         * -------------------------------------------------
                         * INITIALIZE FIRESTORE USER
                         * -------------------------------------------------
                         *
                         * initializeUser() now writes directly to:
                         *
                         * users/{uid}
                         *
                         * There is no adminCache dependency.
                         */

                        const profile =
                            await initializeUser({

                                uid:
                                    firebaseUser.uid,

                                displayName:
                                    firebaseUser.displayName,

                                email:
                                    firebaseUser.email,

                                photoURL:
                                    firebaseUser.photoURL,

                            });


                        if (!mounted) {
                            return;
                        }


                        /*
                         * -------------------------------------------------
                         * BLOCKED USER
                         * -------------------------------------------------
                         */

                        if (profile.isBlocked) {

                            await signOut(auth);


                            if (!mounted) {
                                return;
                            }


                            setUser(null);

                            setRole("student");

                            setLoading(false);

                            return;
                        }


                        /*
                         * -------------------------------------------------
                         * AUTHENTICATION COMPLETE
                         * -------------------------------------------------
                         */

                        setUser(
                            firebaseUser
                        );


                    } catch (error) {

                        /*
                         * -------------------------------------------------
                         * INITIALIZATION FAILURE
                         * -------------------------------------------------
                         *
                         * Firebase authentication succeeded.
                         *
                         * We keep the user authenticated, but log the
                         * Firestore initialization error.
                         */

                        console.error(
                            "Post-authentication initialization failed:",
                            error
                        );


                        if (!mounted) {
                            return;
                        }


                        setUser(
                            firebaseUser
                        );


                        /*
                         * Do not automatically downgrade an admin
                         * claim because Firestore initialization failed.
                         *
                         * The role was already determined from the
                         * Firebase token above.
                         */

                    } finally {

                        if (mounted) {

                            setLoading(false);

                        }

                    }


                    /*
                     * -------------------------------------------------
                     * FCM
                     * -------------------------------------------------
                     *
                     * Notification setup is deliberately outside
                     * the critical authentication path.
                     */

                    void setupNotifications(
                        firebaseUser.uid
                    );

                }
            );


        return () => {

            mounted = false;

            unsubscribe();

        };

    }, []);


    /*
     * =========================================================
     * USER PRESENCE
     * =========================================================
     */

    useEffect(() => {

        if (!user) {
            return;
        }


        let cancelled = false;


        const sendPresence =
            async () => {

                if (cancelled) {
                    return;
                }


                try {

                    await updateUserPresence(
                        user.uid
                    );

                } catch (error) {

                    console.error(
                        "Failed to update user presence:",
                        error
                    );

                }

            };


        /*
         * Mark user online immediately.
         */

        void sendPresence();


        /*
         * Keep presence alive while the app is open.
         */

        const interval =
            window.setInterval(
                () => {

                    void sendPresence();

                },
                60 * 1000
            );


        return () => {

            cancelled = true;

            window.clearInterval(
                interval
            );

        };

    }, [user]);


    /*
     * =========================================================
     * PROVIDER
     * =========================================================
     */

    return (

        <AuthContext.Provider
            value={{
                user,
                loading,
                role,
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}


/*
 * =============================================================
 * NOTIFICATION SETUP
 * =============================================================
 *
 * This is completely independent from authentication.
 *
 * FCM failure must never break login.
 */

async function setupNotifications(
    uid: string
) {

    try {

        if (
            typeof window === "undefined"
        ) {

            return;

        }


        const fcmToken =
            await requestNotificationPermission();


        if (!fcmToken) {

            return;

        }


        await saveFCMToken(
            uid,
            fcmToken
        );


    } catch (error) {

        /*
         * Notification failure is non-critical.
         *
         * DO NOT sign the user out.
         * DO NOT modify authentication state.
         */

        console.warn(
            "FCM setup skipped:",
            error
        );

    }

}


/*
 * =============================================================
 * USE AUTH
 * =============================================================
 */

export function useAuth() {

    return useContext(
        AuthContext
    );

}