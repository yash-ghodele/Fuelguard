"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings as SettingsIcon, Bell, User, Shield, Moon, Globe } from "lucide-react"

export default function Settings() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            <CardTitle>Profile Settings</CardTitle>
                        </div>
                        <CardDescription>Manage your account details and preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" defaultValue="Admin User" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" defaultValue="admin@fuelguard.com" />
                            </div>
                        </div>
                        <Button>Save Changes</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            <CardTitle>Notifications</CardTitle>
                        </div>
                        <CardDescription>Configure how you receive alerts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Email Notifications</Label>
                                <p className="text-sm text-muted-foreground">Receive daily summaries via email.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>SMS Alerts</Label>
                                <p className="text-sm text-muted-foreground">Get instant text messages for critical theft alerts.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <SettingsIcon className="h-5 w-5 text-primary" />
                            <CardTitle>System Preferences</CardTitle>
                        </div>
                        <CardDescription>Customize your dashboard experience.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <Moon className="h-4 w-4" />
                                    <Label>Dark Mode</Label>
                                </div>
                                <p className="text-sm text-muted-foreground">Toggle dark mode theme.</p>
                            </div>
                            <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    <Label>Language</Label>
                                </div>
                                <p className="text-sm text-muted-foreground">Select your preferred language.</p>
                            </div>
                            <div className="w-[180px]">
                                <Input defaultValue="English" disabled />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    )
}
