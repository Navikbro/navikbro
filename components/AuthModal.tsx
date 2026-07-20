"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

import { X, Sailboat } from "lucide-react";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
  redirectPath: string;
}

export default function AuthModal({
  show,
  setShow,
  redirectPath,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const redirectUser = () => {
    setShow(false);

    // use the requested path
    router.replace(redirectPath || "/");
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();

      await signInWithPopup(auth, provider);

      redirectUser();
    } catch (err) {
      console.error(err);
      alert("Google Sign In Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-5">
      <div className="w-full max-w-sm rounded-[32px] bg-white p-7 shadow-2xl">

        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Sailboat
                size={30}
                strokeWidth={2.2}
                className="rotate-[-8deg] text-black"
              />

              <h2 className="text-3xl font-bold tracking-tight text-black">
                NAVIK
              </h2>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Sign in to continue
            </p>
          </div>

          <button
            onClick={() => setShow(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>


        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-300 px-4 py-4 font-medium hover:bg-gray-50 disabled:opacity-60"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="h-5 w-5"
          />

          {loading
            ? "Signing in..."
            : "Continue with Google"}
        </button>

      </div>
    </div>
  );
}