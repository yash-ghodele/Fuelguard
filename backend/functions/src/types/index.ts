/**
 * Fuelguard IoT System - TypeScript Type Definitions
 */

export interface FuelReading {
    deviceId: string;
    vehicleId: string;
    timestamp: number;
    fuelLevel: {
        liters: number;
        percentage: number;
    };
    location: {
        lat: number;
        lon: number;
        speed: number;
        satellites: number;
    } | null;
    sensors: {
        ultrasonic: {
            distance: number; // cm
            valid: boolean;
        };
        float: {
            value: number;
            valid: boolean;
        };
        gps: {
            fix: boolean;
            satellites: number;
            speed: number; // km/h
        };
        tamper: boolean; // Reed switch state
        battery: number; // Voltage
        signalStrength: number; // GSM signal (0-31)
    };
}

export interface Vehicle {
    id: string;
    licensePlate: string;
    make: string;
    model: string;
    year: number;
    tankCapacity: number; // liters
    deviceId?: string;
    driver?: string;
    status: "online" | "offline";
    organizationId: string;
    createdAt: number;
    updatedAt: number;
}

export interface Device {
    id: string; // deviceId
    serialNumber: string;
    type: "esp32";
    firmwareVersion: string;
    healthStatus: "online" | "offline" | "error";
    lastSeen: number;
    batteryLevel: number;
    signalStrength: number;
    configuration: {
        readingInterval: number; // seconds
        alertThreshold: number; // percentage drop
        gsmApn: string;
    };
    vehicleId?: string;
    organizationId: string;
    createdAt: number;
    updatedAt: number;
}

export interface TheftAlert {
    id: string;
    vehicleId: string;
    deviceId: string;
    type: "fuel_theft" | "tampering" | "sensor_error";
    fuelLoss: number; // liters
    location: {
        lat: number;
        lon: number;
    } | null;
    status: "active" | "resolved" | "false_positive";
    severity: "low" | "medium" | "high" | "critical";
    detectedAt: number;
    resolvedAt?: number;
    resolvedBy?: string;
    notes?: string;
    organizationId: string;
}

export interface User {
    id: string; // Firebase UID
    email: string;
    name: string;
    role: "admin" | "manager" | "operator" | "viewer";
    organizationId: string;
    notificationPreferences: {
        email: boolean;
        sms: boolean;
        push: boolean;
        alertTypes: string[];
    };
    phoneNumber?: string;
    createdAt: number;
    updatedAt: number;
}

export interface Notification {
    id: string;
    userId: string;
    type: "alert" | "info" | "warning";
    title: string;
    message: string;
    read: boolean;
    relatedEntity?: {
        type: "vehicle" | "alert" | "device";
        id: string;
    };
    createdAt: number;
}

export interface DeviceCommand {
    id: string;
    deviceId: string;
    command: "relay_on" | "relay_off" | "update_config" | "reboot" | "request_status";
    payload?: Record<string, unknown>;
    status: "pending" | "sent" | "acknowledged" | "failed";
    createdAt: number;
    sentAt?: number;
    acknowledgedAt?: number;
    createdBy: string;
}

export interface MQTTPayload {
    deviceId: string;
    timestamp: number;
    data: {
        fuel: {
            ultrasonic: number; // cm distance
            float: number; // analog value
            liters: number;
            percentage: number;
        };
        gps: {
            lat: number;
            lon: number;
            speed: number;
            satellites: number;
            fix: boolean;
        } | null;
        tamper: boolean;
        battery: number;
        signal: number;
    };
}

export interface DashboardStats {
    totalVehicles: number;
    onlineVehicles: number;
    avgFuelLevel: number;
    activeAlerts: number;
    recentActivity: {
        vehicleId: string;
        licensePlate: string;
        event: string;
        timestamp: number;
    }[];
    deviceHealth: {
        online: number;
        offline: number;
        error: number;
    };
}

export interface Organization {
    id: string;
    name: string;
    plan: "free" | "pro" | "enterprise";
    createdAt: number;
    updatedAt: number;
    ownerId: string;
}

export interface Invitation {
    id: string;
    email: string;
    organizationId: string;
    role: "admin" | "manager" | "viewer";
    status: "pending" | "accepted" | "expired";
    invitedBy: string;
    createdAt: number;
    expiresAt: number;
}
