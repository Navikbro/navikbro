import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

const CATEGORY_MAP: Record<string, string> = {
    safety: "fn3",
    fn3: "fn3",
    motor: "fn4b",
    fn4b: "fn4b",
    electrical: "fn5",
    fn5: "fn5",
    mep: "fn6",
    fn6: "fn6",
};

export async function POST(req: NextRequest) {
    const body = await req.json();

    const rawCategories = Array.isArray(body.categories)
        ? body.categories
        : [];

    const categories = [
        ...new Set(
            rawCategories.map(
                (c: string) =>
                    CATEGORY_MAP[c.toLowerCase()] ?? c.toLowerCase()
            )
        ),
    ];

    for (const category of categories) {
        revalidateTag(`oral-${category}`, "max");
        revalidateTag(`oral-${category}-meta`, "max");
    }

    return NextResponse.json({ success: true });
}