import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.split("Bearer ")[1];

  const decoded = await adminAuth.verifyIdToken(token);

  if (decoded.admin !== true) {
    throw new Error("Forbidden");
  }

  return decoded;
}