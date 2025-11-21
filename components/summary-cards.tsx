"use client"

import { useEffect, useState } from "react"
import { Car, Droplet, ShieldAlert, Clock, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"

interface DashboardStats {
  totalVehicles: number
  avgFuelLevel: number
  activeAlerts: number
  onlineVehicles: number
}

// Template data shown on initial load
const TEMPLATE_DATA: DashboardStats = {
  totalVehicles: 42,
  avgFuelLevel: 67,
  activeAlerts: 3,
  onlineVehicles: 38,
}

export default function SummaryCards() {
  const [stats, setStats] = useState<DashboardStats>(TEMPLATE_DATA)
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [cachedData, setCachedData] = useState<DashboardStats | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response: any = await api.dashboard.summary()
      const newStats = {
        totalVehicles: response.stats.totalVehicles,
        avgFuelLevel: Math.round(response.stats.avgFuelLevel),
        activeAlerts: response.stats.activeAlerts,
        onlineVehicles: response.stats.onlineVehicles,
      }
      setStats(newStats)
      setCachedData(newStats)
      setLastUpdated(new Date())
    } catch (error: any) {
      console.error("Failed to load dashboard stats:", error)
      // Fallback to template data on error
      setStats(TEMPLATE_DATA)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoRefresh) {
      // Fetch immediately when turned on
      fetchData()

      // Then fetch every 30 seconds
      const interval = setInterval(fetchData, 30000)
      return () => clearInterval(interval)
    } else if (cachedData) {
      // Show cached data when auto-refresh is off
      setStats(cachedData)
    }
  }, [autoRefresh])

  const handleToggle = (checked: boolean) => {
    setAutoRefresh(checked)
    if (!checked && cachedData) {
      // When turning off, show last cached data
      setStats(cachedData)
    }
  }

  const handleManualRefresh = () => {
    fetchData()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={handleToggle} />
            <Label htmlFor="auto-refresh" className="cursor-pointer">
              Auto-refresh {autoRefresh ? "ON" : "OFF"}
            </Label>
          </div>
          {!autoRefresh && (
            <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}
        </div>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {loading && !autoRefresh ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="flex flex-row items-center justify-between p-6">
                <div className="h-12 w-24 animate-pulse bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
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
      )}
    </div>
  )
}
