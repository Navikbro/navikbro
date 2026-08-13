import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

const VALID_CATEGORIES = [
    "fn3",
    "fn4b",
    "fn5",
    "fn6",
];

export async function POST(
    req: NextRequest
) {
    try {
        const body = await req.json();

        const categories = body.categories;

        if (!Array.isArray(categories)) {
            return NextResponse.json(
                {
                    error:
                        "categories must be an array",
                },
                {
                    status: 400,
                }
            );
        }

        const normalizedCategories =
            categories
                .map((category) =>
                    String(category)
                        .trim()
                        .toLowerCase()
                )
                .filter((category) =>
                    VALID_CATEGORIES.includes(
                        category
                    )
                );

        if (
            normalizedCategories.length ===
            0
        ) {
            return NextResponse.json(
                {
                    error:
                        "No valid categories provided.",
                },
                {
                    status: 400,
                }
            );
        }

        const uniqueCategories =
            Array.from(
                new Set(
                    normalizedCategories
                )
            );

        for (const category of uniqueCategories) {
            revalidateTag(
                `oral-topics-${category}`,
                "max"
            );
        }

        return NextResponse.json({
            success: true,
            categories:
                uniqueCategories,
        });
    } catch (error) {
        console.error(
            "Failed to revalidate oral topic cache:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Failed to publish oral topics.",
            },
            {
                status: 500,
            }
        );
    }
}