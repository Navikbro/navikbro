import { Timestamp } from "firebase/firestore";

export interface CachedUser {
    uid: string;

    name: string;

    email: string;

    photoURL: string | null;

    plan: string;

    status: string;

    endDate: Timestamp | null;

    isBlocked: boolean;
}

export interface UserPage {
    pageNumber: number;

    totalUsers: number;

    updatedAt: Timestamp;

    users: CachedUser[];
}

export interface DashboardStats {

    totalUsers: number;

    activeSubscriptions: number;

    expiredSubscriptions: number;

    blockedUsers: number;

    newUsersToday: number;

    updatedAt: Timestamp | null;
}