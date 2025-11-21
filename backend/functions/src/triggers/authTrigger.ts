import * as functions from "firebase-functions";
import { db, auth } from "../index";
import { Invitation, User } from "../types";

/**
 * Trigger: On User Created
 * Checks if there is a pending invitation for the new user's email.
 * If found, automatically adds the user to the organization and sets custom claims.
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
    const email = user.email;
    if (!email) return;

    try {
        // Check for pending invitations
        const snapshot = await db.collection("invitations")
            .where("email", "==", email)
            .where("status", "==", "pending")
            .limit(1)
            .get();

        if (snapshot.empty) {
            console.log(`No pending invitations for user ${email}`);
            return;
        }

        const inviteDoc = snapshot.docs[0];
        const invite = inviteDoc.data() as Invitation;

        // Check expiration
        if (invite.expiresAt < Date.now()) {
            console.log(`Invitation for ${email} has expired`);
            await inviteDoc.ref.update({ status: "expired" });
            return;
        }

        const batch = db.batch();

        // Create/Update User Document
        const userRef = db.collection("users").doc(user.uid);
        const newUser: User = {
            id: user.uid,
            email: email,
            name: user.displayName || "User",
            role: invite.role,
            organizationId: invite.organizationId,
            notificationPreferences: {
                email: true,
                sms: false,
                push: true,
                alertTypes: ["fuel_theft"],
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        batch.set(userRef, newUser);

        // Update Invitation Status
        batch.update(inviteDoc.ref, { status: "accepted" });

        await batch.commit();

        // Set Custom Claims
        await auth.setCustomUserClaims(user.uid, {
            orgId: invite.organizationId,
            role: invite.role,
        });

        console.log(`Successfully linked user ${email} to organization ${invite.organizationId}`);

    } catch (error) {
        console.error("Error in onUserCreated trigger:", error);
    }
});
