"use client";

import React from "react";

import {
    useSubscription,
} from "@/providers/SubscriptionContext";

import SubscriptionModal from "./SubscriptionModal";

export default function SubscriptionRoute({
    children,
}: {
    children: React.ReactNode;
}) {

    const {
        loading,
        active,
        showSubscriptionModal,
    } = useSubscription();


    /*
     * ---------------------------------------------------------
     * SUBSCRIPTION SYSTEM OFF
     * ---------------------------------------------------------
     *
     * The application is completely free.
     *
     * No blocking.
     * No subscription popup.
     * No trial.
     */
    const subscriptionsEnabled =
        process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED === "true";


    if (!subscriptionsEnabled) {
        return (
            <>
                {children}
            </>
        );
    }


    /*
     * ---------------------------------------------------------
     * SUBSCRIPTION STATE LOADING
     * ---------------------------------------------------------
     *
     * Do not show an expired popup while the subscription
     * state is being determined.
     */
    if (loading) {
        return null;
    }


    /*
     * ---------------------------------------------------------
     * ACTIVE / TRIAL
     * ---------------------------------------------------------
     *
     * User has access.
     */
    if (active) {
        return (
            <>
                {children}
            </>
        );
    }


    /*
     * ---------------------------------------------------------
     * EXPIRED / CANCELLED
     * ---------------------------------------------------------
     *
     * IMPORTANT:
     *
     * We no longer assume:
     *
     *     active === false
     *
     * means:
     *
     *     subscription expired
     *
     * Instead we rely on SubscriptionContext's explicit
     * showSubscriptionModal state.
     */
    if (showSubscriptionModal) {
        return (
            <SubscriptionModal
                mode="expired"
            />
        );
    }


    /*
     * ---------------------------------------------------------
     * UNKNOWN / INITIALIZATION STATE
     * ---------------------------------------------------------
     *
     * Never punish the user with the payment popup when the
     * subscription state is unknown.
     *
     * SubscriptionGuard / SubscriptionContext will handle
     * the actual state once available.
     */
    return (
        <>
            {children}
        </>
    );
}