import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

interface Vehicle {
    id: string;
    licensePlate: string;
    make: string;
    model: string;
    year: number;
    tankCapacity: number;
    deviceId?: string;
    status: 'online' | 'offline';
    driver?: string;
}

/**
 * React hook for real-time vehicle data
 */
export function useVehicles() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
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

            // Subscribe to vehicles in organization
            const vehiclesRef = collection(db, 'vehicles');
            const vehiclesQuery = query(
                vehiclesRef,
                where('organizationId', '==', organizationId),
                orderBy('createdAt', 'desc')
            );

            const unsubscribeVehicles = onSnapshot(
                vehiclesQuery,
                (snapshot) => {
                    const vehicleData = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Vehicle[];

                    setVehicles(vehicleData);
                    setLoading(false);
                },
                (err) => {
                    setError(err as Error);
                    setLoading(false);
                }
            );

            return () => unsubscribeVehicles();
        });

        return () => unsubscribeUser();
    }, []);

    return { vehicles, loading, error };
}
