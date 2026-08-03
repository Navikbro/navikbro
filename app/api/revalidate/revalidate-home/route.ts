import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {

    try {

        revalidateTag(
            "home-stats",
            "max"
        );

        revalidateTag(
            "oral_batches_metadata",
            "max"
        );

        revalidateTag(
            "written_batches_metadata",
            "max"
        );


        return NextResponse.json({
            success: true,
        });

    }
    catch(error) {

        console.error(
            "HOME REVALIDATION ERROR:",
            error
        );

        return NextResponse.json(
            {
                success:false,
            },
            {
                status:500,
            }
        );

    }
}