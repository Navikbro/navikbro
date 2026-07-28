"use client";

import {
    onAuthStateChanged,
    User,
    signOut,
} from "firebase/auth";

import {
    doc,
    getDoc,
} from "firebase/firestore";

import {
    db,
} from "@/lib/firebase";

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
    createUserProfile,
    updateUserLogin,
    getUserProfile,
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


                        const userRef =
                            doc(
                                db,
                                "users",
                                firebaseUser.uid
                            );


                        const userSnap =
                            await getDoc(userRef);


                        if (
                            userSnap.exists() &&
                            userSnap.data().isBlocked === true
                        ) {

                            await signOut(auth);

                            setUser(null);

                            setRole("student");

                            setLoading(false);

                            return;

                        }

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




                        /*
                         Create user profile
                         if first login

                         Otherwise update
                         login statistics
                        */


                        const profile =
                            await createUserProfile(
                                {

                                    uid:
                                        firebaseUser.uid,


                                    displayName:
                                        firebaseUser.displayName,


                                    email:
                                        firebaseUser.email,


                                    photoURL:
                                        firebaseUser.photoURL,

                                }
                            );

                        const userProfile =
                            await getUserProfile(
                                firebaseUser.uid
                            );


                        if (
                            userProfile?.isBlocked === true
                        ) {

                            await signOut(auth);

                            setUser(null);

                            setRole("student");

                            setLoading(false);

                            return;

                        }



                        if (profile) {


                            await updateUserLogin(
                                firebaseUser.uid
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