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
        } =
        await request.json();



        let usersQuery;


        if(batch === "all") {

            usersQuery =
                collection(
                    db,
                    "users"
                );


        } else {


            usersQuery =
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
                usersQuery
            );



        const tokens:string[] = [];



        snapshot.forEach(
            (doc)=>{

                const data =
                    doc.data();


                if(data.fcmTokens) {

                    tokens.push(
                        ...data.fcmTokens
                    );

                }

            }
        );



        if(tokens.length === 0) {


            return NextResponse.json({

                success:false,

                message:
                "No notification tokens found"

            });

        }



        const response =
            await adminMessaging
            .sendEachForMulticast({

                tokens,


                notification:{

                    title,

                    body,

                }

            });



        return NextResponse.json({

            success:true,

            sent:
            response.successCount,


            failed:
            response.failureCount,

        });



    } catch(error) {


        console.error(error);


        return NextResponse.json(

            {
                success:false,
                error:"Notification failed"
            },

            {
                status:500
            }

        );

    }

}