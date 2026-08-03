import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST() {
    try {

        revalidateTag(
            "written_batches",
            "max"
        );

        revalidateTag(
            "written_batches_metadata",
            "max"
        );

        return NextResponse.json({
            success: true,
        });

    } catch (error) {

        console.error(
            "Written revalidation error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
            },
            {
                status: 500,
            }
        );

    }
}