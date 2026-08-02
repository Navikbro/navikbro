import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { SUBSCRIPTION } from "@/config/subscription";

import {
    adminDb,
} from "@/lib/firebase/firebase-admin";

import {
    razorpay,
} from "@/lib/payments/razorpay";

import {
    getAuthenticatedUser,
} from "@/lib/authentication/serverAuth";

import {
    buildMonthlySubscription,
} from "@/lib/subscriptions/serverSubscription";

export async function POST(
    request: NextRequest
) {
    try {

        // Authenticate Firebase User
        const user =
            await getAuthenticatedUser(request);

        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
        } = await request.json();

        // Verify Signature
        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET!
            )
            .update(
                `${razorpay_order_id}|${razorpay_payment_id}`
            )
            .digest("hex");

        if (
            expectedSignature !==
            razorpay_signature
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid payment signature.",
                },
                {
                    status: 400,
                }
            );

        }

        // Fetch Razorpay Order
        const payment =
            await razorpay.payments.fetch(
                razorpay_payment_id
            );

        const order =
            await razorpay.orders.fetch(
                razorpay_order_id
            );

        if (payment.status !== "captured") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Payment has not been captured.",
                },
                {
                    status: 400,
                }
            );
        }

        // Verify payment amount
        const expectedAmount =
            SUBSCRIPTION.MONTHLY.amount * 100;

        if (payment.amount !== expectedAmount) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid payment amount.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            payment.currency !==
            SUBSCRIPTION.MONTHLY.currency
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid payment currency.",
                },
                {
                    status: 400,
                }
            );
        }

        if (payment.order_id !== razorpay_order_id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Payment does not belong to this order.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            order.notes?.uid !== user.uid
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized payment.",
                },
                {
                    status: 403,
                }
            );

        }

        const verificationRef =
            adminDb
                .collection(
                    "paymentVerifications"
                )
                .doc(
                    razorpay_payment_id
                );

        const userRef =
            adminDb
                .collection("users")
                .doc(user.uid);

        await adminDb.runTransaction(
            async (transaction) => {

                // Prevent duplicate processing
                const verificationDoc =
                    await transaction.get(
                        verificationRef
                    );

                if (
                    verificationDoc.exists
                ) {
                    return;
                }

                // Read latest user
                const userDoc =
                    await transaction.get(
                        userRef
                    );

                if (
                    !userDoc.exists
                ) {
                    throw new Error(
                        "User not found."
                    );
                }

                const userData =
                    userDoc.data();

                const subscription =
                    buildMonthlySubscription(
                        userData?.subscription ?? {},
                        razorpay_payment_id
                    );

                // Update Subscription
                transaction.update(
                    userRef,
                    {
                        subscription,

                        updatedAt:
                            FieldValue.serverTimestamp(),
                    }
                );

                // Save Verification
                transaction.set(
                    verificationRef,
                    {
                        uid: user.uid,
                        paymentId: razorpay_payment_id,
                        orderId: razorpay_order_id,

                        amount: payment.amount,
                        currency: payment.currency,
                        status: payment.status,
                        email: payment.email ?? null,
                        contact: payment.contact ?? null,

                        verifiedAt: FieldValue.serverTimestamp(),
                    }
                );

            }
        );

        return NextResponse.json({
            success: true,
        });

    } catch (error) {

        console.error(
            "Payment Verification Error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Payment verification failed.",
            },
            {
                status: 500,
            }
        );

    }
}