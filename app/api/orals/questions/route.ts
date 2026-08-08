import { NextRequest, NextResponse } from "next/server";

import {
    getCachedOralQuestions,
} from "@/lib/cache/oral-cache";

export async function POST(
    req: NextRequest
) {

    try {

        const {
            category,
            mmd,
        } = await req.json();


        if (!category || !mmd) {

            return NextResponse.json(
                {
                    error:
                        "Category and MMD required",
                },
                {
                    status: 400,
                }
            );

        }


        const questions =
            await getCachedOralQuestions(
                category,
                mmd
            );


        return NextResponse.json({
            questions,
        });

    } catch (error) {

        console.error(
            "Failed to load oral questions:",
            error
        );


        return NextResponse.json(
            {
                error:
                    "Failed to load questions",
            },
            {
                status: 500,
            }
        );

    }

}