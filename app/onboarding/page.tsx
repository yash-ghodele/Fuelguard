"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { httpsCallable } from "firebase/functions";
import { getFunctions } from "firebase/functions";
import { app } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function OnboardingPage() {
    const [orgName, setOrgName] = useState("");
    const [loading, setLoading] = useState(false);
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const functions = getFunctions(app);

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orgName.trim()) return;

        setLoading(true);
        try {
            const createOrganization = httpsCallable(functions, 'createOrganization');
            await createOrganization({ name: orgName, plan: "free" });

            // Force token refresh to get new claims
            await refreshUser();

            toast({
                title: "Organization Created",
                description: "You have successfully created your organization.",
            });

            router.push("/dashboard");
        } catch (error: any) {
            console.error("Error creating organization:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create organization. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create Organization</CardTitle>
                    <CardDescription>
                        Set up your organization to start managing your fleet.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleCreateOrg}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="orgName">Organization Name</Label>
                            <Input
                                id="orgName"
                                placeholder="Acme Logistics"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating..." : "Create Organization"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
