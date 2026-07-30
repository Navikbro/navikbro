"use client";

import { ReactNode } from "react";

import { useSubscription } from "@/app/context/SubscriptionContext";

import SubscriptionModal from "@/components/SubscriptionModal";

import { subscriptionsEnabled } from "@/lib/subscription";

interface Props {
    children: ReactNode;
}

export default function SubscriptionGuard({
    children,
}: Props) {

    const {
        loading,
        hasAccess,
        showTrialModal,
        showSubscriptionModal,
    } = useSubscription();

    // Development Mode
    if (!subscriptionsEnabled) {
        return <>{children}</>;
    }

    if (loading) {
        return null;
    }

    return (
        <>
            {children}

            {showTrialModal && (
                <SubscriptionModal
                    mode="trial"
                />
            )}

            {!hasAccess &&
                showSubscriptionModal && (
                    <SubscriptionModal
                        mode="expired"
                    />
                )}
        </>
    );
}