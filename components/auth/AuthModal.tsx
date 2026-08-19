"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    GoogleAuthProvider,
    browserLocalPersistence,
    setPersistence,
    signInWithPopup,
    signInWithRedirect,
} from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import { Sailboat } from "lucide-react";

import { auth } from "@/lib/firebase/firebase";

interface Props {
    show: boolean;
    setShow: (show: boolean) => void;
}

function getGoogleAuthErrorMessage(error: any): string {
    const code = error?.code;

    switch (code) {
        case "auth/popup-blocked":
            return "Your browser blocked the Google sign-in window. Please try again.";

        case "auth/popup-closed-by-user":
            return "Google sign-in was cancelled.";

        case "auth/cancelled-popup-request":
            return "Another Google sign-in request is already in progress.";

        case "auth/unauthorized-domain":
            return "This website is not authorized for Google sign-in.";

        case "auth/operation-not-allowed":
            return "Google sign-in is not enabled for this Firebase project.";

        case "auth/network-request-failed":
            return "Network error. Please check your internet connection and try again.";

        case "auth/account-exists-with-different-credential":
            return "An account already exists with another sign-in method.";

        case "auth/too-many-requests":
            return "Too many sign-in attempts. Please wait a moment and try again.";

        default:
            return "Unable to sign in with Google. Please try again.";
    }
}

function shouldUseRedirect(error: any): boolean {
    const code = error?.code;

    return (
        code === "auth/popup-blocked" ||
        code === "auth/operation-not-supported-in-this-environment" ||
        code === "auth/operation-not-supported"
    );
}

export default function AuthModal({
    show,
    setShow,
}: Props) {
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const redirectUser = () => {
        setShow(false);
        router.replace("/");
    };

    const handleGoogleLogin = async () => {
        if (loading) return;

        try {
            setLoading(true);

            /*
             * Always use local persistence for normal browser sessions.
             */
            await setPersistence(
                auth,
                browserLocalPersistence
            );

            const provider =
                new GoogleAuthProvider();

            /*
             * Forces Google to show the account chooser.
             *
             * This prevents confusing situations where the browser
             * silently uses a previously selected Google account.
             */
            provider.setCustomParameters({
                prompt: "select_account",
            });

            try {
                /*
                 * PRIMARY METHOD
                 *
                 * Works well on normal desktop/mobile browsers.
                 */
                const result =
                    await signInWithPopup(
                        auth,
                        provider
                    );

                if (result.user) {
                    redirectUser();
                }

            } catch (popupError: any) {

                console.error(
                    "Google popup authentication failed:",
                    {
                        code: popupError?.code,
                        message: popupError?.message,
                        name: popupError?.name,
                    }
                );

                /*
                 * Some browsers/devices do not allow Firebase's
                 * popup flow properly.
                 *
                 * In those cases switch to redirect authentication.
                 */
                if (shouldUseRedirect(popupError)) {
                    await signInWithRedirect(
                        auth,
                        provider
                    );

                    /*
                     * The browser will leave this page.
                     * AuthContext will process the result after
                     * Google redirects back to NAVIK.
                     */
                    return;
                }

                /*
                 * User intentionally closed the popup.
                 * Don't show a scary error.
                 */
                if (
                    popupError?.code ===
                    "auth/popup-closed-by-user"
                ) {
                    return;
                }

                throw popupError;
            }

        } catch (error: any) {

            console.error(
                "Google Sign In Failed:",
                {
                    code: error?.code,
                    message: error?.message,
                    name: error?.name,
                    fullError: error,
                }
            );

            alert(
                getGoogleAuthErrorMessage(error)
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <>
                    {/* Background */}
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/45"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        onClick={() =>
                            setShow(false)
                        }
                    />

                    {/* Center Modal */}
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 60,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            y: 30,
                        }}
                        transition={{
                            duration: 0.18,
                            ease: [
                                0.22,
                                1,
                                0.36,
                                1,
                            ],
                        }}
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        className="
                            fixed
                            left-1/2
                            top-1/2
                            z-50
                            w-[calc(100%-40px)]
                            max-w-sm
                            -translate-x-1/2
                            -translate-y-1/2
                            rounded-[24px]
                            bg-white
                            px-6
                            py-6
                            shadow-2xl
                            transform-gpu
                            will-change-transform
                        "
                    >
                        {/* Header */}
                        <div className="flex flex-col items-center">

                            <p className="mb-5 text-center text-sm text-gray-500">
                                Sign in to continue with...
                            </p>

                            <div className="flex items-center justify-center gap-2">

                                <Sailboat
                                    size={24}
                                    strokeWidth={2.2}
                                    className="rotate-[-8deg]"
                                />

                                <div className="flex items-start">

                                    <h2 className="text-2xl font-bold leading-none tracking-[-0.04em] text-black">
                                        NAVIK
                                    </h2>

                                    <span
                                        className="
                                            ml-1
                                            text-[10px]
                                            font-bold
                                            italic
                                            lowercase
                                            leading-none
                                            text-gray-700
                                        "
                                    >
                                        bro
                                    </span>

                                </div>
                            </div>

                        </div>

                        {/* Google Button */}
                        <button
                            onClick={
                                handleGoogleLogin
                            }
                            disabled={loading}
                            className="
                                mt-6
                                flex
                                w-full
                                items-center
                                justify-center
                                gap-3
                                rounded-full
                                border
                                border-gray-300
                                bg-white
                                px-5
                                py-3.5
                                text-sm
                                font-medium
                                transition-colors
                                hover:bg-gray-50
                                active:bg-gray-100
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >

                            <img
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                alt="Google"
                                className="h-5 w-5"
                            />

                            {loading
                                ? "Signing in..."
                                : "Continue with Google"}

                        </button>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}