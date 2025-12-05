"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Truck, Droplets, AlertTriangle, Activity, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { isDemoMode } from "@/lib/firebase";

interface SummaryData {
    totalVehicles: number;
    avgFuelLevel: number;
    activeAlerts: number;
    onlineDevices: number;
}

const TEMPLATE_DATA: SummaryData = {
    totalVehicles: 42,
    avgFuelLevel: 67,
    activeAlerts: 3,
    onlineDevices: 38,
};

export function SummaryCards() {
    const [data, setData] = useState<SummaryData>(TEMPLATE_DATA);
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchData = async () => {
        if (isDemoMode) {
            // In demo mode, use template data with slight variations
            setData({
                totalVehicles: TEMPLATE_DATA.totalVehicles + Math.floor(Math.random() * 3),
                avgFuelLevel: TEMPLATE_DATA.avgFuelLevel + Math.floor(Math.random() * 10 - 5),
                activeAlerts: TEMPLATE_DATA.activeAlerts + Math.floor(Math.random() * 2),
                onlineDevices: TEMPLATE_DATA.onlineDevices + Math.floor(Math.random() * 5 - 2),
            });
            setLastUpdated(new Date());
            return;
        }

        setLoading(true);
        try {
            const response = await api.dashboard.summary();
            if (response.success && response.data) {
                setData(response.data as SummaryData);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error("Error fetching dashboard summary:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (autoRefresh) {
            fetchData();
            const interval = setInterval(fetchData, 30000); // 30 seconds
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const handleManualRefresh = () => {
        fetchData();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="auto-refresh"
                            checked={autoRefresh}
                            onCheckedChange={setAutoRefresh}
                        />
                        <Label htmlFor="auto-refresh" className="cursor-pointer">
                            Auto-refresh {autoRefresh ? "ON" : "OFF"}
                        </Label>
                    </div>
                    {!autoRefresh && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleManualRefresh}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    )}
                </div>
                {lastUpdated && (
                    <p className="text-sm text-muted-foreground">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]">
                    <div className="absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-white/10 blur-2xl" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100">Total Vehicles</CardTitle>
                        <Truck className="h-4 w-4 text-blue-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.totalVehicles}</div>
                        <p className="text-xs text-blue-100/80 mt-1">
                            {data.onlineDevices} currently active
                        </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-600 to-emerald-400 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]">
                    <div className="absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-white/10 blur-2xl" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-100">Avg Fuel Level</CardTitle>
                        <Droplets className="h-4 w-4 text-emerald-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.avgFuelLevel}%</div>
                        <Progress value={data.avgFuelLevel} className="mt-2 h-1.5 bg-emerald-900/20 [&>div]:bg-white" />
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-amber-500 to-orange-400 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]">
                    <div className="absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-white/10 blur-2xl" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-100">Active Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.activeAlerts}</div>
                        <p className="text-xs text-amber-100/80 mt-1">
                            {data.activeAlerts > 0 ? "Requires attention" : "All clear"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-purple-600 to-indigo-400 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)]">
                    <div className="absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-white/10 blur-2xl" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100">System Health</CardTitle>
                        <Activity className="h-4 w-4 text-purple-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{Math.round((data.onlineDevices / data.totalVehicles) * 100)}%</div>
                        <p className="text-xs text-purple-100/80 mt-1">
                            {data.onlineDevices} devices online
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
