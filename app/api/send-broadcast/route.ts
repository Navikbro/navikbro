import {
    NextResponse,
} from "next/server";

import {
    adminMessaging,
} from "@/lib/firebase-admin";


import {
    db,
} from "@/lib/firebase";


import {
    collection,
    getDocs,
    query,
    where,
} from "firebase/firestore";



export async function POST(
    request: Request
) {

    try {


        const {
            title,
            body,
            batch,
        } = await request.json();



        let usersRef;



        if (batch === "all") {

            usersRef =
                collection(
                    db,
                    "users"
                );

        } else {

            usersRef =
                query(
                    collection(
                        db,
                        "users"
                    ),

                    where(
                        "batch",
                        "==",
                        batch
                    )
                );

        }



        const snapshot =
            await getDocs(
                usersRef
            );



        const tokens:string[] = [];



        snapshot.forEach(
            (doc)=>{

                const data =
                    doc.data();


                if (
                    Array.isArray(
                        data.fcmTokens
                    )
                ) {

                    tokens.push(
                        ...data.fcmTokens
                    );

                }

            }
        );



        if (
            tokens.length === 0
        ) {

            return NextResponse.json({

                success:false,

                message:
                    "No FCM tokens found"

            });

        }



        const result =
            await adminMessaging
                .sendEachForMulticast({

                    tokens,


                    notification: {

                        title,

                        body,

                    },

                });



        return NextResponse.json({

            success:true,

            totalUsers:
                tokens.length,


            sent:
                result.successCount,


            failed:
                result.failureCount,

        });



    } catch(error) {


        console.error(
            "Broadcast error:",
            error
        );


        return NextResponse.json(

            {

                success:false,

                error:
                    "Notification sending failed"

            },

            {
                status:500
            }

        );

    }

}