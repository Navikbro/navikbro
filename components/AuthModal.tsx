"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Mail } from "lucide-react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

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

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const redirectUser = () => {
    setShow(false);

    if (redirectPath) {
      router.push(redirectPath);
    }
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

  const handleEmailAuth = async () => {
    try {
      setLoading(true);

      if (isSignup) {
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

      setEmail("");
      setPassword("");

      redirectUser();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-5">
      <div className="w-full max-w-sm rounded-[32px] bg-white p-7 shadow-2xl">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              {isSignup ? "Create Account" : "Welcome"}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Sign in to continue using NAVIK.
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
          className="mb-5 flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-300 px-4 py-4 font-medium hover:bg-gray-50 disabled:opacity-60"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="h-5 w-5"
          />

          Continue with Google
        </button>

        <div className="mb-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-4 outline-none focus:border-black"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-4 outline-none focus:border-black"
          />
        </div>

        <button
          onClick={handleEmailAuth}
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-white disabled:opacity-60"
        >
          <Mail size={18} />

          {loading
            ? "Please wait..."
            : isSignup
            ? "Create Account"
            : "Login"}
        </button>

        <button
          onClick={() => setIsSignup(!isSignup)}
          className="mt-5 w-full text-sm text-gray-500 hover:text-black"
        >
          {isSignup
            ? "Already have an account? Login"
            : "New here? Create account"}
        </button>
      </div>
    </div>
  );
}