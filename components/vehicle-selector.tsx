"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Droplets } from "lucide-react";
import { useVehicles } from "@/hooks/useVehicles";

export function VehicleSelector() {
    const { vehicles, loading, error } = useVehicles();
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Fleet Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-pulse text-muted-foreground">Loading vehicles...</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Fleet Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-destructive">Error loading vehicles: {error}</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Fleet Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {vehicles.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-8">
                            No vehicles found. Add vehicles to get started.
                        </div>
                    ) : (
                        vehicles.map((vehicle) => (
                            <div
                                key={vehicle.id}
                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedVehicleId === vehicle.id
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                    }`}
                                onClick={() => setSelectedVehicleId(vehicle.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-primary/10">
                                        <Truck className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <div className="font-medium">{vehicle.plateNumber}</div>
                                        <div className="text-sm text-muted-foreground">{vehicle.model}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 text-sm">
                                        <Droplets className="h-4 w-4 text-blue-500" />
                                        <span className="font-medium">{vehicle.fuelLevel}%</span>
                                    </div>

                                    {vehicle.location && (
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span className="text-xs">{vehicle.location.address || "Unknown"}</span>
                                        </div>
                                    )}

                                    <Badge
                                        variant={vehicle.status === "online" ? "default" : "secondary"}
                                        className={
                                            vehicle.status === "online"
                                                ? "bg-green-500 hover:bg-green-600"
                                                : "bg-gray-500"
                                        }
                                    >
                                        {vehicle.status}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
