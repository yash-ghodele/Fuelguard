"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onIdTokenChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    orgId: string | null;
    role: string | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    orgId: null,
    role: null,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
    refreshUser: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [orgId, setOrgId] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (user) => {
            if (user) {
                const tokenResult = await user.getIdTokenResult();
                setOrgId((tokenResult.claims.orgId as string) || null);
                setRole((tokenResult.claims.role as string) || null);
                setUser(user);
            } else {
                setUser(null);
                setOrgId(null);
                setRole(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            router.push("/");
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    const refreshUser = async () => {
        if (auth.currentUser) {
            await auth.currentUser.getIdToken(true);
        }
    };

    return (
        <AuthContext.Provider value= {{ user, orgId, role, loading, signInWithGoogle, signOut, refreshUser }
}>
    { children }
    </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
