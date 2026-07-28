"use client";

import {
    useState,
} from "react";


export default function AdminNotificationsPage() {


    const [title, setTitle] =
        useState("");


    const [message, setMessage] =
        useState("");


    const [audience, setAudience] =
        useState("all");


    const [loading, setLoading] =
        useState(false);


    const [result, setResult] =
        useState("");



    async function sendNotification() {


        if (!title || !message) {

            setResult(
                "Please fill all fields"
            );

            return;

        }


        try {

            setLoading(true);

            setResult("");



            const response =
                await fetch(
                    "/api/send-broadcast",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },


                        body:
                            JSON.stringify({

                                title,

                                body:
                                    message,

                                batch:
                                    audience,

                            }),

                    }
                );



            const data =
                await response.json();



            if (data.success) {

                setResult(
                    `Sent: ${data.sent}, Failed: ${data.failed}`
                );

            } else {

                setResult(
                    data.message ||
                    "Failed"
                );

            }



        } catch(error) {


            console.error(error);


            setResult(
                "Something went wrong"
            );


        } finally {

            setLoading(false);

        }

    }




    return (

        <div className="p-6 max-w-xl">


            <h1 className="text-2xl font-bold">
                Send Notification
            </h1>



            <div className="mt-6 space-y-4">


                <div>

                    <label>
                        Title
                    </label>


                    <input

                        value={title}

                        onChange={
                            (e)=>
                            setTitle(
                                e.target.value
                            )
                        }

                        className="
                        mt-1
                        w-full
                        rounded-lg
                        border
                        p-3
                        "

                    />

                </div>




                <div>

                    <label>
                        Message
                    </label>


                    <textarea

                        value={message}

                        onChange={
                            (e)=>
                            setMessage(
                                e.target.value
                            )
                        }


                        className="
                        mt-1
                        w-full
                        rounded-lg
                        border
                        p-3
                        h-32
                        "

                    />

                </div>




                <div>


                    <label>
                        Send To
                    </label>


                    <select

                        value={audience}

                        onChange={
                            (e)=>
                            setAudience(
                                e.target.value
                            )
                        }


                        className="
                        mt-1
                        w-full
                        rounded-lg
                        border
                        p-3
                        "

                    >

                        <option value="all">
                            All Students
                        </option>


                        <option value="FN3">
                            FN3
                        </option>


                        <option value="FN4B-FN6">
                            FN4B-FN6
                        </option>


                        <option value="FN5">
                            FN5
                        </option>


                    </select>


                </div>




                <button

                    onClick={
                        sendNotification
                    }


                    disabled={
                        loading
                    }


                    className="
                    rounded-lg
                    bg-blue-600
                    px-5
                    py-3
                    text-white
                    "

                >

                    {
                        loading
                        ? "Sending..."
                        : "Send"
                    }

                </button>




                {
                    result && (

                        <p className="mt-4">

                            {result}

                        </p>

                    )
                }



            </div>


        </div>

    );

}