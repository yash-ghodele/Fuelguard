import { Request, Response } from "express";
import { db } from "../index";
import { createVehicleSchema, updateVehicleSchema } from "../utils/validators";
import { Vehicle } from "../types";
import { verifyAuth, AuthRequest } from "../utils/middleware";

/**
 * Vehicles API Handler
 */
export async function vehiclesApi(req: Request, res: Response) {
    // Run middleware manually since we are in a single function handler
    // In a real Express app, this would be app.use(verifyAuth)
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
        // GET /vehicles - List all vehicles
        if (method === "GET" && pathParts.length === 1) {
            const snapshot = await db.collection("vehicles")
                .where("organizationId", "==", organizationId)
                .orderBy("createdAt", "desc")
                .get();

            const vehicles = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            res.json({ vehicles });
            return;
        }

        // GET /vehicles/:id - Get vehicle details
        if (method === "GET" && pathParts.length === 2) {
            const vehicleId = pathParts[1];
            const doc = await db.collection("vehicles").doc(vehicleId).get();

            if (!doc.exists || doc.data()?.organizationId !== organizationId) {
                res.status(404).json({ error: "Vehicle not found" });
                return;
            }

            res.json({ vehicle: { id: doc.id, ...doc.data() } });
            return;
        }

        // POST /vehicles - Create vehicle
        if (method === "POST" && pathParts.length === 1) {
            // Check for manager/admin role
            if (user.role !== "admin" && user.role !== "manager") {
                res.status(403).json({ error: "Forbidden: Insufficient permissions" });
                return;
            }

            const validation = createVehicleSchema.safeParse(req.body);
            if (!validation.success) {
                res.status(400).json({ error: "Invalid input", details: validation.error });
                return;
            }

            const vehicleData: Omit<Vehicle, "id"> = {
                ...validation.data,
                status: "offline",
                organizationId,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const docRef = await db.collection("vehicles").add(vehicleData);
            res.status(201).json({ vehicle: { id: docRef.id, ...vehicleData } });
            return;
        }

        // PUT /vehicles/:id - Update vehicle
        if (method === "PUT" && pathParts.length === 2) {
            // Check for manager/admin role
            if (user.role !== "admin" && user.role !== "manager") {
                res.status(403).json({ error: "Forbidden: Insufficient permissions" });
                return;
            }

            const vehicleId = pathParts[1];
            const doc = await db.collection("vehicles").doc(vehicleId).get();

            if (!doc.exists || doc.data()?.organizationId !== organizationId) {
                res.status(404).json({ error: "Vehicle not found" });
                return;
            }

            const validation = updateVehicleSchema.safeParse(req.body);
            if (!validation.success) {
                res.status(400).json({ error: "Invalid input", details: validation.error });
                return;
            }

            const updateData = {
                ...validation.data,
                updatedAt: Date.now(),
            };

            await db.collection("vehicles").doc(vehicleId).update(updateData);
            res.json({ vehicle: { id: vehicleId, ...doc.data(), ...updateData } });
            return;
        }

        // DELETE /vehicles/:id - Delete vehicle
        if (method === "DELETE" && pathParts.length === 2) {
            // Check for admin role
            if (user.role !== "admin") {
                res.status(403).json({ error: "Forbidden: Admin access required" });
                return;
            }

            const vehicleId = pathParts[1];
            const doc = await db.collection("vehicles").doc(vehicleId).get();

            if (!doc.exists || doc.data()?.organizationId !== organizationId) {
                res.status(404).json({ error: "Vehicle not found" });
                return;
            }

            await db.collection("vehicles").doc(vehicleId).delete();
            res.json({ success: true });
            return;
        }

        // GET /vehicles/:id/fuel-history - Get fuel reading history
        if (method === "GET" && pathParts.length === 3 && pathParts[2] === "fuel-history") {
            const vehicleId = pathParts[1];

            // Verify vehicle belongs to org first
            const vehicleDoc = await db.collection("vehicles").doc(vehicleId).get();
            if (!vehicleDoc.exists || vehicleDoc.data()?.organizationId !== organizationId) {
                res.status(404).json({ error: "Vehicle not found" });
                return;
            }

            const limit = parseInt(req.query.limit as string) || 100;
            const startTime = parseInt(req.query.startTime as string) || (Date.now() - 7 * 24 * 60 * 60 * 1000);

            const snapshot = await db.collection("fuelReadings")
                .where("vehicleId", "==", vehicleId)
                .where("timestamp", ">=", startTime)
                .orderBy("timestamp", "desc")
                .limit(limit)
                .get();

            const readings = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            res.json({ readings });
            return;
        }

        res.status(404).json({ error: "Not found" });
    } catch (error) {
        console.error("Vehicles API error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
