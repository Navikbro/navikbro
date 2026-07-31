import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import { buildMonthlySubscription } from "@/lib/serverSubscription";


export async function POST(request: NextRequest) {

    try {

        const body = await request.text();


        const signature =
            request.headers.get(
                "x-razorpay-signature"
            );


        if (!signature) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Missing webhook signature.",
                },
                {
                    status: 400,
                }
            );

        }


        // Verify Razorpay webhook signature

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_WEBHOOK_SECRET!
                )
                .update(body)
                .digest("hex");


        if (expectedSignature !== signature) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid webhook signature.",
                },
                {
                    status: 400,
                }
            );

        }


        const payload = JSON.parse(body);


        const event = payload.event;


        // Only process successful payments

        if (event !== "payment.captured") {

            return NextResponse.json({
                success: true,
            });

        }


        // Extract payment information

        const payment =
            payload.payload.payment.entity;


        const paymentId = payment.id;

        const orderId = payment.order_id;

        const amount = payment.amount;


        const notes =
            payment.notes ?? {};


        const uid = notes.uid;


        if (!uid) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "UID not found in payment notes.",
                },
                {
                    status: 400,
                }
            );

        }


        console.log(
            "Webhook Event:",
            event,
            "Payment:",
            paymentId,
            "UID:",
            uid
        );


        // Update subscription safely

        await adminDb.runTransaction(
            async (transaction) => {


                const verificationRef =
                    adminDb
                        .collection(
                            "paymentVerifications"
                        )
                        .doc(paymentId);


                const verificationDoc =
                    await transaction.get(
                        verificationRef
                    );


                // Ignore duplicate webhook

                if (verificationDoc.exists) {

                    return;

                }


                const userRef =
                    adminDb
                        .collection("users")
                        .doc(uid);


                const userDoc =
                    await transaction.get(
                        userRef
                    );


                const existingSubscription =
                    userDoc.data()?.subscription;


                const updatedSubscription =
                    buildMonthlySubscription(
                        existingSubscription,
                        paymentId
                    );


                // Activate subscription

                transaction.update(
                    userRef,
                    {
                        subscription:
                            updatedSubscription,
                    }
                );


                // Store processed payment

                transaction.set(
                    verificationRef,
                    {
                        uid,

                        paymentId,

                        orderId,

                        amount,

                        source:
                            "webhook",

                        verifiedAt:
                            FieldValue.serverTimestamp(),
                    }
                );


            }
        );


        return NextResponse.json({
            success: true,
        });


    } catch (error) {


        console.error(
            "Webhook Error:",
            error
        );


        return NextResponse.json(
            {
                success: false,
                message:
                    "Webhook processing failed.",
            },
            {
                status: 500,
            }
        );


    }

}