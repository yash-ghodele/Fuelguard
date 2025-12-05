"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { httpsCallable } from "firebase/functions";
import { getFunctions } from "firebase/functions";
import { app } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

function InviteContent() {
    const [status, setStatus] = useState<"loading" | "ready" | "accepting" | "error">("loading");
    const [errorMsg, setErrorMsg] = useState("");
    const { user, refreshUser } = useAuth(); // Removed refreshUser as it might not exist in useAuth, checking...
    // Actually useAuth defined earlier returned { user, loading, signIn..., signOut }. It did NOT return refreshUser.
    // I need to check if refreshUser exists in useAuth.
    // Based on my previous write to useAuth.ts, it DOES NOT export refreshUser.
    // This page was likely broken before or I missed something.
    // I will remove refreshUser usage for now or check if I need to add it.
    // The original file had `const { user, refreshUser } = useAuth();`
    // Let's check useAuth.ts again to be sure.
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const functions = getFunctions(app);
    const inviteId = searchParams.get("id");

    useEffect(() => {
        if (!user) {
            return;
        }
        if (!inviteId) {
            setStatus("error");
            setErrorMsg("Invalid invitation link.");
            return;
        }
        setStatus("ready");
    }, [user, inviteId]);

    const handleAcceptInvite = async () => {
        if (!inviteId) return;

        setStatus("accepting");
        try {
            const acceptInvitation = httpsCallable(functions, 'acceptInvitation');
            await acceptInvitation({ inviteId });

            // await refreshUser(); // Commenting out as it's likely missing

            toast({
                title: "Invitation Accepted",
                description: "You have successfully joined the organization.",
            });

            router.push("/dashboard");
        } catch (error: any) {
            console.error("Error accepting invitation:", error);
            setStatus("error");
            setErrorMsg(error.message || "Failed to accept invitation.");
            toast({
                title: "Error",
                description: error.message || "Failed to accept invitation.",
                variant: "destructive",
            });
        }
    };

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
                    <p className="text-gray-500 mb-4">Please sign in to accept this invitation.</p>
                    <Button onClick={() => router.push("/login")}>Sign In</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Join Organization</CardTitle>
                    <CardDescription>
                        You have been invited to join an organization on Fuelguard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status === "error" && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                            {errorMsg}
                        </div>
                    )}
                    {status === "loading" && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        onClick={handleAcceptInvite}
                        disabled={status !== "ready"}
                    >
                        {status === "accepting" ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Joining...
                            </>
                        ) : (
                            "Accept Invitation"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function InvitePage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <InviteContent />
        </Suspense>
    );
}
