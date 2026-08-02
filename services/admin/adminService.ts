import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase";

import {
    DashboardStats,
} from "@/types/admin";


const dashboardRef = doc(
    db,
    "adminStats",
    "dashboard"
);



/**
 * Create admin dashboard document
 * Run once when setting up admin system
 */
export async function initializeAdminStats() {

    const snapshot =
        await getDoc(dashboardRef);


    if (snapshot.exists()) {
        return snapshot.data() as DashboardStats;
    }


    const initialStats = {

        totalUsers: 0,

        activeSubscriptions: 0,

        expiredSubscriptions: 0,

        blockedUsers: 0,

        newUsersToday: 0,

        updatedAt:
            serverTimestamp(),

    };


    await setDoc(
        dashboardRef,
        initialStats
    );


    return initialStats;
}





/**
 * Get dashboard data
 * Cost: 1 Firestore read
 */
export async function getDashboardStats() {

    const snapshot =
        await getDoc(dashboardRef);


    if (!snapshot.exists()) {
        return null;
    }


    return snapshot.data() as DashboardStats;

}





/**
 * New user created
 */
export async function incrementTotalUsers() {

    await updateDoc(
        dashboardRef,
        {

            totalUsers:
                increment(1),


            newUsersToday:
                increment(1),


            updatedAt:
                serverTimestamp(),

        }
    );

}





/**
 * Subscription activated
 */
export async function activateSubscriptionCount() {

    await updateDoc(
        dashboardRef,
        {

            activeSubscriptions:
                increment(1),


            updatedAt:
                serverTimestamp(),

        }
    );

}





/**
 * Subscription expired
 */
export async function expireSubscriptionCount() {

    await updateDoc(
        dashboardRef,
        {

            activeSubscriptions:
                increment(-1),


            expiredSubscriptions:
                increment(1),


            updatedAt:
                serverTimestamp(),

        }
    );

}





/**
 * User blocked
 */
export async function incrementBlockedUsers() {

    await updateDoc(
        dashboardRef,
        {

            blockedUsers:
                increment(1),


            updatedAt:
                serverTimestamp(),

        }
    );

}





/**
 * User unblocked
 */
export async function decrementBlockedUsers() {

    await updateDoc(
        dashboardRef,
        {

            blockedUsers:
                increment(-1),


            updatedAt:
                serverTimestamp(),

        }
    );

}