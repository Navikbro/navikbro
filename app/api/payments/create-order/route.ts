import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { getAuthenticatedUser } from "@/lib/authentication/serverAuth";

import { razorpay } from "@/lib/payments/razorpay";
import { SUBSCRIPTION } from "@/config/subscription";

export async function POST(request: NextRequest) {

    const user = await getAuthenticatedUser(request);

    const uid = user.uid;

    try {
        const receipt = crypto.randomUUID().replace(/-/g, "");

        const order = await razorpay.orders.create({
            amount: SUBSCRIPTION.MONTHLY.amount * 100,
            currency: SUBSCRIPTION.MONTHLY.currency,
            receipt,

            notes: {
                uid,
            },
        });

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to create payment order.",
            },
            {
                status: 500,
            }
        );
    }
}