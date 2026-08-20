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
    subscriptionsEnabled,
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
    const {
        user,
        loading: authLoading,
        role,
    } = useAuth();

    const [loading, setLoading] =
        useState(true);

    const [subscription, setSubscription] =
        useState<UserSubscription | null>(
            null
        );

    const [
        showTrialModal,
        setShowTrialModal,
    ] = useState(false);


    useEffect(() => {
        let mounted = true;

        async function loadSubscription() {

            /*
             * ---------------------------------------------------------
             * SUBSCRIPTION SYSTEM OFF
             * ---------------------------------------------------------
             *
             * When the ENV switch is false:
             *
             * - No subscription
             * - No trial
             * - No Firestore subscription check
             * - No popup
             * - NAVIK is completely free
             */
            if (!subscriptionsEnabled) {

                if (!mounted) return;

                setSubscription(null);
                setShowTrialModal(false);
                setLoading(false);

                return;
            }


            /*
             * ---------------------------------------------------------
             * WAIT FOR AUTHENTICATION
             * ---------------------------------------------------------
             *
             * AuthContext now waits until initializeUser() finishes.
             *
             * This prevents the original race condition.
             */
            if (authLoading) {
                return;
            }


            /*
             * ---------------------------------------------------------
             * ADMIN
             * ---------------------------------------------------------
             *
             * Admins never use the subscription system.
             */
            if (role === "admin") {

                if (!mounted) return;

                setSubscription(null);
                setShowTrialModal(false);
                setLoading(false);

                return;
            }


            /*
             * ---------------------------------------------------------
             * NO USER
             * ---------------------------------------------------------
             */
            if (!user) {

                if (!mounted) return;

                setSubscription(null);
                setShowTrialModal(false);
                setLoading(false);

                return;
            }


            /*
             * ---------------------------------------------------------
             * START SUBSCRIPTION LOADING
             * ---------------------------------------------------------
             */
            if (mounted) {
                setLoading(true);
                setShowTrialModal(false);
            }


            try {

                /*
                 * -----------------------------------------------------
                 * GET USER SUBSCRIPTION
                 * -----------------------------------------------------
                 *
                 * AuthContext has already finished initializeUser().
                 *
                 * Therefore users/{uid} should already exist.
                 */
                let data =
                    await getUserSubscription(
                        user.uid
                    );


                /*
                 * -----------------------------------------------------
                 * SAFETY CHECK
                 * -----------------------------------------------------
                 *
                 * A missing subscription is NOT an expired subscription.
                 *
                 * Do not show the paid subscription popup here.
                 *
                 * In the normal flow this should not happen because
                 * AuthContext initializes the user first.
                 */
                if (!data) {

                    if (!mounted) return;

                    setSubscription(null);
                    setShowTrialModal(false);
                    setLoading(false);

                    console.warn(
                        "Subscription not found for initialized user:",
                        user.uid
                    );

                    return;
                }


                /*
                 * -----------------------------------------------------
                 * NEW USER → START 24-HOUR TRIAL
                 * -----------------------------------------------------
                 *
                 * Only an inactive subscription starts a trial.
                 *
                 * Existing trial / active / expired subscriptions
                 * are NEVER restarted.
                 */
                if (
                    data.status === "inactive"
                ) {

                    await startTrial(
                        user.uid
                    );

                    /*
                     * Read the newly-created trial subscription.
                     */
                    data =
                        await getUserSubscription(
                            user.uid
                        );

                    /*
                     * If something went wrong, do not invent a
                     * subscription state.
                     */
                    if (!data) {

                        if (!mounted) return;

                        setSubscription(null);
                        setShowTrialModal(false);
                        setLoading(false);

                        console.warn(
                            "Trial was started but subscription could not be reloaded:",
                            user.uid
                        );

                        return;
                    }
                }


                /*
                 * -----------------------------------------------------
                 * TRIAL POPUP
                 * -----------------------------------------------------
                 *
                 * Show only:
                 *
                 * status === trial
                 * AND trial has not expired
                 * AND user has not dismissed it before.
                 */
                const dismissed =
                    localStorage.getItem(
                        `trial_seen_${user.uid}`
                    );


                if (
                    data.status === "trial" &&
                    !isTrialExpired(data) &&
                    !dismissed
                ) {
                    if (mounted) {
                        setShowTrialModal(true);
                    }
                }


                /*
                 * -----------------------------------------------------
                 * SAVE FINAL SUBSCRIPTION STATE
                 * -----------------------------------------------------
                 */
                if (!mounted) return;

                setSubscription(data);
                setLoading(false);

            } catch (error) {

                console.error(
                    "Failed loading subscription:",
                    error
                );

                if (!mounted) return;

                /*
                 * IMPORTANT:
                 *
                 * Do not convert a Firestore/network error into
                 * an "expired subscription".
                 *
                 * That would incorrectly show the payment popup.
                 */
                setSubscription(null);
                setShowTrialModal(false);
                setLoading(false);
            }
        }


        /*
         * Run subscription initialization.
         */
        loadSubscription();


        return () => {
            mounted = false;
        };

    }, [
        user,
        role,
        authLoading,
    ]);


    /*
     * ---------------------------------------------------------
     * DERIVED SUBSCRIPTION STATE
     * ---------------------------------------------------------
     */

    const trialExpired =
        subscription
            ? isTrialExpired(
                subscription
            )
            : false;


    const subscriptionExpired =
        subscription
            ? isSubscriptionExpired(
                subscription
            )
            : false;


    /*
     * ---------------------------------------------------------
     * ACCESS
     * ---------------------------------------------------------
     *
     * Trial and paid subscriptions both have access.
     */
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


    /*
     * ---------------------------------------------------------
     * PAYMENT POPUP
     * ---------------------------------------------------------
     *
     * ONLY show it when an actual subscription/trial has expired
     * or has been cancelled.
     *
     * NEVER show it for:
     *
     * - null
     * - loading
     * - inactive
     * - temporary initialization states
     */
    const showSubscriptionModal =
        subscriptionsEnabled &&
        role !== "admin" &&
        !!subscription &&
        (
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