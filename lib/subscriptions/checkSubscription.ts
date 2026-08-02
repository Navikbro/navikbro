import { adminDb } from "@/lib/firebase/firebase-admin";


export async function hasActiveSubscription(
    uid: string
): Promise<boolean> {


    const userDoc =
        await adminDb
            .collection("users")
            .doc(uid)
            .get();


    if (!userDoc.exists) {
        return false;
    }


    const subscription =
        userDoc.data()?.subscription;


    if (!subscription) {
        return false;
    }


    if (subscription.status !== "active") {
        return false;
    }


    if (!subscription.endDate) {
        return false;
    }


    const expiryTime =
        subscription.endDate.toMillis();


    const currentTime =
        Date.now();


    return expiryTime > currentTime;

}