"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Droplets, Shield, TrendingUp, Github, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
    const { user, loading, signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user && !loading) {
            router.push("/dashboard");
        }
    }, [user, loading, router]);

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await signInWithEmail(email, password);
        } catch (err: any) {
            setError(err.message || "Failed to sign in");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await signUpWithEmail(email, password);
        } catch (err: any) {
            setError(err.message || "Failed to sign up");
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                    <p className="mt-4 text-muted-foreground animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url('/login-bg.jpg')",
                }}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10 px-4"
            >
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/20 backdrop-blur-md border border-primary/50 flex items-center justify-center shadow-lg shadow-primary/20">
                            <Droplets className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">FuelShield</h1>
                    </div>
                    <p className="text-gray-200 text-lg font-light">IoT Fuel Monitoring & Theft Prevention</p>
                </div>

                <Card className="glass-card border-white/10 shadow-2xl shadow-black/50">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                        <CardDescription className="text-center text-gray-400">Sign in to access your fleet dashboard</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Tabs defaultValue="signin" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6 bg-black/20 border border-white/5">
                                <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-white">Sign In</TabsTrigger>
                                <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-white">Sign Up</TabsTrigger>
                            </TabsList>

                            <TabsContent value="signin">
                                <form onSubmit={handleEmailSignIn} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="glass-input bg-black/20 border-white/10 text-white placeholder:text-gray-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="glass-input bg-black/20 border-white/10 text-white"
                                        />
                                    </div>
                                    {error && <p className="text-sm text-red-400 bg-red-900/20 p-2 rounded border border-red-900/50">{error}</p>}
                                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" disabled={isLoading}>
                                        {isLoading ? "Signing in..." : "Sign In with Email"}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="signup">
                                <form onSubmit={handleEmailSignUp} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email</Label>
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            placeholder="m@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="glass-input bg-black/20 border-white/10 text-white placeholder:text-gray-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Password</Label>
                                        <Input
                                            id="signup-password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="glass-input bg-black/20 border-white/10 text-white"
                                        />
                                    </div>
                                    {error && <p className="text-sm text-red-400 bg-red-900/20 p-2 rounded border border-red-900/50">{error}</p>}
                                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" disabled={isLoading}>
                                        {isLoading ? "Creating account..." : "Create Account"}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-transparent px-2 text-gray-400 backdrop-blur-sm">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white" onClick={async () => {
                                setIsLoading(true);
                                setError(null);
                                try {
                                    await signInWithGoogle();
                                } catch (err: any) {
                                    if (err.code !== 'auth/popup-closed-by-user') {
                                        setError(err.message || "Failed to sign in with Google");
                                    }
                                } finally {
                                    setIsLoading(false);
                                }
                            }} disabled={isLoading}>
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Google
                            </Button>
                            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white" onClick={async () => {
                                setIsLoading(true);
                                setError(null);
                                try {
                                    await signInWithGithub();
                                } catch (err: any) {
                                    if (err.code !== 'auth/popup-closed-by-user') {
                                        setError(err.message || "Failed to sign in with GitHub");
                                    }
                                } finally {
                                    setIsLoading(false);
                                }
                            }} disabled={isLoading}>
                                <Github className="mr-2 h-4 w-4" />
                                GitHub
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 border-t border-white/10 pt-6">
                        <div className="w-full space-y-3 text-sm text-gray-400">
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <Shield className="h-5 w-5 text-green-400" />
                                <span>Real-time theft detection</span>
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <TrendingUp className="h-5 w-5 text-blue-400" />
                                <span>Live fuel monitoring</span>
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <Droplets className="h-5 w-5 text-purple-400" />
                                <span>Fleet management dashboard</span>
                            </div>
                        </div>
                    </CardFooter>
                </Card>

                <p className="text-center text-xs text-gray-400 mt-6">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </motion.div>
        </div>
    );
}
