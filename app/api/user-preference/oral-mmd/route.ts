import { NextResponse } from "next/server";

import {
    adminAuth
} from "@/lib/firebase/firebase-admin";

import {
    getOralMmdPreference,
    updateOralMmdPreference,
} from "@/services/users/userPreference.service";



async function getUserFromRequest(req: Request){

    const token =
        req.headers
        .get("Authorization")
        ?.replace("Bearer ", "");


    if(!token){

        throw new Error("Unauthorized");

    }


    return adminAuth.verifyIdToken(token);

}



export async function GET(req: Request){

    try{

        const decoded =
            await getUserFromRequest(req);


        const preference =
            await getOralMmdPreference(
                decoded.uid
            );


        return NextResponse.json(
            preference
        );


    }catch(error){

        return NextResponse.json(
            {
                error:"Unauthorized"
            },
            {
                status:401
            }
        );

    }

}



export async function POST(req: Request){

    try{

        const decoded =
            await getUserFromRequest(req);


        const body =
            await req.json();


        const result =
            await updateOralMmdPreference(
                decoded.uid,
                body.oralMmd
            );


        return NextResponse.json(
            result
        );


    }catch(error){

        return NextResponse.json(
            {
                error:"Unauthorized"
            },
            {
                status:401
            }
        );

    }

}