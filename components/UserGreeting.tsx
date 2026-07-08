"use client";

import { useAuth } from "@/app/context/AuthContext";

export default function UserGreeting() {
  const { user } = useAuth();

  const name =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Sailor";

  return (
    <>
      <h2 className="text-2xl font-bold">
        Hi, {name} 👋
      </h2>

      <p className="text-gray-500">
        Welcome Back
      </p>
    </>
  );
}