"use client";

import {
    onAuthStateChanged,
    User,
    signOut,
} from "firebase/auth";

import {
    requestNotificationPermission,
} from "@/lib/firebaseMessaging";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    auth,
} from "@/lib/firebase";


import {
    initializeUser,
    saveFCMToken,
} from "@/services/userService";


interface AuthContextType {

    user: User | null;

    loading: boolean;

    role: "admin" | "student";

}



const AuthContext =
    createContext<AuthContextType>({
        user: null,

        loading: true,

        role: "student",
    });




export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {


    const [user, setUser] =
        useState<User | null>(null);


    const [loading, setLoading] =
        useState(true);


    const [role, setRole] =
        useState<"admin" | "student">(
            "student"
        );




    useEffect(() => {


        const unsubscribe =
            onAuthStateChanged(
                auth,
                async (firebaseUser) => {


                    setUser(firebaseUser);



                    if (!firebaseUser) {


                        setRole("student");

                        setLoading(false);

                        return;

                    }



                    try {


                        const token =
                            await firebaseUser
                                .getIdTokenResult(true);



                        const isAdmin =
                            token.claims.admin === true;



                        setRole(
                            isAdmin
                                ? "admin"
                                : "student"
                        );

                        const profile =
                            await initializeUser({
                                uid: firebaseUser.uid,
                                displayName: firebaseUser.displayName,
                                email: firebaseUser.email,
                                photoURL: firebaseUser.photoURL,
                            });

                        if (profile.isBlocked) {

                            await signOut(auth);

                            setUser(null);

                            setRole("student");

                            setLoading(false);

                            return;

                        }


                        const fcmToken =
                            await requestNotificationPermission();


                        if (fcmToken) {

                            console.log(
                                "FCM TOKEN:",
                                fcmToken
                            );


                            await saveFCMToken(
                                firebaseUser.uid,
                                fcmToken
                            );

                        }




                    } catch (error) {


                        console.error(
                            "Authentication loading failed:",
                            error
                        );


                        setRole("student");


                    } finally {


                        setLoading(false);

                    }

                }
            );



        return unsubscribe;


    }, []);





    return (

        <AuthContext.Provider

            value={{

                user,

                loading,

                role,

            }}

        >

            {children}

        </AuthContext.Provider>

    );

}





export function useAuth() {

    return useContext(AuthContext);

}