import { Request, Response } from "firebase-functions";
import { db, auth } from "../index";
import { createVehicleSchema, updateVehicleSchema } from "../utils/validators";
import { Vehicle } from "../types";

/**
 * Vehicles API Handler
 */
export async function vehiclesApi(req: Request, res: Response) {
    const method = req.method;
    const pathParts = req.path.split("/").filter((p) => p);

    try {
        // Verify authentication
        const token = req.headers.authorization?.split("Bearer ")[1];
        if (!token) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const decodedToken = await auth.verifyIdToken(token);
        const userId = decodedToken.uid;

        // Get user to check organization
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            res.status(403).json({ error: "User not found" });
            return;
        }
        const organizationId = userDoc.data()?.organizationId;

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
