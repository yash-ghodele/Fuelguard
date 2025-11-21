import { Request, Response } from "firebase-functions";
import { db, auth } from "../index";
import { registerDeviceSchema, updateDeviceConfigSchema, sendCommandSchema } from "../utils/validators";
import { Device, DeviceCommand } from "../types";

/**
 * Devices API Handler
 */
export async function devicesApi(req: Request, res: Response) {
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

        // GET /devices - List all devices
        if (method === "GET" && pathParts.length === 1) {
            const snapshot = await db.collection("devices")
                .where("organizationId", "==", organizationId)
                .orderBy("lastSeen", "desc")
                .get();

            const devices = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            res.json({ devices });
            return;
        }

        // GET /devices/:id - Get device details
        if (method === "GET" && pathParts.length === 2) {
            const deviceId = pathParts[1];
            const doc = await db.collection("devices").doc(deviceId).get();

            if (!doc.exists || doc.data()?.organizationId !== organizationId) {
                res.status(404).json({ error: "Device not found" });
                return;
            }

            res.json({ device: { id: doc.id, ...doc.data() } });
            return;
        }

        // POST /devices - Register new device
        if (method === "POST" && pathParts.length === 1) {
            const validation = registerDeviceSchema.safeParse(req.body);
            if (!validation.success) {
                res.status(400).json({ error: "Invalid input", details: validation.error });
                return;
            }

            const deviceData: Omit<Device, "id"> = {
                serialNumber: validation.data.serialNumber,
                type: "esp32",
                firmwareVersion: validation.data.firmwareVersion,
                healthStatus: "offline",
                lastSeen: Date.now(),
                batteryLevel: 0,
                signalStrength: 0,
                configuration: validation.data.configuration || {
                    readingInterval: 30,
                    alertThreshold: 10,
                    gsmApn: "internet",
                },
                organizationId,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const docRef = await db.collection("devices").add(deviceData);
            res.status(201).json({ device: { id: docRef.id, ...deviceData } });
            return;
        }

        // PUT /devices/:id/config - Update device configuration
        if (method === "PUT" && pathParts.length === 3 && pathParts[2] === "config") {
            const deviceId = pathParts[1];
            const doc = await db.collection("devices").doc(deviceId).get();

            if (!doc.exists || doc.data()?.organizationId !== organizationId) {
                res.status(404).json({ error: "Device not found" });
                return;
            }

            const validation = updateDeviceConfigSchema.safeParse(req.body);
            if (!validation.success) {
                res.status(400).json({ error: "Invalid input", details: validation.error });
                return;
            }

            const currentConfig = doc.data()?.configuration || {};
            const newConfig = { ...currentConfig, ...validation.data };

            await db.collection("devices").doc(deviceId).update({
                configuration: newConfig,
                updatedAt: Date.now(),
            });

            res.json({ device: { id: deviceId, ...doc.data(), configuration: newConfig } });
            return;
        }

        // POST /devices/:id/command - Send command to device
        if (method === "POST" && pathParts.length === 3 && pathParts[2] === "command") {
            const deviceId = pathParts[1];
            const doc = await db.collection("devices").doc(deviceId).get();

            if (!doc.exists || doc.data()?.organizationId !== organizationId) {
                res.status(404).json({ error: "Device not found" });
                return;
            }

            const validation = sendCommandSchema.safeParse(req.body);
            if (!validation.success) {
                res.status(400).json({ error: "Invalid input", details: validation.error });
                return;
            }

            const commandData: Omit<DeviceCommand, "id"> = {
                deviceId,
                command: validation.data.command,
                payload: validation.data.payload,
                status: "pending",
                createdAt: Date.now(),
                createdBy: userId,
            };

            const cmdRef = await db.collection("commands").add(commandData);
            res.status(201).json({ command: { id: cmdRef.id, ...commandData } });
            return;
        }

        // GET /devices/:id/health - Get device health status
        if (method === "GET" && pathParts.length === 3 && pathParts[2] === "health") {
            const deviceId = pathParts[1];
            const doc = await db.collection("devices").doc(deviceId).get();

            if (!doc.exists || doc.data()?.organizationId !== organizationId) {
                res.status(404).json({ error: "Device not found" });
                return;
            }

            const deviceData = doc.data();
            const lastSeen = deviceData?.lastSeen || 0;
            const isOnline = (Date.now() - lastSeen) < 5 * 60 * 1000; // 5 minutes

            const health = {
                status: isOnline ? "online" : "offline",
                lastSeen,
                batteryLevel: deviceData?.batteryLevel || 0,
                signalStrength: deviceData?.signalStrength || 0,
                uptime: Date.now() - (deviceData?.createdAt || Date.now()),
            };

            res.json({ health });
            return;
        }

        res.status(404).json({ error: "Not found" });
    } catch (error) {
        console.error("Devices API error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
