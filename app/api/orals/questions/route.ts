import { NextRequest, NextResponse } from "next/server";

import {
    getCachedOralQuestions,
} from "@/lib/cache/oral-cache";

import {
    getOralBatchQuestion,
} from "@/services/orals/oralBatch.service";

export async function POST(
    req: NextRequest
) {

    try {

        const {
            category,
            mmd,
            batchNumber,
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


        let questions;


        if (
            typeof batchNumber === "number"
        ) {

            questions =
                await getOralBatchQuestion(
                    category,
                    mmd,
                    batchNumber
                );

        } else {

            questions =
                await getCachedOralQuestions(
                    category,
                    mmd
                );

        }


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