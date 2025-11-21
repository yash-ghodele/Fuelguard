"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Live Fuel Monitoring</span>
                    <div className="flex items-center gap-2">
                        <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select vehicle" />
                            </SelectTrigger>
                            <SelectContent>
                                {vehicles.map((vehicle) => (
                                    <SelectItem key={vehicle.id} value={vehicle.id}>
                                        {vehicle.plateNumber}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(Number(v))}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="6">6 hours</SelectItem>
                                <SelectItem value="12">12 hours</SelectItem>
                                <SelectItem value="24">24 hours</SelectItem>
                                <SelectItem value="48">48 hours</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="fuel"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
