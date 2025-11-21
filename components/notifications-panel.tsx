"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { isDemoMode } from "@/lib/firebase";

interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    type: "info" | "warning" | "success";
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: "notif-001",
        title: "Fuel Alert",
        message: "Vehicle XYZ-123 fuel level dropped below 20%",
        timestamp: new Date(Date.now() - 1800000),
        read: false,
        type: "warning",
    },
    {
        id: "notif-002",
        title: "Device Online",
        message: "ESP32-002 reconnected successfully",
        timestamp: new Date(Date.now() - 3600000),
        read: false,
        type: "success",
    },
    {
        id: "notif-003",
        title: "System Update",
        message: "Dashboard updated with new features",
        timestamp: new Date(Date.now() - 7200000),
        read: true,
        type: "info",
    },
];

export function NotificationsPanel() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (isDemoMode) {
                setNotifications(MOCK_NOTIFICATIONS);
                setLoading(false);
                return;
            }

            try {
                const response = await api.notifications.list();
                if (response.success && response.data) {
                    setNotifications(response.data);
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const handleMarkRead = async (id: string) => {
        try {
            await api.notifications.markRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.notifications.markAllRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-pulse text-muted-foreground">Loading notifications...</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <Badge variant="destructive">{unreadCount}</Badge>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button size="sm" variant="outline" onClick={handleMarkAllRead}>
                            Mark all read
                        </Button>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {notifications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`flex items-start justify-between p-3 rounded-lg border ${!notification.read ? "bg-primary/5 border-primary/20" : ""
                                    }`}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">{notification.title}</span>
                                        {!notification.read && (
                                            <Badge variant="default" className="h-5">New</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{new Date(notification.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>

                                {!notification.read && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleMarkRead(notification.id)}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
