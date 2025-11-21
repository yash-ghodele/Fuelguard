"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useAlerts } from "@/hooks/useAlerts";
import { api } from "@/lib/api";
import { useState } from "react";

export function TheftAlertPanel() {
    const { alerts, loading, error } = useAlerts({ status: "active" });
    const [resolvingId, setResolvingId] = useState<string | null>(null);

    const handleResolve = async (alertId: string) => {
        setResolvingId(alertId);
        try {
            await api.alerts.resolve(alertId);
        } catch (error) {
            console.error("Error resolving alert:", error);
        } finally {
            setResolvingId(null);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "critical":
                return "bg-red-500 hover:bg-red-600";
            case "warning":
                return "bg-yellow-500 hover:bg-yellow-600";
            case "info":
                return "bg-blue-500 hover:bg-blue-600";
            default:
                return "bg-gray-500";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "theft":
                return <AlertTriangle className="h-4 w-4" />;
            case "low_fuel":
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <AlertTriangle className="h-4 w-4" />;
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Active Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-pulse text-muted-foreground">Loading alerts...</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Active Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-destructive">Error loading alerts: {error}</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Active Alerts</span>
                    <Badge variant="destructive">{alerts.length}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {alerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                            <p className="text-sm text-muted-foreground">No active alerts</p>
                            <p className="text-xs text-muted-foreground">All systems operating normally</p>
                        </div>
                    ) : (
                        alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className="flex items-start justify-between p-3 rounded-lg border border-border"
                            >
                                <div className="flex items-start gap-3 flex-1">
                                    <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                                        {getTypeIcon(alert.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="text-xs">
                                                {alert.type.replace("_", " ").toUpperCase()}
                                            </Badge>
                                            <Badge className={getSeverityColor(alert.severity)}>
                                                {alert.severity}
                                            </Badge>
                                        </div>
                                        <p className="text-sm font-medium">{alert.message}</p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleResolve(alert.id)}
                                    disabled={resolvingId === alert.id}
                                >
                                    {resolvingId === alert.id ? "Resolving..." : "Resolve"}
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
