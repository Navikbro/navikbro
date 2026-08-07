import { NextRequest, NextResponse } from "next/server";

import {
    getOralBatchQuestions,
} from "@/services/orals/oralBatch.service";


export async function POST(
    req: NextRequest
) {

    const {
        category,
        mmd,
    } = await req.json();


    if (!category || !mmd) {
        return NextResponse.json(
            {
                error:
                "Category and MMD required"
            },
            {
                status:400
            }
        );
    }


    const questions =
        await getOralBatchQuestions(
            category,
            mmd
        );


    return NextResponse.json({
        questions,
    });

}