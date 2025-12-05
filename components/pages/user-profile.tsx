"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, Shield } from "lucide-react"

export default function UserProfile() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full p-2 md:p-4 space-y-4"
        >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-blue-900/50 to-cyan-900/50 p-6 border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-4 border-white/10">
                        <AvatarImage src="/placeholder-user.jpg" alt="Admin" />
                        <AvatarFallback className="text-2xl bg-primary text-primary-foreground">AD</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight text-white">Admin User</h2>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30">Administrator</Badge>
                            <span className="text-blue-200 text-sm">FuelShield System</span>
                        </div>
                    </div>
                </div>
                <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                    Edit Profile
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="glass-card hover-glow">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Manage your personal details and contact info.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="name" defaultValue="Admin User" className="pl-8" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="email" defaultValue="admin@FuelShield.com" className="pl-8" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="phone" defaultValue="+1 (555) 123-4567" className="pl-8" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="location">Location</Label>
                            <div className="relative">
                                <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="location" defaultValue="New York, USA" className="pl-8" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card hover-glow">
                    <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Manage your password and security preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <div className="relative">
                                <Shield className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="current-password" type="password" className="pl-8" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <div className="relative">
                                <Shield className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="new-password" type="password" className="pl-8" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <div className="relative">
                                <Shield className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="confirm-password" type="password" className="pl-8" />
                            </div>
                        </div>
                        <Button className="w-full mt-4">Update Password</Button>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    )
}
