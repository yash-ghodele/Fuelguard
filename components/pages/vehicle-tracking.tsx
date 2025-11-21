"use client"

import { motion } from "framer-motion"
import VehicleTrackingMap from "@/components/vehicle-tracking-map"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function VehicleTracking() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">Vehicle Tracking</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Real-Time Fleet Location</CardTitle>
                </CardHeader>
                <CardContent>
                    <VehicleTrackingMap />
                </CardContent>
            </Card>
        </motion.div>
    )
}
