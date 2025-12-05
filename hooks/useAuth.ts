"use client";

import { useState, useEffect } from "react";
import {
    User,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from "firebase/auth";
import { auth, isDemoMode } from "@/lib/firebase";
import { demoUsers } from "@/lib/demo-users";
import { useRouter } from "next/navigation";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (isDemoMode) {
            // Check local storage for demo user
            const demoUser = localStorage.getItem("demo_user");
            if (demoUser) {
                setUser(JSON.parse(demoUser));
            }
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const createMockUser = (provider: string, email?: string) => {
        return {
            uid: `demo-user-${Date.now()}`,
            displayName: provider === "github" ? "GitHub User" : "Demo User",
            email: email || "demo@example.com",
            photoURL: "https://github.com/shadcn.png",
            emailVerified: true,
            isAnonymous: false,
            metadata: {},
            providerData: [],
            refreshToken: "",
            tenantId: null,
            delete: async () => { },
            getIdToken: async () => "mock-token",
            getIdTokenResult: async () => ({
                token: "mock-token",
                signInProvider: provider,
                claims: {},
                authTime: Date.now().toString(),
                issuedAtTime: Date.now().toString(),
                expirationTime: (Date.now() + 3600000).toString(),
            }),
            reload: async () => { },
            toJSON: () => ({}),
            phoneNumber: null,
        };
    };

    const signInWithGoogle = async () => {
        if (isDemoMode) {
            const mockUser: any = createMockUser("google");
            localStorage.setItem("demo_user", JSON.stringify(mockUser));
            setUser(mockUser);
            return;
        }

        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const signInWithGithub = async () => {
        if (isDemoMode) {
            const mockUser: any = createMockUser("github");
            localStorage.setItem("demo_user", JSON.stringify(mockUser));
            setUser(mockUser);
            return;
        }

        try {
            const provider = new GithubAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with GitHub", error);
            throw error;
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        if (isDemoMode) {
            const foundUser = demoUsers.find(u => u.email === email && u.password === password);
            if (foundUser) {
                const mockUser: any = {
                    ...createMockUser("password", email),
                    uid: foundUser.uid,
                    displayName: foundUser.displayName,
                    phoneNumber: foundUser.phoneNumber,
                };
                localStorage.setItem("demo_user", JSON.stringify(mockUser));
                setUser(mockUser);
                return;
            }

            // Fallback for unknown users in demo mode
            const mockUser: any = createMockUser("password", email);
            localStorage.setItem("demo_user", JSON.stringify(mockUser));
            setUser(mockUser);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Error signing in with Email", error);
            throw error;
        }
    };

    const signUpWithEmail = async (email: string, password: string) => {
        if (isDemoMode) {
            const mockUser: any = createMockUser("password", email);
            localStorage.setItem("demo_user", JSON.stringify(mockUser));
            setUser(mockUser);
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Error signing up with Email", error);
            throw error;
        }
    };

    const signOut = async () => {
        if (isDemoMode) {
            localStorage.removeItem("demo_user");
            setUser(null);
            router.push("/login");
            return;
        }

        try {
            await firebaseSignOut(auth);
            router.push("/login");
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return {
        user,
        loading,
        signInWithGoogle,
        signInWithGithub,
        signInWithEmail,
        signUpWithEmail,
        signOut
    };
}
