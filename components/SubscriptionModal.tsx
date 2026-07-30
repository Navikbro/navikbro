"use client";

import { useSubscription } from "@/app/context/SubscriptionContext";

interface SubscriptionModalProps {
    mode: "trial" | "expired";
}

export default function SubscriptionModal({
    mode,
}: SubscriptionModalProps) {

    const {
        closeTrialModal,
    } = useSubscription();

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
                    className="w-full rounded-xl bg-black py-3 font-semibold text-white"
                >
                    Unlock NAVIK Pro
                </button>

            </div>

        </div>

    );

}