"use client";

import { ReactNode } from "react";

import { useSubscription } from "@/providers/SubscriptionContext";

import SubscriptionModal from "@/components/subscription/SubscriptionModal";

import { subscriptionsEnabled } from "@/lib/subscriptions/subscription";

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