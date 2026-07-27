"use client";

import { onAuthStateChanged, User } from "firebase/auth";
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
    role: "admin" | "user";
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    role: "user",
});

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<"admin" | "user">("user");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);

            if (!user) {
                setRole("user");
                setLoading(false);
                return;
            }

            try {
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

                    setRole("user");
                } else {
                    const data = snapshot.data();

                    setRole(
                        data.role === "admin"
                            ? "admin"
                            : "user"
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to load user profile:",
                    error
                );

                setRole("user");
            } finally {
                setLoading(false);
            }
        });

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