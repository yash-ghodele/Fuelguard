"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings as SettingsIcon, Bell, Shield, Smartphone, Globe } from "lucide-react"

export default function Settings() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full p-2 md:p-4 space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-slate-800/50 to-gray-800/50 p-6 border border-white/10 backdrop-blur-md">
                <div className="p-3 rounded-full bg-slate-500/20 text-slate-400">
                    <SettingsIcon className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                    <p className="text-slate-300">Manage your application preferences and configurations.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="glass-card hover-glow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            <CardTitle>Notifications</CardTitle>
                        </div>
                        <CardDescription>Configure how you receive alerts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="email-alerts">Email Alerts</Label>
                            <Switch id="email-alerts" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="push-notifs">Push Notifications</Label>
                            <Switch id="push-notifs" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="sms-alerts">SMS Alerts</Label>
                            <Switch id="sms-alerts" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card hover-glow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <CardTitle>Privacy & Security</CardTitle>
                        </div>
                        <CardDescription>Manage data sharing and security.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="2fa">Two-Factor Authentication</Label>
                            <Switch id="2fa" />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="data-sharing">Share Usage Data</Label>
                            <Switch id="data-sharing" defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card hover-glow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5 text-primary" />
                            <CardTitle>Device Settings</CardTitle>
                        </div>
                        <CardDescription>Configure default device behaviors.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="update-freq">Update Frequency (seconds)</Label>
                            <Input id="update-freq" type="number" defaultValue="30" />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <Label htmlFor="auto-lock">Auto-Lock Devices</Label>
                            <Switch id="auto-lock" defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card hover-glow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" />
                            <CardTitle>Regional Settings</CardTitle>
                        </div>
                        <CardDescription>Set your language and timezone.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="language">Language</Label>
                            <select id="language" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option>English (US)</option>
                                <option>Spanish</option>
                                <option>French</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <select id="timezone" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option>UTC-5 (Eastern Time)</option>
                                <option>UTC-8 (Pacific Time)</option>
                                <option>UTC+0 (GMT)</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="flex justify-end">
                <Button size="lg">Save Changes</Button>
            </div>
        </motion.div>
    )
}
