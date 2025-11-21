import { Request, Response } from "firebase-functions";
import { db, auth } from "../index";
import { alertsQuerySchema, resolveAlertSchema } from "../utils/validators";

/**
 * Alerts API Handler
 */
export async function alertsApi(req: Request, res: Response) {
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

        // GET /alerts - List alerts with filters
        if (method === "GET" && pathParts.length === 1) {
            const validation = alertsQuerySchema.safeParse(req.query);
            if (!validation.success) {
                res.status(400).json({ error: "Invalid query parameters" });
                return;
            }

            let query: FirebaseFirestore.Query = db.collection("alerts")
                .where("organizationId", "==", organizationId);

            if (validation.data.vehicleId) {
                query = query.where("vehicleId", "==", validation.data.vehicleId);
            }
            if (validation.data.status) {
                query = query.where("status", "==", validation.data.status);
            }
            if (validation.data.type) {
                query = query.where("type", "==", validation.data.type);
            }
            if (validation.data.startTime) {
                query = query.where("detectedAt", ">=", validation.data.startTime);
            }

            query = query.orderBy("detectedAt", "desc")
                .limit(validation.data.limit || 50);

            const snapshot = await query.get();
            const alerts = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            res.json({ alerts });
            return;
        }

        // GET /alerts/:id - Get alert details
        if (method === "GET" && pathParts.length === 2) {
            const alertId = pathParts[1];
            const doc = await db.collection("alerts").doc(alertId).get();

            if (!doc.exists || doc.data()?.organizationId !== organizationId) {
                res.status(404).json({ error: "Alert not found" });
                return;
            }

            res.json({ alert: { id: doc.id, ...doc.data() } });
            return;
        }

        // PUT /alerts/:id/resolve - Resolve alert
        if (method === "PUT" && pathParts.length === 3 && pathParts[2] === "resolve") {
            const alertId = pathParts[1];
            const doc = await db.collection("alerts").doc(alertId).get();

            if (!doc.exists || doc.data()?.organizationId !== organizationId) {
                res.status(404).json({ error: "Alert not found" });
                return;
            }

            const validation = resolveAlertSchema.safeParse(req.body);
            if (!validation.success) {
                res.status(400).json({ error: "Invalid input" });
                return;
            }

            await db.collection("alerts").doc(alertId).update({
                status: validation.data.status,
                resolvedAt: Date.now(),
                resolvedBy: userId,
                notes: validation.data.notes || "",
            });

            res.json({ success: true });
            return;
        }

        // GET /alerts/stats - Get alert statistics
        if (method === "GET" && pathParts.length === 2 && pathParts[1] === "stats") {
            const activeSnapshot = await db.collection("alerts")
                .where("organizationId", "==", organizationId)
                .where("status", "==", "active")
                .get();

            const last24h = Date.now() - (24 * 60 * 60 * 1000);
            const recentSnapshot = await db.collection("alerts")
                .where("organizationId", "==", organizationId)
                .where("detectedAt", ">=", last24h)
                .get();

            const stats = {
                activeAlerts: activeSnapshot.size,
                last24Hours: recentSnapshot.size,
                byType: {} as Record<string, number>,
                bySeverity: {} as Record<string, number>,
            };

            activeSnapshot.docs.forEach((doc) => {
                const data = doc.data();
                stats.byType[data.type] = (stats.byType[data.type] || 0) + 1;
                stats.bySeverity[data.severity] = (stats.bySeverity[data.severity] || 0) + 1;
            });

            res.json({ stats });
            return;
        }

        res.status(404).json({ error: "Not found" });
    } catch (error) {
        console.error("Alerts API error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
