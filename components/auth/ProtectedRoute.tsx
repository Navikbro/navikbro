"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthContext";

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({
    children,
}: ProtectedRouteProps) {

    const router = useRouter();

    const {
        user,
        loading,
    } = useAuth();


    useEffect(() => {

        if (!loading && !user) {
            router.replace("/");
        }

    }, [
        user,
        loading,
        router,
    ]);


    /*
     * Firebase authentication OR user initialization
     * is still in progress.
     *
     * Do NOT render the protected page yet.
     */
    if (loading) {

        return (
            <div
                className="
                    flex
                    min-h-screen
                    items-center
                    justify-center
                    bg-[#f5f5f5]
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        items-center
                        gap-3
                    "
                >

                    <div
                        className="
                            w-8
                            h-8
                            rounded-full
                            border-[3px]
                            border-gray-300
                            border-t-black
                            animate-spin
                        "
                    />

                    <p
                        className="
                            text-sm
                            text-gray-500
                        "
                    >
                        Signing you in...
                    </p>

                </div>

            </div>
        );
    }


    /*
     * Authentication finished but there is no user.
     * useEffect will redirect to "/".
     */
    if (!user) {
        return null;
    }


    /*
     * Authentication + initializeUser() are complete.
     * NOW render the protected application.
     */
    return <>{children}</>;
}