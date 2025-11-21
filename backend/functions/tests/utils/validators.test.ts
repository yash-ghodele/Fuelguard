import { mqttPayloadSchema } from '../../src/utils/validators';

describe('MQTT Payload Validation', () => {
    it('should validate correct payload', () => {
        const payload = {
            deviceId: 'ESP32_001',
            timestamp: Date.now(),
            data: {
                fuel: {
                    ultrasonic: 45.2,
                    float: 2048,
                    liters: 110.5,
                    percentage: 55.25,
                },
                gps: {
                    lat: 37.7749,
                    lon: -122.4194,
                    speed: 45.5,
                    satellites: 8,
                    fix: true,
                },
                tamper: false,
                battery: 4.1,
                signal: 25,
            },
        };

        const result = mqttPayloadSchema.safeParse(payload);
        expect(result.success).toBe(true);
    });

    it('should reject invalid fuel percentage', () => {
        const payload = {
            deviceId: 'ESP32_001',
            timestamp: Date.now(),
            data: {
                fuel: {
                    ultrasonic: 45.2,
                    float: 2048,
                    liters: 110.5,
                    percentage: 150, // Invalid: > 100
                },
                gps: null,
                tamper: false,
                battery: 4.1,
                signal: 25,
            },
        };

        const result = mqttPayloadSchema.safeParse(payload);
        expect(result.success).toBe(false);
    });

    it('should allow null GPS', () => {
        const payload = {
            deviceId: 'ESP32_001',
            timestamp: Date.now(),
            data: {
                fuel: {
                    ultrasonic: 45.2,
                    float: 2048,
                    liters: 110.5,
                    percentage: 55.25,
                },
                gps: null,
                tamper: false,
                battery: 4.1,
                signal: 25,
            },
        };

        const result = mqttPayloadSchema.safeParse(payload);
        expect(result.success).toBe(true);
    });
});
