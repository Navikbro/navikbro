"use client";

import {
    onAuthStateChanged,
    User,
} from "firebase/auth";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";


interface AuthContextType {
    user: User | null;
    loading: boolean;
}


const AuthContext =
    createContext<AuthContextType>({
        user: null,
        loading: true,
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



    useEffect(() => {

        const unsubscribe =
            onAuthStateChanged(
                auth,
                (user) => {


                    // Update UI immediately
                    setUser(user);
                    setLoading(false);



                    // Background user profile creation
                    if (user) {


                        const cached =
                            localStorage.getItem(
                                `navik_profile_${user.uid}`
                            );


                        if (!cached) {


                            (async () => {

                                try {


                                    const userRef =
                                        doc(
                                            db,
                                            "users",
                                            user.uid
                                        );


                                    const snapshot =
                                        await getDoc(userRef);



                                    if (!snapshot.exists()) {


                                        await setDoc(
                                            userRef,
                                            {
                                                name:
                                                    user.displayName ||
                                                    "Anonymous",

                                                email:
                                                    user.email || "",

                                                role:
                                                    "user",

                                                subscription:
                                                    "free",

                                                createdAt:
                                                    serverTimestamp(),
                                            }
                                        );

                                    }


                                } catch (error) {


                                    console.error(
                                        "Profile creation failed:",
                                        error
                                    );


                                } finally {


                                    localStorage.setItem(
                                        `navik_profile_${user.uid}`,
                                        "checked"
                                    );


                                }


                            })();

                        }

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
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}



export function useAuth() {

    return useContext(AuthContext);

}