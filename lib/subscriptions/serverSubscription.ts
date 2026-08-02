import {
    Timestamp,
} from "firebase-admin/firestore";

export function buildMonthlySubscription(
    existingSubscription: any,
    paymentId: string
) {
    const now = Timestamp.now();

    const endDate = Timestamp.fromMillis(
        now.toMillis() +
        30 * 24 * 60 * 60 * 1000
    );

    return {
        ...(existingSubscription ?? {}),

        plan: "monthly",
        status: "active",

        paymentId,

        amount: 149,
        currency: "INR",

        startDate: now,
        endDate,

        autoRenew: false,

        trialStartDate: null,
        trialEndDate: null,
    };
}