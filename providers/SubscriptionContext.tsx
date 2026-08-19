"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { useAuth } from "./AuthContext";

import {
    isTrialExpired,
    isSubscriptionExpired,
} from "@/lib/subscriptions/subscription";

import {
    getUserSubscription,
    startTrial,
} from "@/services/subscription/subscription.service";

import type {
    UserSubscription,
} from "@/types/user";

interface SubscriptionContextType {
    loading: boolean;
    active: boolean;
    hasAccess: boolean;
    showTrialModal: boolean;
    showSubscriptionModal: boolean;

    closeTrialModal: () => void;

    status:
    | "inactive"
    | "trial"
    | "active"
    | "expired"
    | "cancelled";

    subscription: UserSubscription | null;
}

const SubscriptionContext =
    createContext<SubscriptionContextType>({
        loading: true,
        active: false,
        hasAccess: false,
        showTrialModal: false,
        showSubscriptionModal: false,

        closeTrialModal: () => { },

        status: "inactive",
        subscription: null,
    });

export function SubscriptionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, role } = useAuth();

    const [loading, setLoading] =
        useState(true);

    const [subscription, setSubscription] =
        useState<UserSubscription | null>(
            null
        );

    useEffect(() => {
        async function loadSubscription() {

            if (role === "admin") {
                setSubscription(null);
                setLoading(false);
                setShowTrialModal(false);
                return;
            }

            if (!user) {
                setSubscription(null);
                setLoading(false);
                return;
            }

            let data =
                await getUserSubscription(
                    user.uid
                );

            // First login → automatically start trial
            if (
                data &&
                data.status === "inactive"
            ) {
                await startTrial(user.uid);

                data =
                    await getUserSubscription(
                        user.uid
                    );
            }

            const dismissed =
                localStorage.getItem(
                    `trial_seen_${user.uid}`
                );

            if (
                data?.status === "trial" &&
                !isTrialExpired(data) &&
                !dismissed
            ) {
                setShowTrialModal(true);
            }

            setSubscription(data);
            setLoading(false);
        }

        loadSubscription();
    }, [user, role]);

    const trialExpired =
        subscription
            ? isTrialExpired(subscription)
            : false;

    const subscriptionExpired =
        subscription
            ? isSubscriptionExpired(
                subscription
            )
            : false;

    const hasAccess =
        role === "admin" ||
        (
            !!subscription &&
            (
                subscription.status === "active" ||
                subscription.status === "trial"
            ) &&
            !trialExpired &&
            !subscriptionExpired
        );

    const [
        showTrialModal,
        setShowTrialModal,
    ] = useState(false);

    const showSubscriptionModal =
        role !== "admin" &&
        !!subscription &&
        (
            subscription.status === "inactive" ||
            subscription.status === "expired" ||
            subscription.status === "cancelled" ||
            trialExpired ||
            subscriptionExpired
        );

    return (
        <SubscriptionContext.Provider
            value={{
                loading,

                active: hasAccess,

                hasAccess,

                showTrialModal,

                showSubscriptionModal,

                closeTrialModal: () => {

                    if (user) {

                        localStorage.setItem(
                            `trial_seen_${user.uid}`,
                            "true"
                        );

                    }

                    setShowTrialModal(false);

                },

                status:
                    subscription?.status ??
                    "inactive",

                subscription,
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    return useContext(
        SubscriptionContext
    );
}