import { Timestamp } from "firebase/firestore";

export type UserRole = "student" | "admin";

export type SubscriptionPlan =
    | "free"
    | "trial"
    | "monthly"
    | "quarterly"
    | "yearly"
    | "lifetime";

export type SubscriptionStatus =
    | "inactive"
    | "trial"
    | "active"
    | "expired"
    | "cancelled";

export interface UserSubscription {
    plan: SubscriptionPlan;

    status: SubscriptionStatus;

    startDate: Timestamp | null;

    endDate: Timestamp | null;

    paymentId: string | null;

    autoRenew: boolean;

    trialStartDate: Timestamp | null;

    trialEndDate: Timestamp | null;

    amount: number | null;

    lockedPrice: number | null;

    currency?: string;
}

export interface UserStats {
    loginCount: number;

    lastLogin: Timestamp | null;
}

export interface AppUser {
    uid: string;

    name: string;

    email: string;

    photoURL: string | null;

    role: UserRole;

    createdAt: Timestamp;

    updatedAt: Timestamp;

    isBlocked: boolean;

    subscription: UserSubscription;

    stats: UserStats;
}