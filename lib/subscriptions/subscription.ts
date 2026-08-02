import type {
    UserSubscription,
} from "@/types/user";

export const subscriptionsEnabled =
    process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED === "true";


export function isTrialExpired(
    subscription: UserSubscription
) {

    if (
        !subscription.trialEndDate
    ) {
        return false;
    }

    return (
        subscription.trialEndDate.toDate()
        <
        new Date()
    );

}

export function isSubscriptionExpired(
    subscription: UserSubscription
) {

    if (
        !subscription.endDate
    ) {
        return false;
    }

    return (
        subscription.endDate.toDate()
        <
        new Date()
    );

}