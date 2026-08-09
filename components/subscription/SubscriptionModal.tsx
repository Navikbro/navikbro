"use client";

import { motion } from "framer-motion";
import { Sailboat } from "lucide-react";

import { useSubscription } from "@/providers/SubscriptionContext";
import { useRazorpay } from "@/hooks/useRazorpay";
import { startSubscriptionPayment } from "@/lib/payments/payment";

interface SubscriptionModalProps {
  mode: "trial" | "expired";
}

export default function SubscriptionModal({
  mode,
}: SubscriptionModalProps) {
  const { closeTrialModal } = useSubscription();
  const razorpayLoaded = useRazorpay();

  const isTrial = mode === "trial";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Background */}
      <motion.div
        className="fixed inset-0 bg-black/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
      />

      {/* Modal */}
      <motion.div
        initial={{
          opacity: 0,
          y: 50,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: 25,
        }}
        transition={{
          duration: 0.18,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="
          relative
          z-10
          w-[calc(100%-40px)]
          max-w-sm
          rounded-[24px]
          bg-white
          px-6
          py-6
          shadow-xl
          transform-gpu
        "
      >
        {/* Logo */}
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

        {/* TRIAL */}
        {isTrial ? (
          <>
            <div className="mt-6 text-center">
              <h3 className="text-lg font-semibold tracking-tight text-black">
                Your trial has started
              </h3>

              <p className="mt-2 px-1 text-sm leading-5 text-gray-500">
                Your complimentary 24-hour trial is now active.
                Enjoy unlimited access to NAVIK bro.
              </p>
            </div>

            <button
              onClick={closeTrialModal}
              className="
                mt-6
                w-full
                rounded-full
                bg-black
                py-3
                text-sm
                font-semibold
                text-white
                transition-colors
                hover:bg-gray-900
                active:bg-gray-800
              "
            >
              Continue
            </button>
          </>
        ) : (
          <>
            {/* EXPIRED */}
            <div className="mt-6 text-center">
              <h3 className="text-lg font-semibold tracking-tight text-black">
                Continue your preparation
              </h3>

              <p className="mt-2 px-1 text-sm leading-5 text-gray-500">
                Your trial has ended. Continue your preparation
                for just ₹149 a month — less than a burger.
              </p>
            </div>

            {/* PRICE */}
            <div className="mt-5 flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold tracking-tight text-black">
                ₹149
              </span>

              <span className="text-sm text-gray-500">
                / month
              </span>
            </div>

            {/* SUBSCRIBE */}
            <button
              disabled={!razorpayLoaded}
              onClick={async () => {
                try {
                  await startSubscriptionPayment();
                } catch (error) {
                  console.error(error);
                  alert("Unable to start payment.");
                }
              }}
              className="
                mt-5
                w-full
                rounded-full
                bg-black
                py-3
                text-sm
                font-semibold
                text-white
                transition-colors
                hover:bg-gray-900
                active:bg-gray-800
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {razorpayLoaded
                ? "Subscribe for ₹149"
                : "Loading..."}
            </button>

            <p className="mt-2 text-center text-[11px] text-gray-400">
              No automatic renewal
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}