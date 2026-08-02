import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";


export async function POST(
    request: NextRequest
) {

    try {

        const {
            category
        } = await request.json();


        if (!category) {

            return NextResponse.json(
                {
                    success:false,
                    error:"Category missing",
                },
                {
                    status:400,
                }
            );

        }


        const normalizedCategory =
            category
                .trim()
                .toLowerCase();



        revalidateTag(
            `written-${normalizedCategory}`,
            "max"
        );


        return NextResponse.json({
            success:true,
        });


    } catch(error) {

        console.error(error);


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