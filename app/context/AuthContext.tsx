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
import { auth } from "@/lib/firebase";

import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

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
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    const userRef = doc(db, "users", user.uid);

                    const snapshot = await getDoc(userRef);

                    if (!snapshot.exists()) {
                        await setDoc(userRef, {
                            name: user.displayName || "Anonymous",
                            email: user.email || "",
                            role: "user",
                            subscription: "free",
                            createdAt: serverTimestamp(),
                        });
                    }
                }

                setUser(user);
                setLoading(false);
            });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, loading }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}