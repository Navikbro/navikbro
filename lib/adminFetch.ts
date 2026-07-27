import { auth } from "@/lib/firebase";

export async function adminFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  const token = await user.getIdToken(true);

  const headers = new Headers(init.headers);

  headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, {
    ...init,
    headers,
  });
}