"use client"

import { useEffect, useState } from "react"
import { Car, Droplet, ShieldAlert, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"

interface DashboardStats {
  totalVehicles: number
  avgFuelLevel: number
  activeAlerts: number
  onlineVehicles: number
}

export default function SummaryCards() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    avgFuelLevel: 0,
    activeAlerts: 0,
    onlineVehicles: 0,
  })
  const [loading, setLoading] = useState(true)
  const [useMockData] = useState(true) // Set to false when backend is ready

  useEffect(() => {
    if (useMockData) {
      // Mock data for development
      setStats({
        totalVehicles: 42,
        avgFuelLevel: 67,
        activeAlerts: 3,
        onlineVehicles: 38,
      })
      setLoading(false)
    } else {
      // Real API call
      api.dashboard
        .summary()
        .then((response: any) => {
          setStats({
            totalVehicles: response.stats.totalVehicles,
            avgFuelLevel: Math.round(response.stats.avgFuelLevel),
            activeAlerts: response.stats.activeAlerts,
            onlineVehicles: response.stats.onlineVehicles,
          })
          setLoading(false)
        })
        .catch((error: any) => {
          console.error("Failed to load dashboard stats:", error)
          // Fallback to mock data on error
          setStats({
            totalVehicles: 42,
            avgFuelLevel: 67,
            activeAlerts: 3,
            onlineVehicles: 38,
          })
          setLoading(false)
        })
    }
  }, [useMockData])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-row items-center justify-between p-6">
              <div className="h-12 w-24 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex flex-row items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Vehicles</p>
            <p className="text-2xl font-bold">{stats.totalVehicles}</p>
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Car className="h-6 w-6 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-row items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Avg. Fuel Level</p>
            <p className="text-2xl font-bold">{stats.avgFuelLevel}%</p>
          </div>
          <div className="rounded-full bg-blue-500/10 p-3">
            <Droplet className="h-6 w-6 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-row items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
            <p className="text-2xl font-bold">{stats.activeAlerts}</p>
          </div>
          <div className="rounded-full bg-red-500/10 p-3">
            <ShieldAlert className="h-6 w-6 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-row items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Online Vehicles</p>
            <p className="text-2xl font-bold">{stats.onlineVehicles}</p>
          </div>
          <div className="rounded-full bg-green-500/10 p-3">
            <Clock className="h-6 w-6 text-green-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
