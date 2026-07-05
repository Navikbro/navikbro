import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function isUserAdmin(uid: string) {
  const userRef = doc(db, "users", uid);

  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return false;
  }

  return snapshot.data().role === "admin";
}