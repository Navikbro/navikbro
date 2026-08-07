import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";


export async function POST(req: NextRequest) {

    const {
        categories,
        mmds,
    } = await req.json();


    if (!categories?.length) {

        return NextResponse.json(
            {
                error: "Categories required",
            },
            {
                status: 400,
            }
        );

    }


    const tags:string[] = [];


    for (const category of categories) {

        const normalizedCategory =
            category.trim().toLowerCase();


        // category metadata
        revalidateTag(
            `oral-${normalizedCategory}-meta`,
            "max"
        );


        tags.push(
            `oral-${normalizedCategory}-meta`
        );


        // question cache + mmd metadata
        if (mmds?.length) {

            for (const mmd of mmds) {

                const normalizedMmd =
                    mmd.trim();


                revalidateTag(
                    `oral-${normalizedCategory}-${normalizedMmd}`,
                    "max"
                );


                revalidateTag(
                    `oral-${normalizedCategory}-${normalizedMmd}-meta`,
                    "max"
                );


                tags.push(
                    `oral-${normalizedCategory}-${normalizedMmd}`
                );


                tags.push(
                    `oral-${normalizedCategory}-${normalizedMmd}-meta`
                );

            }

        }

    }


    return NextResponse.json({
        success:true,
        tags,
    });

}