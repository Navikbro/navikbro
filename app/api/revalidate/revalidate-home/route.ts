import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {
    revalidateTag("oral-batches-counters", "max");

    return NextResponse.json({
        success: true,
    });
}