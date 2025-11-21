import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

interface Alert {
    id: string;
    vehicleId: string;
    deviceId: string;
    type: 'fuel_theft' | 'tampering' | 'sensor_error';
    fuelLoss: number;
    location: { lat: number; lon: number } | null;
    status: 'active' | 'resolved' | 'false_positive';
    severity: 'low' | 'medium' | 'high' | 'critical';
    detectedAt: number;
    resolvedAt?: number;
}

/**
 * React hook for real-time alerts
 */
export function useAlerts(vehicleId?: string, activeOnly = true) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }

        // Get user's organization
        const userRef = collection(db, 'users');
        const userQuery = query(userRef, where('__name__', '==', user.uid));

        const unsubscribeUser = onSnapshot(userQuery, (userSnapshot) => {
            if (userSnapshot.empty) {
                setLoading(false);
                return;
            }

            const userData = userSnapshot.docs[0].data();
            const organizationId = userData.organizationId;

            // Build alerts query
            const alertsRef = collection(db, 'alerts');
            let alertsQuery = query(
                alertsRef,
                where('organizationId', '==', organizationId)
            );

            if (vehicleId) {
                alertsQuery = query(alertsQuery, where('vehicleId', '==', vehicleId));
            }

            if (activeOnly) {
                alertsQuery = query(alertsQuery, where('status', '==', 'active'));
            }

            alertsQuery = query(
                alertsQuery,
                orderBy('detectedAt', 'desc'),
                limit(50)
            );

            const unsubscribeAlerts = onSnapshot(
                alertsQuery,
                (snapshot) => {
                    const alertData = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Alert[];

                    setAlerts(alertData);
                    setLoading(false);
                },
                (err) => {
                    setError(err as Error);
                    setLoading(false);
                }
            );

            return () => unsubscribeAlerts();
        });

        return () => unsubscribeUser();
    }, [vehicleId, activeOnly]);

    return { alerts, loading, error };
}
