import { Request, Response } from "firebase-functions";
import { db, auth } from "../index";
import { DashboardStats } from "../types";

/**
 * Dashboard API Handler
 */
export async function dashboardApi(req: Request, res: Response) {
    const method = req.method;
    const pathParts = req.path.split("/").filter((p) => p);

    try {
        const token = req.headers.authorization?.split("Bearer ")[1];
        if (!token) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const decodedToken = await auth.verifyIdToken(token);
        const userId = decodedToken.uid;
        const userDoc = await db.collection("users").doc(userId).get();
        const organizationId = userDoc.data()?.organizationId;

        // GET /dashboard/summary - Get dashboard statistics
        if (method === "GET" && pathParts.length === 2 && pathParts[1] === "summary") {
            // Get total vehicles
            const vehiclesSnapshot = await db.collection("vehicles")
                .where("organizationId", "==", organizationId)
                .get();

            const totalVehicles = vehiclesSnapshot.size;
            const onlineVehicles = vehiclesSnapshot.docs.filter(
                (doc) => doc.data().status === "online"
            ).length;

            // Get active alerts
            const alertsSnapshot = await db.collection("alerts")
                .where("organizationId", "==", organizationId)
                .where("status", "==", "active")
                .get();

            // Get recent fuel readings to calculate average
            const recentReadings = await db.collection("fuelReadings")
                .where("organizationId", "==", organizationId)
                .orderBy("timestamp", "desc")
                .limit(100)
                .get();

            let totalFuel = 0;
            let fuelCount = 0;
            recentReadings.docs.forEach((doc) => {
                const data = doc.data();
                if (data.fuelLevel?.percentage) {
                    totalFuel += data.fuelLevel.percentage;
                    fuelCount++;
                }
            });

            const avgFuelLevel = fuelCount > 0 ? Math.round(totalFuel / fuelCount) : 0;

            // Get device health
            const devicesSnapshot = await db.collection("devices")
                .where("organizationId", "==", organizationId)
                .get();

            const deviceHealth = {
                online: 0,
                offline: 0,
                error: 0,
            };

            const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
            devicesSnapshot.docs.forEach((doc) => {
                const data = doc.data();
                const status = data.healthStatus;
                const lastSeen = data.lastSeen || 0;

                if (status === "error") {
                    deviceHealth.error++;
                } else if (lastSeen > fiveMinutesAgo) {
                    deviceHealth.online++;
                } else {
                    deviceHealth.offline++;
                }
            });

            // Get recent activity
            const recentActivity = await db.collection("fuelReadings")
                .where("organizationId", "==", organizationId)
                .orderBy("timestamp", "desc")
                .limit(5)
                .get();

            const activity = await Promise.all(
                recentActivity.docs.map(async (doc) => {
                    const data = doc.data();
                    const vehicleDoc = await db.collection("vehicles").doc(data.vehicleId).get();
                    const vehicleData = vehicleDoc.data();

                    return {
                        vehicleId: data.vehicleId,
                        licensePlate: vehicleData?.licensePlate || "Unknown",
                        event: `Fuel reading: ${data.fuelLevel?.percentage || 0}%`,
                        timestamp: data.timestamp,
                    };
                })
            );

            const stats: DashboardStats = {
                totalVehicles,
                onlineVehicles,
                avgFuelLevel,
                activeAlerts: alertsSnapshot.size,
                recentActivity: activity,
                deviceHealth,
            };

            res.json({ stats });
            return;
        }

        res.status(404).json({ error: "Not found" });
    } catch (error) {
        console.error("Dashboard API error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
