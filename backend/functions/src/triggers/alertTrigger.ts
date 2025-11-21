import * as functions from "firebase-functions";
import { db } from "../index";
import { FuelReading, TheftAlert } from "../types";
import { sendNotification } from "../services/notificationService";

/**
 * Firestore Trigger: Detect fuel theft when new reading is created
 */
export const onFuelReadingCreated = functions.firestore
    .document("fuelReadings/{readingId}")
    .onCreate(async (snapshot, context) => {
        const newReading = snapshot.data() as FuelReading;

        try {
            // Get previous reading for this vehicle
            const previousReadings = await db.collection("fuelReadings")
                .where("vehicleId", "==", newReading.vehicleId)
                .where("timestamp", "<", newReading.timestamp)
                .orderBy("timestamp", "desc")
                .limit(1)
                .get();

            if (previousReadings.empty) {
                // First reading, no comparison possible
                return;
            }

            const previousReading = previousReadings.docs[0].data() as FuelReading;

            // Calculate fuel change
            const fuelDrop = previousReading.fuelLevel.liters - newReading.fuelLevel.liters;
            const percentageDrop = previousReading.fuelLevel.percentage - newReading.fuelLevel.percentage;
            const timeDiff = (newReading.timestamp - previousReading.timestamp) / 1000 / 60; // minutes

            // Theft detection logic
            const THEFT_THRESHOLD = 10; // 10% drop
            const TIME_WINDOW = 5; // 5 minutes

            if (percentageDrop > THEFT_THRESHOLD && timeDiff < TIME_WINDOW) {
                // Potential fuel theft detected
                const severity = percentageDrop > 30 ? "critical" :
                    percentageDrop > 20 ? "high" :
                        percentageDrop > 15 ? "medium" : "low";

                const alertData: Omit<TheftAlert, "id"> = {
                    vehicleId: newReading.vehicleId,
                    deviceId: newReading.deviceId,
                    type: "fuel_theft",
                    fuelLoss: fuelDrop,
                    location: newReading.location,
                    status: "active",
                    severity,
                    detectedAt: newReading.timestamp,
                    organizationId: newReading.organizationId || "",
                };

                const alertRef = await db.collection("alerts").add(alertData);
                console.log(`Theft alert created: ${alertRef.id}`);

                // Send notifications
                await sendNotification({
                    organizationId: alertData.organizationId,
                    type: "alert",
                    title: "Fuel Theft Detected",
                    message: `Vehicle ${newReading.vehicleId}: ${fuelDrop.toFixed(1)}L fuel loss detected`,
                    relatedEntity: {
                        type: "alert",
                        id: alertRef.id,
                    },
                });
            }

            // Tamper detection
            if (newReading.sensors.tamper && !previousReading.sensors.tamper) {
                const alertData: Omit<TheftAlert, "id"> = {
                    vehicleId: newReading.vehicleId,
                    deviceId: newReading.deviceId,
                    type: "tampering",
                    fuelLoss: 0,
                    location: newReading.location,
                    status: "active",
                    severity: "high",
                    detectedAt: newReading.timestamp,
                    organizationId: newReading.organizationId || "",
                };

                const alertRef = await db.collection("alerts").add(alertData);
                console.log(`Tamper alert created: ${alertRef.id}`);

                await sendNotification({
                    organizationId: alertData.organizationId,
                    type: "alert",
                    title: "Tamper Detected",
                    message: `Vehicle ${newReading.vehicleId}: Fuel tank cover opened`,
                    relatedEntity: {
                        type: "alert",
                        id: alertRef.id,
                    },
                });
            }

            // Update device last seen
            await db.collection("devices").doc(newReading.deviceId).update({
                lastSeen: newReading.timestamp,
                healthStatus: "online",
                batteryLevel: newReading.sensors.battery,
                signalStrength: newReading.sensors.signalStrength,
            });

            // Update vehicle status
            await db.collection("vehicles").doc(newReading.vehicleId).update({
                status: "online",
                updatedAt: newReading.timestamp,
            });
        } catch (error) {
            console.error("Error in alert trigger:", error);
        }
    });
