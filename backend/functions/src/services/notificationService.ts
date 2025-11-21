import { db } from "../index";
import * as admin from "firebase-admin";

interface NotificationPayload {
    organizationId: string;
    type: "alert" | "info" | "warning";
    title: string;
    message: string;
    relatedEntity?: {
        type: "vehicle" | "alert" | "device";
        id: string;
    };
}

/**
 * Send multi-channel notifications to users
 */
export async function sendNotification(payload: NotificationPayload) {
    try {
        // Get all users in the organization
        const usersSnapshot = await db.collection("users")
            .where("organizationId", "==", payload.organizationId)
            .get();

        const notifications: Promise<unknown>[] = [];

        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();
            const userId = userDoc.id;
            const prefs = userData.notificationPreferences || {};

            // Create notification document
            const notificationData = {
                userId,
                type: payload.type,
                title: payload.title,
                message: payload.message,
                read: false,
                relatedEntity: payload.relatedEntity,
                createdAt: Date.now(),
            };

            await db.collection("notifications").add(notificationData);

            // Send push notification via FCM if enabled
            if (prefs.push !== false) {
                const fcmToken = userData.fcmToken;
                if (fcmToken) {
                    notifications.push(
                        admin.messaging().send({
                            token: fcmToken,
                            notification: {
                                title: payload.title,
                                body: payload.message,
                            },
                            data: {
                                type: payload.type,
                                relatedId: payload.relatedEntity?.id || "",
                            },
                        }).catch((error) => {
                            console.error(`FCM error for user ${userId}:`, error);
                        })
                    );
                }
            }

            // Send SMS if enabled and critical
            if (prefs.sms && payload.type === "alert" && userData.phoneNumber) {
                // SMS sending will be handled by the bridge service or Twilio
                // For now, just log
                console.log(`SMS notification queued for ${userData.phoneNumber}`);
            }

            // Send email if enabled
            if (prefs.email !== false && userData.email) {
                // Email sending will be handled separately
                console.log(`Email notification queued for ${userData.email}`);
            }
        }

        await Promise.all(notifications);
        console.log(`Notifications sent for organization ${payload.organizationId}`);
    } catch (error) {
        console.error("Error sending notifications:", error);
    }
}
