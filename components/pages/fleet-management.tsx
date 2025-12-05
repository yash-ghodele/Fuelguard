"use client"

import { motion } from "framer-motion"
import { VehicleOverviewTable } from "@/components/vehicle-overview-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck } from "lucide-react"

export default function FleetManagement() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full p-2 md:p-4 space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-emerald-900/50 to-teal-900/50 p-6 border border-white/10 backdrop-blur-md">
                <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400">
                    <Truck className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Fleet Management</h1>
                    <p className="text-emerald-200">Comprehensive overview of your vehicle fleet status.</p>
                </div>
            </div>

            <Card className="glass-card hover-glow">
                <CardHeader>
                    <CardTitle>Fleet Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <VehicleOverviewTable />
                </CardContent>
            </Card>
        </motion.div>
    )
}
