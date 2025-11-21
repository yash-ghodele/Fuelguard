import { z } from "zod";

/**
 * Zod validation schemas for API requests and MQTT payloads
 */

// MQTT Payload Schema
export const mqttPayloadSchema = z.object({
    deviceId: z.string().min(1),
    timestamp: z.number().positive(),
    data: z.object({
        fuel: z.object({
            ultrasonic: z.number().min(0), // cm
            float: z.number().min(0),
            liters: z.number().min(0),
            percentage: z.number().min(0).max(100),
        }),
        gps: z.object({
            lat: z.number().min(-90).max(90),
            lon: z.number().min(-180).max(180),
            speed: z.number().min(0),
            satellites: z.number().int().min(0),
            fix: z.boolean(),
        }).nullable(),
        tamper: z.boolean(),
        battery: z.number().min(0).max(5), // Voltage
        signal: z.number().int().min(0).max(31), // GSM signal strength
    }),
});

// Vehicle Schemas
export const createVehicleSchema = z.object({
    licensePlate: z.string().min(1).max(20),
    make: z.string().min(1).max(50),
    model: z.string().min(1).max(50),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    tankCapacity: z.number().positive(),
    deviceId: z.string().optional(),
    driver: z.string().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

// Device Schemas
export const registerDeviceSchema = z.object({
    serialNumber: z.string().min(1),
    firmwareVersion: z.string().min(1),
    configuration: z.object({
        readingInterval: z.number().int().min(10).max(3600),
        alertThreshold: z.number().min(5).max(50),
        gsmApn: z.string(),
    }).optional(),
});

export const updateDeviceConfigSchema = z.object({
    readingInterval: z.number().int().min(10).max(3600).optional(),
    alertThreshold: z.number().min(5).max(50).optional(),
    gsmApn: z.string().optional(),
});

// Command Schema
export const sendCommandSchema = z.object({
    command: z.enum(["relay_on", "relay_off", "update_config", "reboot", "request_status"]),
    payload: z.record(z.unknown()).optional(),
});

// Alert Schemas
export const resolveAlertSchema = z.object({
    notes: z.string().optional(),
    status: z.enum(["resolved", "false_positive"]),
});

// Query Schemas
export const fuelReadingsQuerySchema = z.object({
    vehicleId: z.string().optional(),
    deviceId: z.string().optional(),
    startTime: z.number().optional(),
    endTime: z.number().optional(),
    limit: z.number().int().min(1).max(1000).optional(),
});

export const alertsQuerySchema = z.object({
    vehicleId: z.string().optional(),
    status: z.enum(["active", "resolved", "false_positive"]).optional(),
    type: z.enum(["fuel_theft", "tampering", "sensor_error"]).optional(),
    startTime: z.number().optional(),
    endTime: z.number().optional(),
    limit: z.number().int().min(1).max(100).optional(),
});

// Auth Schemas
export const createOrganizationSchema = z.object({
    name: z.string().min(1).max(100),
    plan: z.enum(["free", "pro", "enterprise"]).default("free"),
});

export const inviteUserSchema = z.object({
    email: z.string().email(),
    role: z.enum(["admin", "manager", "viewer"]),
});

export const acceptInvitationSchema = z.object({
    inviteId: z.string().min(1),
});

export const updateUserRoleSchema = z.object({
    userId: z.string().min(1),
    role: z.enum(["admin", "manager", "viewer"]),
});
