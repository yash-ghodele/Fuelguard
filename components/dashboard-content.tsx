"use client"

import { Suspense } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SummaryCards } from "@/components/summary-cards"
import { VehicleSelector } from "@/components/vehicle-selector"
import { VehicleOverviewTable } from "@/components/vehicle-overview-table"
import { LiveFuelGraph } from "@/components/live-fuel-graph"
import { VehicleTrackingMap } from "@/components/vehicle-tracking-map"
import { TheftAlertPanel } from "@/components/theft-alert-panel"
import { DeviceHealthPanel } from "@/components/device-health-panel"
import { NotificationsPanel } from "@/components/notifications-panel"

interface DashboardContentProps {
  selectedVehicle: string | null
  setSelectedVehicle: (vehicleId: string | null) => void
}

export default function DashboardContent({ selectedVehicle, setSelectedVehicle }: DashboardContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full p-2 md:p-4 space-y-4"
    >
      <div className="grid gap-4 md:gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-6 border border-white/10 backdrop-blur-md">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back, Admin</h2>
            <p className="text-indigo-200">Here's what's happening with your fleet today.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
            <span className="text-sm font-medium text-emerald-400">System Operational</span>
          </div>
        </div>

        <SummaryCards />

        <div className="grid gap-4 md:gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-1">
              <VehicleSelector selectedVehicle={selectedVehicle} setSelectedVehicle={setSelectedVehicle} />
            </div>
            <div className="lg:col-span-2">
              <Card className="glass-card hover-glow">
                <CardHeader className="pb-2">
                  <CardTitle>Vehicle Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <VehicleOverviewTable />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card className="glass-card hover-glow">
            <CardHeader className="pb-2">
              <CardTitle>Live Fuel Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading chart...</div>}>
                <LiveFuelGraph />
              </Suspense>
            </CardContent>
          </Card>

          <Card className="glass-card hover-glow">
            <CardHeader className="pb-2">
              <CardTitle>Real-Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading map...</div>}>
                <VehicleTrackingMap />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="glass-card hover-glow">
            <CardHeader className="pb-2">
              <CardTitle>Theft Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <TheftAlertPanel />
            </CardContent>
          </Card>

          <Card className="glass-card hover-glow">
            <CardHeader className="pb-2">
              <CardTitle>Device Health</CardTitle>
            </CardHeader>
            <CardContent>
              <DeviceHealthPanel />
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationsPanel />
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
