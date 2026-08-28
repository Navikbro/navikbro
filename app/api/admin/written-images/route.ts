import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

import { verifyAdmin } from "@/lib/authentication/verifyAdmin";

export async function POST(request: NextRequest) {
    try {
        // Only Firebase admins can upload
        await verifyAdmin(request);

        const formData = await request.formData();

        const file = formData.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No image file provided.",
                },
                { status: 400 }
            );
        }

        // Only images
        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only image files are allowed.",
                },
                { status: 400 }
            );
        }

        // 4 MB limit
        const MAX_SIZE = 4 * 1024 * 1024;

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Image must be smaller than 4 MB.",
                },
                { status: 400 }
            );
        }

        const extension =
            file.name.split(".").pop()?.toLowerCase() || "jpg";

        const pathname =
            `written-images/${crypto.randomUUID()}.${extension}`;

        const blob = await put(
            pathname,
            file,
            {
                access: "public",
                addRandomSuffix: false,
                contentType: file.type,
            }
        );

        return NextResponse.json({
            success: true,
            url: blob.url,
            pathname: blob.pathname,
        });

    } catch (error) {
        console.error(
            "[Written Image Upload]",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Image upload failed.",
            },
            { status: 500 }
        );
    }
}