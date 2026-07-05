"use client";

import { Sailboat, User, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/app/context/AuthContext";

interface HeaderProps {
  setShowAuth: (show: boolean) => void;
}

export default function Header({ setShowAuth }: HeaderProps) {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  const shortName =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "";

  return (
    <div className="rounded-3xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center -rotate-6">
            <Sailboat size={30} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight">
              NAVIK
            </h1>

            <p className="text-xs text-gray-500">
              Sail Towards COC
            </p>
          </div>
        </div>

        {/* Right */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gray-100 px-3 py-2">
              <p className="text-[10px] text-gray-500">
                Signed In
              </p>

              <p className="max-w-[90px] truncate text-xs font-semibold">
                {shortName}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white transition hover:opacity-90"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuth(true)}
            className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            <User size={16} />
            Login
          </button>
        )}
      </div>
    </div>
  );
}