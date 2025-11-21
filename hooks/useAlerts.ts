"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot, QuerySnapshot, DocumentData } from "firebase/firestore";
import { db, isDemoMode } from "@/lib/firebase";
import { useAuth } from "./useAuth";

export interface Alert {
    id: string;
    vehicleId: string;
    type: "theft" | "low_fuel" | "device_offline" | "maintenance";
    severity: "critical" | "warning" | "info";
    message: string;
    timestamp: Date;
    status: "active" | "resolved";
    resolvedAt?: Date;
    resolvedBy?: string;
}

// Mock data for demo mode
const MOCK_ALERTS: Alert[] = [
    {
        id: "alert-001",
        vehicleId: "veh-001",
        type: "theft",
        severity: "critical",
        message: "Sudden fuel drop detected: 75% to 45% in 5 minutes",
        timestamp: new Date(Date.now() - 1800000),
        status: "active",
    },
    {
        id: "alert-002",
        vehicleId: "veh-002",
        type: "low_fuel",
        severity: "warning",
        message: "Fuel level below 20%",
        timestamp: new Date(Date.now() - 3600000),
        status: "active",
    },
    {
        id: "alert-003",
        vehicleId: "veh-003",
        type: "device_offline",
        severity: "warning",
        message: "Device offline for more than 1 hour",
        timestamp: new Date(Date.now() - 7200000),
        status: "resolved",
        resolvedAt: new Date(Date.now() - 3600000),
        resolvedBy: "admin@fuelguard.com",
    },
];

interface UseAlertsOptions {
    vehicleId?: string;
    status?: "active" | "resolved";
}

export function useAlerts(options: UseAlertsOptions = {}) {
    const { orgId } = useAuth();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isDemoMode) {
            // Filter mock data based on options
            let filteredAlerts = MOCK_ALERTS;
            if (options.vehicleId) {
                filteredAlerts = filteredAlerts.filter(a => a.vehicleId === options.vehicleId);
            }
            if (options.status) {
                filteredAlerts = filteredAlerts.filter(a => a.status === options.status);
            }
            setAlerts(filteredAlerts);
            setLoading(false);
            return;
        }

        if (!orgId) {
            setAlerts([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const alertsRef = collection(db, "alerts");
        let q = query(alertsRef, where("organizationId", "==", orgId), orderBy("timestamp", "desc"));

        if (options.vehicleId) {
            q = query(q, where("vehicleId", "==", options.vehicleId));
        }
        if (options.status) {
            q = query(q, where("status", "==", options.status));
        }

        const unsubscribe = onSnapshot(
            q,
            (snapshot: QuerySnapshot<DocumentData>) => {
                const alertsData: Alert[] = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        vehicleId: data.vehicleId,
                        type: data.type,
                        severity: data.severity,
                        message: data.message,
                        timestamp: data.timestamp?.toDate() || new Date(),
                        status: data.status,
                        resolvedAt: data.resolvedAt?.toDate(),
                        resolvedBy: data.resolvedBy,
                    };
                });
                setAlerts(alertsData);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching alerts:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [orgId, options.vehicleId, options.status]);

    return { alerts, loading, error };
}
