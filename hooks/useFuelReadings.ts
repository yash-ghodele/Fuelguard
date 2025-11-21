import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface FuelReading {
    id: string;
    vehicleId: string;
    deviceId: string;
    timestamp: number;
    fuelLevel: {
        liters: number;
        percentage: number;
    };
    location: {
        lat: number;
        lon: number;
        speed: number;
        satellites: number;
    } | null;
    sensors: {
        ultrasonic: { distance: number; valid: boolean };
        float: { value: number; valid: boolean };
        gps: { fix: boolean; satellites: number; speed: number };
        tamper: boolean;
        battery: number;
        signalStrength: number;
    };
}

/**
 * React hook for real-time fuel readings
 */
export function useFuelReadings(vehicleId: string, maxReadings = 100) {
    const [readings, setReadings] = useState<FuelReading[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!vehicleId) {
            setLoading(false);
            return;
        }

        const readingsRef = collection(db, 'fuelReadings');
        const readingsQuery = query(
            readingsRef,
            where('vehicleId', '==', vehicleId),
            orderBy('timestamp', 'desc'),
            limit(maxReadings)
        );

        const unsubscribe = onSnapshot(
            readingsQuery,
            (snapshot) => {
                const readingData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as FuelReading[];

                setReadings(readingData);
                setLoading(false);
            },
            (err) => {
                setError(err as Error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [vehicleId, maxReadings]);

    // Get latest reading
    const latestReading = readings.length > 0 ? readings[0] : null;

    return { readings, latestReading, loading, error };
}
