"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, QuerySnapshot, DocumentData } from "firebase/firestore";
import { db, isDemoMode } from "@/lib/firebase";
import { useAuth } from "./useAuth";

export interface Vehicle {
    id: string;
    plateNumber: string;
    model: string;
    status: "online" | "offline";
    fuelLevel: number;
    location?: {
        lat: number;
        lng: number;
        address?: string;
    };
    lastUpdate: Date;
    deviceId: string;
}

// Mock data for demo mode
const MOCK_VEHICLES: Vehicle[] = [
    {
        id: "veh-001",
        plateNumber: "XYZ-123",
        model: "Truck Alpha",
        status: "online",
        fuelLevel: 75,
        location: { lat: 19.076, lng: 72.8777, address: "Mumbai, MH" },
        lastUpdate: new Date(),
        deviceId: "ESP32-001",
    },
    {
        id: "veh-002",
        plateNumber: "ABC-456",
        model: "Truck Beta",
        status: "online",
        fuelLevel: 45,
        location: { lat: 28.7041, lng: 77.1025, address: "Delhi, DL" },
        lastUpdate: new Date(),
        deviceId: "ESP32-002",
    },
    {
        id: "veh-003",
        plateNumber: "MNO-789",
        model: "Truck Gamma",
        status: "offline",
        fuelLevel: 90,
        location: { lat: 12.9716, lng: 77.5946, address: "Bangalore, KA" },
        lastUpdate: new Date(Date.now() - 3600000),
        deviceId: "ESP32-003",
    },
];

export function useVehicles() {
    const { orgId } = useAuth();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isDemoMode) {
            // Use mock data in demo mode
            setVehicles(MOCK_VEHICLES);
            setLoading(false);
            return;
        }

        if (!orgId) {
            setVehicles([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const vehiclesRef = collection(db, "vehicles");
        const q = query(vehiclesRef, where("organizationId", "==", orgId));

        const unsubscribe = onSnapshot(
            q,
            (snapshot: QuerySnapshot<DocumentData>) => {
                const vehiclesData: Vehicle[] = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        plateNumber: data.plateNumber,
                        model: data.model,
                        status: data.status,
                        fuelLevel: data.fuelLevel || 0,
                        location: data.location,
                        lastUpdate: data.lastUpdate?.toDate() || new Date(),
                        deviceId: data.deviceId,
                    };
                });
                setVehicles(vehiclesData);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching vehicles:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [orgId]);

    return { vehicles, loading, error };
}
