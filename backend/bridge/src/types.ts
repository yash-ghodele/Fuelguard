// Re-export types and validators from Functions for consistency
export interface MQTTPayload {
    deviceId: string;
    timestamp: number;
    data: {
        fuel: {
            ultrasonic: number;
            float: number;
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
            distance: number;
            valid: boolean;
        };
        float: {
            value: number;
            valid: boolean;
        };
        gps: {
            fix: boolean;
            satellites: number;
            speed: number;
        };
        tamper: boolean;
        battery: number;
        signalStrength: number;
    };
    organizationId?: string;
}
