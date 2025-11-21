"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation } from "lucide-react";
import { useVehicles } from "@/hooks/useVehicles";

export function VehicleTrackingMap() {
    const { vehicles, loading, error } = useVehicles();

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Vehicle Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-pulse text-muted-foreground">Loading map...</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Vehicle Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-destructive">Error loading map: {error}</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Vehicle Tracking</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4 h-[400px] flex items-center justify-center">
                        <div className="text-center">
                            <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Interactive map view</p>
                            <p className="text-xs text-muted-foreground">Showing {vehicles.length} vehicles</p>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        {vehicles.map((vehicle) => (
                            <div
                                key={vehicle.id}
                                className="flex items-center justify-between p-3 rounded-lg border"
                            >
                                <div className="flex items-center gap-3">
                                    <Navigation className="h-4 w-4 text-primary" />
                                    <div>
                                        <div className="font-medium">{vehicle.plateNumber}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {vehicle.location?.address || "Location unavailable"}
                                        </div>
                                    </div>
                                </div>
                                <Badge variant={vehicle.status === "online" ? "default" : "secondary"}>
                                    {vehicle.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
