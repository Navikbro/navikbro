"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/context/AuthContext";

interface Props {
    children: ReactNode;
}

export default function AdminRoute({
    children,
}: Props) {
    const router = useRouter();

    const {
        user,
        loading,
        role,
    } = useAuth();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.replace("/");
            return;
        }

        if (role !== "admin") {
            router.replace("/");
        }
    }, [user, loading, role, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!user || role !== "admin") {
        return null;
    }

    return <>{children}</>;
}