"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot, QuerySnapshot, DocumentData, Timestamp } from "firebase/firestore";
import { db, isDemoMode } from "@/lib/firebase";

export interface FuelReading {
    id: string;
    vehicleId: string;
    fuelLevel: number;
    timestamp: Date;
    location?: {
        lat: number;
        lng: number;
    };
    deviceId: string;
}

// Generate mock data for demo mode
function generateMockReadings(vehicleId: string, hours: number = 24): FuelReading[] {
    const readings: FuelReading[] = [];
    const now = Date.now();
    const interval = (hours * 60 * 60 * 1000) / 50; // 50 data points

    for (let i = 0; i < 50; i++) {
        readings.push({
            id: `reading-${vehicleId}-${i}`,
            vehicleId,
            fuelLevel: 50 + Math.sin(i / 5) * 30 + Math.random() * 10,
            timestamp: new Date(now - (49 - i) * interval),
            location: {
                lat: 19.076 + (Math.random() - 0.5) * 0.1,
                lng: 72.8777 + (Math.random() - 0.5) * 0.1,
            },
            deviceId: `ESP32-${vehicleId.split('-')[1]}`,
        });
    }
    return readings;
}

interface UseFuelReadingsOptions {
    vehicleId: string;
    timeRange?: number; // hours
    maxReadings?: number;
}

export function useFuelReadings(options: UseFuelReadingsOptions) {
    const { vehicleId, timeRange = 24, maxReadings = 100 } = options;
    const [readings, setReadings] = useState<FuelReading[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isDemoMode) {
            // Use mock data in demo mode
            const mockReadings = generateMockReadings(vehicleId, timeRange);
            setReadings(mockReadings);
            setLoading(false);
            return;
        }

        if (!vehicleId) {
            setReadings([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const readingsRef = collection(db, "fuelReadings");
        const startTime = Timestamp.fromDate(new Date(Date.now() - timeRange * 60 * 60 * 1000));

        const q = query(
            readingsRef,
            where("vehicleId", "==", vehicleId),
            where("timestamp", ">=", startTime),
            orderBy("timestamp", "desc"),
            limit(maxReadings)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot: QuerySnapshot<DocumentData>) => {
                const readingsData: FuelReading[] = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        vehicleId: data.vehicleId,
                        fuelLevel: data.fuelLevel || 0,
                        timestamp: data.timestamp?.toDate() || new Date(),
                        location: data.location,
                        deviceId: data.deviceId,
                    };
                });
                // Sort by timestamp ascending for chart display
                readingsData.reverse();
                setReadings(readingsData);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching fuel readings:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [vehicleId, timeRange, maxReadings]);

    return { readings, loading, error };
}
