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

    useEffect(() => {
        let mounted = true;

        /*
         * ---------------------------------------------------------
         * HANDLE GOOGLE REDIRECT RESULT
         * ---------------------------------------------------------
         *
         * If a mobile/browser popup was unavailable, AuthModal
         * uses signInWithRedirect().
         *
         * Google sends the user back to NAVIK.
         *
         * Firebase stores the redirect result and this call
         * consumes it safely.
         *
         * IMPORTANT:
         * We don't initialize the user here.
         *
         * onAuthStateChanged below is the single source of truth.
         */
        getRedirectResult(auth)
            .then((result) => {
                if (!mounted) return;

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

                if (!mounted) return;

                /*
                 * Don't destroy an already authenticated session
                 * because a redirect-result check failed.
                 */
            });

        /*
         * ---------------------------------------------------------
         * FIREBASE AUTH STATE
         * ---------------------------------------------------------
         */
        const unsubscribe =
            onAuthStateChanged(
                auth,
                async (firebaseUser) => {
                    if (!mounted) return;

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
                     * IMPORTANT SUBSCRIPTION FIX
                     * -------------------------------------------------
                     *
                     * DO NOT expose the Firebase user to the rest
                     * of the application yet.
                     *
                     * We first make sure users/{uid} exists and is
                     * fully initialized.
                     *
                     * This prevents SubscriptionContext from asking
                     * Firestore for the subscription before
                     * initializeUser() has created it.
                     */

                    try {
                        /*
                         * -------------------------------------------------
                         * ADMIN CLAIM
                         * -------------------------------------------------
                         *
                         * Force-refresh only when checking claims.
                         * This keeps your existing admin logic intact.
                         */
                        const token =
                            await firebaseUser
                                .getIdTokenResult(true);

                        if (!mounted) return;

                        const isAdmin =
                            token.claims.admin === true;

                        console.log(
                            "ADMIN CHECK:",
                            {
                                email:
                                    firebaseUser.email,
                                claims:
                                    token.claims,
                                isAdmin,
                            }
                        );

                        /*
                         * Set role before initialization finishes.
                         *
                         * This does NOT expose the user yet.
                         */
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
                         * CRITICAL:
                         *
                         * This MUST finish before setUser().
                         *
                         * SubscriptionContext therefore cannot run
                         * against a missing users/{uid} document.
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

                        if (!mounted) return;

                        /*
                         * -------------------------------------------------
                         * BLOCKED USER
                         * -------------------------------------------------
                         */
                        if (profile.isBlocked) {
                            await signOut(auth);

                            if (!mounted) return;

                            setUser(null);
                            setRole("student");
                            setLoading(false);

                            return;
                        }

                        /*
                         * -------------------------------------------------
                         * IMPORTANT
                         * -------------------------------------------------
                         *
                         * Firestore initialization has completed.
                         *
                         * NOW the application is allowed to see
                         * the authenticated user.
                         */
                        setUser(firebaseUser);

                        /*
                         * Authentication + user initialization are now
                         * completely ready.
                         */
                        setLoading(false);

                    } catch (error) {
                        /*
                         * -------------------------------------------------
                         * POST-AUTHENTICATION INITIALIZATION FAILURE
                         * -------------------------------------------------
                         *
                         * Firebase authentication itself succeeded.
                         *
                         * Keep the user authenticated, but only expose
                         * the user AFTER the initialization attempt has
                         * completed.
                         */
                        console.error(
                            "Post-authentication initialization failed:",
                            error
                        );

                        if (!mounted) return;

                        /*
                         * Firebase authentication itself succeeded,
                         * therefore keep the user authenticated.
                         *
                         * SubscriptionContext will still wait until
                         * AuthContext loading is finished before checking
                         * the subscription.
                         */
                        setUser(firebaseUser);
                        setRole("student");
                        setLoading(false);
                    }

                    /*
                     * -----------------------------------------------------
                     * FCM IS INTENTIONALLY OUTSIDE THE CRITICAL LOGIN PATH
                     * -----------------------------------------------------
                     *
                     * We do this after authentication has completed.
                     *
                     * If notifications fail on a particular browser,
                     * Google login still works.
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
 * This is deliberately isolated from authentication.
 *
 * A browser that doesn't support notifications/FCM correctly
 * should never break Google authentication.
 */
async function setupNotifications(
    uid: string
) {
    try {
        if (typeof window === "undefined") {
            return;
        }

        const fcmToken =
            await requestNotificationPermission();

        if (!fcmToken) {
            return;
        }

        console.log(
            "FCM TOKEN:",
            fcmToken
        );

        await saveFCMToken(
            uid,
            fcmToken
        );

    } catch (error) {
        /*
         * Notification failure is non-critical.
         *
         * DO NOT sign the user out.
         * DO NOT change authentication state.
         */
        console.warn(
            "FCM setup skipped:",
            error
        );
    }
}


export function useAuth() {
    return useContext(AuthContext);
}