"use client";


import {
    Sailboat,
    User,
    LogOut
} from "lucide-react";


import {
    signOut
} from "firebase/auth";


import {
    auth
} from "@/lib/firebase";


import {
    useAuth
} from "@/app/context/AuthContext";



interface HeaderProps {

    setShowAuth:
    (show: boolean) => void;

}



export default function Header({

    setShowAuth

}: HeaderProps) {



    const {
        user

    } = useAuth();




    const handleLogout = async () => {


        try {


            if (user) {


                localStorage.removeItem(

                    `navik_profile_${user.uid}`

                );


            }



            await signOut(auth);



        } catch (error) {


            console.error(
                error
            );


        }


    };




    const shortEmail =
        user?.email

            ? user.email.length > 14

                ? user.email.slice(0, 14) + "..."

                : user.email

            : "";




    return (


        <div

            className="
            bg-white
            border
            border-gray-200
            rounded-3xl
            pl-3
            pr-5
            py-4
            md:pl-4
            md:pr-6
            md:py-5
            shadow-sm
            "

        >



            <div

                className="
                flex
                items-center
                justify-between
                "

            >



                {/* LEFT SIDE */}


                <div

                    className="
                    flex
                    items-center
                    gap-2
                    min-w-0
                    "

                >


                    <div

                        className="
                        w-12
                        h-12
                        flex
                        items-center
                        justify-center
                        rotate-[-8deg]
                        flex-shrink-0
                        "

                    >

                        <Sailboat size={30}/>


                    </div>



                    <div

                        className="
                        leading-tight
                        min-w-0
                        "

                    >


                        <h1

                            className="
                            text-xl
                            font-bold
                            tracking-tight
                            truncate
                            "

                        >

                            NAVIK

                        </h1>



                        <p

                            className="
                            text-xs
                            text-gray-500
                            truncate
                            "

                        >

                            Sail towards COC

                        </p>


                    </div>


                </div>





                {/* RIGHT SIDE */}



                {
                    user ?


                    (

                    <div

                        className="
                        flex
                        items-center
                        gap-3
                        flex-shrink-0
                        "

                    >



                        <div

                            className="
                            bg-gray-100
                            px-2
                            py-2
                            rounded-xl
                            w-[80px]
                            "

                        >


                            <p

                                className="
                                text-[9px]
                                text-gray-500
                                leading-none
                                "

                            >

                                Signed in

                            </p>



                            <p

                                className="
                                text-[11px]
                                font-medium
                                truncate
                                "

                            >

                                {shortEmail}

                            </p>



                        </div>




                        <button

                            onClick={handleLogout}

                            className="
                            w-10
                            h-9
                            rounded-2xl
                            bg-black
                            text-white
                            flex
                            items-center
                            justify-center
                            "

                        >

                            <LogOut size={16}/>


                        </button>



                    </div>


                    )

                    :


                    (

                    <button

                        onClick={() => setShowAuth(true)}

                        className="
                        bg-black
                        text-white
                        px-4
                        py-2
                        rounded-xl
                        flex
                        items-center
                        gap-1
                        text-sm
                        font-medium
                        "

                    >

                        <User size={16}/>

                        Login


                    </button>


                    )

                }




            </div>



        </div>


    );


}