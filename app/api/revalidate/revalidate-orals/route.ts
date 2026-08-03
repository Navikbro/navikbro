import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
    const { categories } = await req.json();

    if (!Array.isArray(categories)) {
        return NextResponse.json(
            { error: "Invalid categories" },
            { status: 400 }
        );
    }

    for (const category of categories) {
        revalidateTag(`oral-${category}`, "max");
        revalidateTag(`oral-${category}-meta`, "max");
    }

    return NextResponse.json({
        success: true,
    });
}