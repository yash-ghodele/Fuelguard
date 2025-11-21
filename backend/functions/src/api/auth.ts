import * as functions from "firebase-functions";
import { db, auth } from "../index";
import {
    createOrganizationSchema,
    inviteUserSchema,
    acceptInvitationSchema,
    updateUserRoleSchema
} from "../utils/validators";
import { Organization, Invitation, User } from "../types";

/**
 * Create a new organization
 * The caller becomes the admin of the new organization.
 */
export const createOrganization = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }

    const validation = createOrganizationSchema.safeParse(data);
    if (!validation.success) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid input", validation.error);
    }

    const { name, plan } = validation.data;
    const userId = context.auth.uid;

    try {
        // Check if user already has an organization
        const userDoc = await db.collection("users").doc(userId).get();
        if (userDoc.exists && userDoc.data()?.organizationId) {
            throw new functions.https.HttpsError("already-exists", "User already belongs to an organization");
        }

        const orgData: Organization = {
            id: "", // Will be set by doc ID
            name,
            plan,
            ownerId: userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        const batch = db.batch();

        // Create Organization
        const orgRef = db.collection("organizations").doc();
        orgData.id = orgRef.id;
        batch.set(orgRef, orgData);

        // Update User with Org ID and Admin Role
        const userRef = db.collection("users").doc(userId);
        const userData: Partial<User> = {
            organizationId: orgRef.id,
            role: "admin",
            updatedAt: Date.now(),
        };
        // Create user doc if it doesn't exist (first time login)
        if (!userDoc.exists) {
            const newUser: User = {
                id: userId,
                email: context.auth.token.email || "",
                name: context.auth.token.name || "Admin",
                role: "admin",
                organizationId: orgRef.id,
                notificationPreferences: {
                    email: true,
                    sms: false,
                    push: true,
                    alertTypes: ["fuel_theft", "tampering"],
                },
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            batch.set(userRef, newUser);
        } else {
            batch.update(userRef, userData);
        }

        await batch.commit();

        // Set Custom Claims
        await auth.setCustomUserClaims(userId, {
            orgId: orgRef.id,
            role: "admin"
        });

        return { success: true, organizationId: orgRef.id };
    } catch (error) {
        console.error("Error creating organization:", error);
        throw new functions.https.HttpsError("internal", "Failed to create organization");
    }
});

/**
 * Invite a user to the organization
 * Only admins can invite users.
 */
export const inviteUser = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }

    // Verify Admin Role via Custom Claims
    if (context.auth.token.role !== "admin") {
        throw new functions.https.HttpsError("permission-denied", "Only admins can invite users");
    }

    const validation = inviteUserSchema.safeParse(data);
    if (!validation.success) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid input", validation.error);
    }

    const { email, role } = validation.data;
    const organizationId = context.auth.token.orgId;

    try {
        // Check if user is already in the system
        try {
            const existingUser = await auth.getUserByEmail(email);
            const userDoc = await db.collection("users").doc(existingUser.uid).get();
            if (userDoc.exists && userDoc.data()?.organizationId) {
                throw new functions.https.HttpsError("already-exists", "User is already a member of an organization");
            }
        } catch (e: any) {
            if (e.code !== 'auth/user-not-found') {
                throw e;
            }
            // User doesn't exist, proceed with invite
        }

        const inviteData: Invitation = {
            id: "", // Will be set by doc ID
            email,
            organizationId,
            role,
            status: "pending",
            invitedBy: context.auth.uid,
            createdAt: Date.now(),
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
        };

        const inviteRef = await db.collection("invitations").add(inviteData);

        // Update ID in doc (optional, but good for consistency)
        await inviteRef.update({ id: inviteRef.id });

        // TODO: Send email with invite link (using a trigger or here)
        // For now, we just return the invite ID

        return { success: true, inviteId: inviteRef.id };
    } catch (error) {
        console.error("Error inviting user:", error);
        throw new functions.https.HttpsError("internal", "Failed to invite user");
    }
});

/**
 * Accept an invitation
 * Links the user to the organization.
 */
export const acceptInvitation = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }

    const validation = acceptInvitationSchema.safeParse(data);
    if (!validation.success) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid input", validation.error);
    }

    const { inviteId } = validation.data;
    const userId = context.auth.uid;
    const userEmail = context.auth.token.email;

    try {
        const inviteDoc = await db.collection("invitations").doc(inviteId).get();
        if (!inviteDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Invitation not found");
        }

        const invite = inviteDoc.data() as Invitation;

        if (invite.status !== "pending") {
            throw new functions.https.HttpsError("failed-precondition", "Invitation is not valid");
        }

        if (invite.expiresAt < Date.now()) {
            throw new functions.https.HttpsError("failed-precondition", "Invitation has expired");
        }

        if (invite.email !== userEmail) {
            throw new functions.https.HttpsError("permission-denied", "Invitation email does not match user email");
        }

        const batch = db.batch();

        // Update User
        const userRef = db.collection("users").doc(userId);
        const userData: Partial<User> = {
            organizationId: invite.organizationId,
            role: invite.role,
            updatedAt: Date.now(),
        };

        // Create user doc if it doesn't exist (new user)
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            const newUser: User = {
                id: userId,
                email: userEmail || "",
                name: context.auth.token.name || "User",
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
        } else {
            batch.update(userRef, userData);
        }

        // Update Invitation
        batch.update(inviteDoc.ref, { status: "accepted" });

        await batch.commit();

        // Set Custom Claims
        await auth.setCustomUserClaims(userId, {
            orgId: invite.organizationId,
            role: invite.role
        });

        return { success: true, organizationId: invite.organizationId };
    } catch (error) {
        console.error("Error accepting invitation:", error);
        throw new functions.https.HttpsError("internal", "Failed to accept invitation");
    }
});

/**
 * Update a user's role
 * Only admins can update roles.
 */
export const updateUserRole = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }

    if (context.auth.token.role !== "admin") {
        throw new functions.https.HttpsError("permission-denied", "Only admins can update roles");
    }

    const validation = updateUserRoleSchema.safeParse(data);
    if (!validation.success) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid input", validation.error);
    }

    const { userId, role } = validation.data;
    const organizationId = context.auth.token.orgId;

    try {
        const targetUserDoc = await db.collection("users").doc(userId).get();
        if (!targetUserDoc.exists) {
            throw new functions.https.HttpsError("not-found", "User not found");
        }

        const targetUser = targetUserDoc.data() as User;
        if (targetUser.organizationId !== organizationId) {
            throw new functions.https.HttpsError("permission-denied", "User is not in your organization");
        }

        await targetUserDoc.ref.update({ role, updatedAt: Date.now() });

        // Update Custom Claims
        await auth.setCustomUserClaims(userId, {
            orgId: organizationId,
            role: role
        });

        return { success: true };
    } catch (error) {
        console.error("Error updating user role:", error);
        throw new functions.https.HttpsError("internal", "Failed to update user role");
    }
});
