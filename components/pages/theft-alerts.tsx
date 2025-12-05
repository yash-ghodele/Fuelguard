"use client"

import { motion } from "framer-motion"
import { TheftAlertPanel } from "@/components/theft-alert-panel"
import { ShieldAlert } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function TheftAlerts() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full p-2 md:p-4 space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-red-900/50 to-orange-900/50 p-6 border border-white/10 backdrop-blur-md">
                <div className="p-3 rounded-full bg-red-500/20 text-red-400">
                    <ShieldAlert className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Theft Alerts</h1>
                    <p className="text-red-200">Monitor and respond to security incidents in real-time.</p>
                </div>
            </div>

            <Card className="glass-card hover-glow">
                <CardContent className="p-6">
                    <TheftAlertPanel />
                </CardContent>
            </Card>
        </motion.div>
    )
}
