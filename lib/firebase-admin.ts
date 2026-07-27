import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import serviceAccount from "@/config/serviceAccountKey.json";

console.log("🔥 FIREBASE ADMIN FILE LOADED");
console.log("🔥 SERVICE ACCOUNT:", {
    project_id: serviceAccount.project_id,
    client_email: serviceAccount.client_email,
});

const adminApp =
    getApps().length === 0
        ? initializeApp({
              credential: cert({
                  projectId: serviceAccount.project_id,
                  clientEmail: serviceAccount.client_email,
                  privateKey: serviceAccount.private_key.replace(
                      /\\n/g,
                      "\n"
                  ),
              }),
          })
        : getApps()[0];

export const adminAuth = getAuth(adminApp);