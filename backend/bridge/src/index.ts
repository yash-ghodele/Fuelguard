import * as mqtt from "mqtt";
import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import { mqttPayloadSchema } from "./validators";
import { MQTTPayload, FuelReading } from "./types";

dotenv.config();

// Initialize Firebase Admin
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

// MQTT Client Setup
const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL || "mqtt://localhost:1883", {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clientId: `fuelguard-bridge-${Math.random().toString(16).substr(2, 8)}`,
    clean: true,
    reconnectPeriod: 5000,
});

mqttClient.on("connect", () => {
    console.log("✅ Connected to MQTT broker");

    // Subscribe to device data topic
    mqttClient.subscribe("fuelguard/devices/+/data", { qos: 1 }, (err) => {
        if (err) {
            console.error("❌ Subscription error:", err);
        } else {
            console.log("📡 Subscribed to fuelguard/devices/+/data");
        }
    });

    // Subscribe to device status topic
    mqttClient.subscribe("fuelguard/devices/+/status", { qos: 1 });
});

mqttClient.on("message", async (topic, message) => {
    try {
        const topicParts = topic.split("/");
        const deviceId = topicParts[2];
        const messageType = topicParts[3]; // 'data' or 'status'

        console.log(`📨 Message from ${deviceId} (${messageType})`);

        if (messageType === "data") {
            await handleDataMessage(deviceId, message);
        } else if (messageType === "status") {
            await handleStatusMessage(deviceId, message);
        }
    } catch (error) {
        console.error("❌ Error processing message:", error);
    }
});

mqttClient.on("error", (error) => {
    console.error("❌ MQTT Error:", error);
});

mqttClient.on("offline", () => {
    console.log("⚠️  MQTT client offline");
});

mqttClient.on("reconnect", () => {
    console.log("🔄 Reconnecting to MQTT broker...");
});

/**
 * Handle sensor data messages from ESP32
 */
async function handleDataMessage(deviceId: string, message: Buffer) {
    try {
        const payload: MQTTPayload = JSON.parse(message.toString());

        // Validate payload
        const validation = mqttPayloadSchema.safeParse(payload);
        if (!validation.success) {
            console.error("❌ Invalid payload:", validation.error);
            return;
        }

        // Verify device exists
        const deviceDoc = await db.collection("devices").doc(deviceId).get();
        if (!deviceDoc.exists) {
            console.error(`❌ Unknown device: ${deviceId}`);
            return;
        }

        const deviceData = deviceDoc.data();
        const vehicleId = deviceData?.vehicleId;

        if (!vehicleId) {
            console.error(`❌ Device ${deviceId} not assigned to a vehicle`);
            return;
        }

        // Create fuel reading document
        const fuelReading: Omit<FuelReading, "id"> = {
            deviceId,
            vehicleId,
            timestamp: payload.timestamp,
            fuelLevel: {
                liters: payload.data.fuel.liters,
                percentage: payload.data.fuel.percentage,
            },
            location: payload.data.gps ? {
                lat: payload.data.gps.lat,
                lon: payload.data.gps.lon,
                speed: payload.data.gps.speed,
                satellites: payload.data.gps.satellites,
            } : null,
            sensors: {
                ultrasonic: {
                    distance: payload.data.fuel.ultrasonic,
                    valid: true,
                },
                float: {
                    value: payload.data.fuel.float,
                    valid: true,
                },
                gps: {
                    fix: payload.data.gps?.fix || false,
                    satellites: payload.data.gps?.satellites || 0,
                    speed: payload.data.gps?.speed || 0,
                },
                tamper: payload.data.tamper,
                battery: payload.data.battery,
                signalStrength: payload.data.signal,
            },
            organizationId: deviceData.organizationId,
        };

        // Store in Firestore (this will trigger the alert detection function)
        await db.collection("fuelReadings").add(fuelReading);

        console.log(`✅ Fuel reading stored for vehicle ${vehicleId}`);
    } catch (error) {
        console.error("❌ Error handling data message:", error);
    }
}

/**
 * Handle device status messages
 */
async function handleStatusMessage(deviceId: string, message: Buffer) {
    try {
        const status = JSON.parse(message.toString());
        console.log(`📊 Status from ${deviceId}:`, status);

        // Update device status in Firestore
        await db.collection("devices").doc(deviceId).update({
            lastSeen: Date.now(),
            healthStatus: status.online ? "online" : "offline",
            updatedAt: Date.now(),
        });
    } catch (error) {
        console.error("❌ Error handling status message:", error);
    }
}

// Graceful shutdown
process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down MQTT bridge...");
    mqttClient.end();
    process.exit(0);
});

console.log("🚀 Fuelguard MQTT Bridge Service started");
