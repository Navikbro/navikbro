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
    } = useSubscription();



    if (loading) {

        return null;

    }



    const subscriptionsEnabled =
        process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED === "true";



    // Subscription system OFF
    // NAVIK remains completely free
    if (!subscriptionsEnabled) {

        return (
            <>
                {children}
            </>
        );

    }



    // Active subscription or trial
    if (active) {

        return (
            <>
                {children}
            </>
        );

    }



    // Future subscription blocking
    return (

        <SubscriptionModal
            mode="expired"
        />

    );

}