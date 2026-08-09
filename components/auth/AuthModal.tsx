
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import { Sailboat } from "lucide-react";

import { auth } from "@/lib/firebase/firebase";

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
            transition={{ duration: 0.12 }}
            onClick={() => setShow(false)}
          />

          {/* Center Modal */}
          <motion.div
            initial={{
              opacity: 0,
              y: 60,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 30,
            }}
            transition={{
              duration: 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={(e) => e.stopPropagation()}
            className="
              fixed
              left-1/2
              top-1/2
              z-50
              w-[calc(100%-40px)]
              max-w-sm
              -translate-x-1/2
              -translate-y-1/2
              rounded-[24px]
              bg-white
              px-6
              py-6
              shadow-2xl
              transform-gpu
              will-change-transform
            "
          >
            {/* Header */}
            <div className="flex flex-col items-center">

              <p className="mb-5 text-center text-sm text-gray-500">
                Sign in to continue with...
              </p>

              <div className="flex items-center justify-center gap-2">
                <Sailboat
                  size={24}
                  strokeWidth={2.2}
                  className="rotate-[-8deg]"
                />

                <div className="flex items-start">
                  <h2 className="text-2xl font-bold leading-none tracking-[-0.04em] text-black">
                    NAVIK
                  </h2>

                  <span
                    className="
                      ml-1
                      text-[10px]
                      font-bold
                      italic
                      lowercase
                      leading-none
                      text-gray-700
                    "
                  >
                    bro
                  </span>
                </div>
              </div>

            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="
                mt-6
                flex
                w-full
                items-center
                justify-center
                gap-3
                rounded-full
                border
                border-gray-300
                bg-white
                px-5
                py-3.5
                text-sm
                font-medium
                transition-colors
                hover:bg-gray-50
                active:bg-gray-100
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}