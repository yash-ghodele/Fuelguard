import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

// Initialize Firebase Admin
admin.initializeApp();

// Export Firestore and Auth instances
export const db = admin.firestore();
export const auth = admin.auth();

// Import API endpoints
import { vehiclesApi } from "./api/vehicles";
import { devicesApi } from "./api/devices";
import { alertsApi } from "./api/alerts";
import { dashboardApi } from "./api/dashboard";

// Import Firestore triggers
import { onFuelReadingCreated } from "./triggers/alertTrigger";

/**
 * HTTP API Endpoints
 */
export const api = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }

    const path = req.path;

    try {
        // Route to appropriate handler
        if (path.startsWith("/vehicles")) {
            await vehiclesApi(req, res);
        } else if (path.startsWith("/devices")) {
            await devicesApi(req, res);
        } else if (path.startsWith("/alerts")) {
            await alertsApi(req, res);
        } else if (path.startsWith("/dashboard")) {
            await dashboardApi(req, res);
        } else {
            res.status(404).json({ error: "Not found" });
        }
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * Firestore Triggers
 */
export const detectTheft = onFuelReadingCreated;

/**
 * Scheduled Functions
 */
export const cleanupOldReadings = functions.pubsub
    .schedule("every 24 hours")
    .onRun(async (context) => {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

        const snapshot = await db.collection("fuelReadings")
            .where("timestamp", "<", thirtyDaysAgo)
            .limit(500)
            .get();

        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(`Deleted ${snapshot.size} old fuel readings`);
    });
