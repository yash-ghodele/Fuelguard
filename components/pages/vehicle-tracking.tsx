"use client"

import { motion } from "framer-motion"
import { VehicleTrackingMap } from "@/components/vehicle-tracking-map"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"

export default function VehicleTracking() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full p-2 md:p-4 space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-blue-900/50 to-indigo-900/50 p-6 border border-white/10 backdrop-blur-md">
                <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                    <MapPin className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Vehicle Tracking</h1>
                    <p className="text-blue-200">Real-time GPS location monitoring of your entire fleet.</p>
                </div>
            </div>

            <Card className="glass-card hover-glow h-[calc(100vh-240px)] min-h-[500px]">
                <CardHeader className="pb-2">
                    <CardTitle>Live Map View</CardTitle>
                </CardHeader>
                <CardContent className="h-full pb-6">
                    <VehicleTrackingMap />
                </CardContent>
            </Card>
        </motion.div>
    )
}
