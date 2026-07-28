"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AnimatePresence, motion } from "framer-motion";
import { Sailboat } from "lucide-react";

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
    } catch (error) {
      console.error(error);
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
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShow(false)}
          />

          {/* Bottom Sheet */}
          <motion.div
            drag="y"
            dragDirectionLock
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.15}
            dragMomentum={false}
            whileDrag={{
              scale: 0.995,
            }}
            onDragEnd={(_, info) => {
              if (
                info.offset.y > 120 ||
                info.velocity.y > 800
              ) {
                setShow(false);
              }
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 32,
            }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] bg-white px-6 pt-4 pb-8 shadow-2xl touch-pan-y"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-gray-300" />

            {/* Logo */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3">
                <Sailboat
                  size={30}
                  strokeWidth={2.2}
                  className="rotate-[-8deg]"
                />

                <h2 className="text-3xl font-bold tracking-tight">
                  NAVIK
                </h2>
              </div>

              <p className="mt-3 text-center text-sm text-gray-500">
                Sign in to continue
              </p>
            </div>

            {/* Google Button */}
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.15,
              }}
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 bg-white px-5 py-4 text-base font-medium shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="h-6 w-6"
              />

              {loading
                ? "Signing in..."
                : "Continue with Google"}
            </motion.button>

            {/* Bottom Safe Space */}
            <div className="h-2" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}