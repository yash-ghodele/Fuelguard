"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Wifi, Battery, Signal } from "lucide-react";
import { api } from "@/lib/api";
import { isDemoMode } from "@/lib/firebase";

interface DeviceHealth {
    id: string;
    deviceId: string;
    vehicleId: string;
    status: "online" | "offline";
    battery: number;
    signal: number;
    lastPing: Date;
}

const MOCK_DEVICES: DeviceHealth[] = [
    {
        id: "dev-001",
        deviceId: "ESP32-001",
        vehicleId: "veh-001",
        status: "online",
        battery: 85,
        signal: 92,
        lastPing: new Date(),
    },
    {
        id: "dev-002",
        deviceId: "ESP32-002",
        vehicleId: "veh-002",
        status: "online",
        battery: 72,
        signal: 88,
        lastPing: new Date(),
    },
    {
        id: "dev-003",
        deviceId: "ESP32-003",
        vehicleId: "veh-003",
        status: "offline",
        battery: 45,
        signal: 0,
        lastPing: new Date(Date.now() - 3600000),
    },
];

export function DeviceHealthPanel() {
    const [devices, setDevices] = useState<DeviceHealth[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDevices = async () => {
            if (isDemoMode) {
                setDevices(MOCK_DEVICES);
                setLoading(false);
                return;
            }

            try {
                const response = await api.devices.list();
                if (response.success && response.data) {
                    setDevices(response.data);
                }
            } catch (error) {
                console.error("Error fetching devices:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDevices();
    }, []);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Device Health</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-pulse text-muted-foreground">Loading devices...</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Device Health</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {devices.map((device) => (
                        <div key={device.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${device.status === "online" ? "bg-green-500/10" : "bg-gray-500/10"}`}>
                                    <Activity className={`h-4 w-4 ${device.status === "online" ? "text-green-500" : "text-gray-500"}`} />
                                </div>
                                <div>
                                    <div className="font-medium">{device.deviceId}</div>
                                    <div className="text-xs text-muted-foreground">
                                        Last ping: {new Date(device.lastPing).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <Battery className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{device.battery}%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Signal className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{device.signal}%</span>
                                </div>
                                <Badge variant={device.status === "online" ? "default" : "secondary"}>
                                    {device.status}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
