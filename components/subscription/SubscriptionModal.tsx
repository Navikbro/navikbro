"use client";

import { useSubscription } from "@/providers/SubscriptionContext";
import { useRazorpay } from "@/hooks/useRazorpay";
import { startSubscriptionPayment } from "@/lib/payments/payment";

interface SubscriptionModalProps {
    mode: "trial" | "expired";
}

export default function SubscriptionModal({
    mode,
}: SubscriptionModalProps) {

    const {
        closeTrialModal,
    } = useSubscription();

    const razorpayLoaded = useRazorpay();

    if (mode === "trial") {

        return (

            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

                <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">

                    <h2 className="mb-3 text-2xl font-bold">
                        🎉 Welcome to NAVIK!
                    </h2>

                    <p className="mb-6 text-gray-600">
                        Your complimentary 24-hour trial has started.
                        Enjoy unlimited access.
                    </p>

                    <button
                        onClick={closeTrialModal}
                        className="w-full rounded-xl bg-black py-3 font-semibold text-white"
                    >
                        Continue
                    </button>

                </div>

            </div>

        );

    }

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

            <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">

                <h2 className="mb-3 text-2xl font-bold">
                    🚀 Unlock NAVIK Pro
                </h2>

                <p className="mb-2 text-gray-600">
                    Continue your preparation with unlimited access.
                </p>

                <p className="mb-6 text-xl font-bold">
                    ₹149/month
                </p>

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
                    className="w-full rounded-xl bg-black py-3 font-semibold text-white disabled:opacity-50"
                >
                    {razorpayLoaded ? "Unlock NAVIK Pro" : "Loading..."}
                </button>

            </div>

        </div>

    );

}