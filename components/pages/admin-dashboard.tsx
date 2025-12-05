"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { demoUsers } from "@/lib/demo-users"
import { Plus, Trash2, Edit } from "lucide-react"

export default function AdminDashboard() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full p-2 md:p-4 space-y-4"
        >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-red-900/50 to-orange-900/50 p-6 border border-white/10 backdrop-blur-md">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-white">Admin Panel</h2>
                    <p className="text-red-200">Manage users, roles, and system configurations.</p>
                </div>
                <Button className="bg-white text-red-900 hover:bg-red-100">
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>

            <Card className="glass-card hover-glow">
                <CardHeader className="pb-2">
                    <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {demoUsers.map((user) => (
                                    <TableRow key={user.uid}>
                                        <TableCell className="font-medium">{user.displayName}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`
                          ${user.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
                          ${user.role === 'sender' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}
                          ${user.role === 'receiver' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                        `}
                                            >
                                                {user.role?.toUpperCase() || 'USER'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{user.phoneNumber}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
