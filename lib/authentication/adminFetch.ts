import { auth } from "@/lib/firebase/firebase";

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

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Request failed (${response.status}): ${text}`
    );
  }

  return response;
}