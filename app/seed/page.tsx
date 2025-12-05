"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { demoUsers } from "@/lib/demo-users";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SeedPage() {
    const [seeding, setSeeding] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    const seedUsers = async () => {
        setSeeding(true);
        setResults([]);
        const newResults = [];

        for (const user of demoUsers) {
            try {
                // Sign out any current user first
                await signOut(auth);

                // Create user
                const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);

                // Update profile
                await updateProfile(userCredential.user, {
                    displayName: user.displayName,
                    // phoneNumber cannot be updated directly via client SDK without verification usually, skipping
                });

                newResults.push({ email: user.email, status: "success" });
            } catch (error: any) {
                if (error.code === 'auth/email-already-in-use') {
                    newResults.push({ email: user.email, status: "exists" });
                } else {
                    newResults.push({ email: user.email, status: "error", message: error.message });
                }
            }
        }

        // Final sign out
        await signOut(auth);

        setResults(newResults);
        setSeeding(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Seed Demo Users</CardTitle>
                    <CardDescription>
                        Create the standard demo users in your Firebase project.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md text-sm">
                        Warning: This will attempt to create users in your currently connected Firebase project.
                        It will sign out your current session.
                    </div>

                    <Button onClick={seedUsers} disabled={seeding} className="w-full">
                        {seeding ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Seeding Users...
                            </>
                        ) : (
                            "Start Seeding"
                        )}
                    </Button>

                    {results.length > 0 && (
                        <div className="mt-6 space-y-2">
                            <h3 className="font-medium">Results:</h3>
                            {results.map((res, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 border rounded bg-white dark:bg-gray-800">
                                    <span className="text-sm font-mono">{res.email}</span>
                                    <div className="flex items-center gap-2">
                                        {res.status === "success" && (
                                            <span className="text-green-600 flex items-center text-xs">
                                                <CheckCircle className="h-4 w-4 mr-1" /> Created
                                            </span>
                                        )}
                                        {res.status === "exists" && (
                                            <span className="text-yellow-600 flex items-center text-xs">
                                                <CheckCircle className="h-4 w-4 mr-1" /> Already Exists
                                            </span>
                                        )}
                                        {res.status === "error" && (
                                            <span className="text-red-600 flex items-center text-xs">
                                                <XCircle className="h-4 w-4 mr-1" /> {res.message}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
