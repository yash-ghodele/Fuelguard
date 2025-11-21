"use client"

import { motion } from "framer-motion"
import TheftAlertPanel from "@/components/theft-alert-panel"

export default function TheftAlerts() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">Theft Alerts</h1>
            <TheftAlertPanel />
        </motion.div>
    )
}
