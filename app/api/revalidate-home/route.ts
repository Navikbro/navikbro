import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {
    revalidateTag("home-stats", "max");

    return NextResponse.json({
        success: true,
    });
}