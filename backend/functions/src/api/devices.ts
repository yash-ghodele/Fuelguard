import { Request, Response } from "express";
import { db } from "../index";
import { registerDeviceSchema, updateDeviceConfigSchema, sendCommandSchema } from "../utils/validators";
import { Device, DeviceCommand } from "../types";
import { verifyAuth, AuthRequest } from "../utils/middleware";
import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";

// JWT secret for device tokens (in production, use Firebase Functions config)
const DEVICE_JWT_SECRET = process.env.DEVICE_JWT_SECRET || "your-secret-key-change-in-production";

/**
 * Devices API Handler
 */
export async function devicesApi(req: Request, res: Response) {
    // Run middleware
    await new Promise<void>((resolve) => {
        verifyAuth(req, res, () => resolve());
    });

    if (res.headersSent) return;

    const user = (req as AuthRequest).user;
    if (!user || !user.orgId) {
        res.status(403).json({ error: "Forbidden: Organization access required" });
        return;
    }

    const organizationId = user.orgId;
    const method = req.method;
    const pathParts = req.path.split("/").filter((p) => p);

    try {
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

        // POST /devices/provision - Provision new device with JWT credentials
        if (method === "POST" && pathParts.length === 2 && pathParts[1] === "provision") {
            // Check for admin/manager role
            if (user.role !== "admin" && user.role !== "manager") {
                res.status(403).json({ error: "Forbidden: Insufficient permissions" });
                return;
            }

            const validation = registerDeviceSchema.safeParse(req.body);
            if (!validation.success) {
                res.status(400).json({ error: "Invalid input", details: validation.error });
                return;
            }

            // Generate device ID
            const deviceId = `dev_${crypto.randomBytes(16).toString("hex")}`;

            // Generate JWT token for device
            const deviceToken = jwt.sign(
                {
                    deviceId,
                    orgId: organizationId,
                    type: "device",
                },
                DEVICE_JWT_SECRET,
                { noTimestamp: false } // No expiration
            );

            // Hash token for storage (we store hash, not the token itself)
            const tokenHash = crypto.createHash("sha256").update(deviceToken).digest("hex");

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
                vehicleId: req.body.vehicleId, // Optional vehicle link
                organizationId,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            await db.collection("devices").doc(deviceId).set(deviceData);

            // Store token hash separately (for revocation checking)
            await db.collection("deviceCredentials").doc(deviceId).set({
                tokenHash,
                createdAt: Date.now(),
                revoked: false,
            });

            res.status(201).json({
                device: { id: deviceId, ...deviceData },
                credentials: {
                    deviceId,
                    token: deviceToken,
                    warning: "Save this token securely. It will not be shown again.",
                },
            });
            return;
        }

        // POST /devices/:id/rotate-credentials - Rotate device JWT
        if (method === "POST" && pathParts.length === 3 && pathParts[2] === "rotate-credentials") {
            if (user.role !== "admin" && user.role !== "manager") {
                res.status(403).json({ error: "Forbidden: Insufficient permissions" });
                return;
            }

            const deviceId = pathParts[1];
            const doc = await db.collection("devices").doc(deviceId).get();

            if (!doc.exists || doc.data()?.organizationId !== organizationId) {
                res.status(404).json({ error: "Device not found" });
                return;
            }

            // Generate new JWT token
            const deviceToken = jwt.sign(
                {
                    deviceId,
                    orgId: organizationId,
                    type: "device",
                },
                DEVICE_JWT_SECRET
            );

            const tokenHash = crypto.createHash("sha256").update(deviceToken).digest("hex");

            await db.collection("deviceCredentials").doc(deviceId).set({
                tokenHash,
                createdAt: Date.now(),
                revoked: false,
            });

            res.json({
                credentials: {
                    deviceId,
                    token: deviceToken,
                    warning: "Save this token securely. It will not be shown again.",
                },
            });
            return;
        }

        // POST /devices/:id/revoke - Revoke device access
        if (method === "POST" && pathParts.length === 3 && pathParts[2] === "revoke") {
            if (user.role !== "admin") {
                res.status(403).json({ error: "Forbidden: Admin access required" });
                return;
            }

            const deviceId = pathParts[1];
            const doc = await db.collection("devices").doc(deviceId).get();

            if (!doc.exists || doc.data()?.organizationId !== organizationId) {
                res.status(404).json({ error: "Device not found" });
                return;
            }

            await db.collection("deviceCredentials").doc(deviceId).update({
                revoked: true,
                revokedAt: Date.now(),
            });

            await db.collection("devices").doc(deviceId).update({
                healthStatus: "error",
                updatedAt: Date.now(),
            });

            res.json({ success: true, message: "Device credentials revoked" });
            return;
        }

        // POST /devices - Register new device (legacy, use /provision instead)
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
                createdBy: user.uid,
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

/**
 * Verify device JWT token (for MQTT bridge)
 */
export async function verifyDeviceToken(token: string): Promise<{ deviceId: string; orgId: string } | null> {
    try {
        const decoded = jwt.verify(token, DEVICE_JWT_SECRET) as { deviceId: string; orgId: string; type: string };

        if (decoded.type !== "device") {
            return null;
        }

        // Check if token is revoked
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        const credDoc = await db.collection("deviceCredentials").doc(decoded.deviceId).get();

        if (!credDoc.exists || credDoc.data()?.revoked || credDoc.data()?.tokenHash !== tokenHash) {
            return null;
        }

        return { deviceId: decoded.deviceId, orgId: decoded.orgId };
    } catch (error) {
        console.error("Device token verification failed:", error);
        return null;
    }
}
