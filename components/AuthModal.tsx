"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import { Sailboat } from "lucide-react";

import { auth } from "@/lib/firebase";

interface Props {
  show: boolean;
  setShow: (show: boolean) => void;
}

export default function AuthModal({
  show,
  setShow,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const redirectUser = () => {
    setShow(false);
    router.replace("/");
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      if (result.user) {
        redirectUser();
      }
    } catch (err) {
      console.error(err);
      alert("Google Sign In Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Background */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setShow(false)}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{
              opacity: 0,
              y: 24,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 24,
            }}
            transition={{
              duration: 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={(e) => e.stopPropagation()}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] bg-white px-6 pt-4 pb-10 shadow-2xl transform-gpu will-change-transform"
          >
            {/* Drag Handle */}
            <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-gray-300" />

            {/* Header */}
            <div className="flex flex-col items-center">
              <p className="mb-6 text-center text-sm text-gray-500">
                Sign in to continue with...
              </p>

              <Sailboat
                size={24}
                strokeWidth={2.2}
                className="mb-2 rotate-[-8deg]"
              />

              <div className="relative inline-block">
                <h2 className="text-[28px] font-bold tracking-[-0.04em] leading-none text-black">
                  NAVIK
                </h2>

                <span
                  className="
        absolute
        left-full
        ml-1
        top-[2px]
        text-[11px]
        font-semibold
        italic
        lowercase
        text-gray-600
        leading-none
      "
                >
                  bro
                </span>
              </div>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 bg-white px-5 py-4 text-base font-medium transition-colors hover:bg-gray-50 active:scale-[0.98] disabled:opacity-60"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="h-5 w-5"
              />

              {loading ? "Signing in..." : "Continue with Google"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}