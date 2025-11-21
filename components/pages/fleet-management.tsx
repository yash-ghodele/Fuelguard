"use client"

import { motion } from "framer-motion"
import VehicleOverviewTable from "@/components/vehicle-overview-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FleetManagement() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">Fleet Management</h1>
            <Card>
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
