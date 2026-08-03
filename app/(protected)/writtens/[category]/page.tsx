import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {

    try {

        const { category } = await request.json();

        const normalizedCategory =
            category.trim().toLowerCase();

        revalidateTag(
            `written-${normalizedCategory}`,
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

        console.error(error);

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