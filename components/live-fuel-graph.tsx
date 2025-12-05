"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useFuelReadings } from "@/hooks/useFuelReadings";
import { useVehicles } from "@/hooks/useVehicles";
import { useState } from "react";

export function LiveFuelGraph() {
    const { vehicles } = useVehicles();
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || "veh-001");
    const [timeRange, setTimeRange] = useState<number>(24);

    const { readings, loading, error } = useFuelReadings({
        vehicleId: selectedVehicleId,
        timeRange,
    });

    const chartData = useMemo(() => {
        return readings.map((reading) => ({
            time: new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            fuel: Math.round(reading.fuelLevel),
        }));
    }, [readings]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Live Fuel Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-pulse text-muted-foreground">Loading fuel data...</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Live Fuel Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-destructive">Error loading fuel data: {error}</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="glass-card border-none bg-gradient-to-br from-slate-900/50 to-slate-800/50">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="text-indigo-100">Live Fuel Monitoring</span>
                    <div className="flex items-center gap-2">
                        <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                            <SelectTrigger className="w-[180px] bg-slate-800/50 border-white/10 text-indigo-100">
                                <SelectValue placeholder="Select vehicle" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-indigo-100">
                                {vehicles.map((vehicle) => (
                                    <SelectItem key={vehicle.id} value={vehicle.id} className="focus:bg-indigo-500/20 focus:text-indigo-100">
                                        {vehicle.plateNumber}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(Number(v))}>
                            <SelectTrigger className="w-[120px] bg-slate-800/50 border-white/10 text-indigo-100">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-indigo-100">
                                <SelectItem value="6" className="focus:bg-indigo-500/20 focus:text-indigo-100">6 hours</SelectItem>
                                <SelectItem value="12" className="focus:bg-indigo-500/20 focus:text-indigo-100">12 hours</SelectItem>
                                <SelectItem value="24" className="focus:bg-indigo-500/20 focus:text-indigo-100">24 hours</SelectItem>
                                <SelectItem value="48" className="focus:bg-indigo-500/20 focus:text-indigo-100">48 hours</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis
                                dataKey="time"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                domain={[0, 100]}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#ffffff20', color: '#f1f5f9' }}
                                itemStyle={{ color: '#8b5cf6' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="fuel"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorFuel)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
