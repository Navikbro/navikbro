import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

console.log("PROJECT ID LOADED:", !!process.env.FIREBASE_PROJECT_ID);
console.log("CLIENT EMAIL LOADED:", !!process.env.FIREBASE_CLIENT_EMAIL);
console.log("PRIVATE KEY LOADED:", !!process.env.FIREBASE_PRIVATE_KEY);

async function setAdmin() {
    // Import Firebase Admin only AFTER .env.local has been loaded
    const { adminAuth } = await import("../lib/firebase/firebase-admin");

    const email = "sahilchadhaslomo@gmail.com";

    const user = await adminAuth.getUserByEmail(email);

    await adminAuth.setCustomUserClaims(user.uid, {
        ...(user.customClaims ?? {}),
        admin: true,
    });

    console.log(`Admin claim set for ${email}`);
    console.log(`UID: ${user.uid}`);
}

setAdmin().catch((error) => {
    console.error("Failed to set admin:", error);
    process.exit(1);
});