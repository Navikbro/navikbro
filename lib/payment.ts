"use client";

import { authFetch } from "@/lib/authFetch";

declare global {
    interface Window {
        Razorpay: any;
    }
}

export async function startSubscriptionPayment() {
    // Create Razorpay Order
    const response = await authFetch("/api/payment/create-order", {
        method: "POST",
    });

    if (!response.ok) {
        throw new Error("Unable to create payment order.");
    }

    const data = await response.json();

    const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,

        name: "NAVIK",
        description: "Monthly Subscription",

        order_id: data.orderId,

        handler: async function (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
        }) {
            try {
                const verifyResponse = await authFetch(
                    "/api/payment/verify",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(response),
                    }
                );

                const result = await verifyResponse.json();

                if (!verifyResponse.ok || !result.success) {
                    alert(
                        result.message ??
                            "Payment verification failed."
                    );
                    return;
                }

                alert("🎉 Subscription Activated!");

                window.location.reload();
            } catch (error) {
                console.error(
                    "Payment Verification Error:",
                    error
                );

                alert(
                    "Payment completed, but verification failed. Please contact support if your subscription is not activated."
                );
            }
        },

        modal: {
            ondismiss() {
                console.log("Payment cancelled.");
            },
        },

        theme: {
            color: "#000000",
        },
    };

    const paymentObject = new window.Razorpay(options);

    paymentObject.open();
}