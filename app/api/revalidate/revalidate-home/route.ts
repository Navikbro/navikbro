import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {
    revalidateTag("oral_batches_metadata", "max");

    return NextResponse.json({
        success: true,
    });
}