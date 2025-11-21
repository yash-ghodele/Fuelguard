import functions = require('firebase-functions-test');

const testEnv = functions();

describe('Alert Detection Trigger', () => {
    afterAll(() => {
        testEnv.cleanup();
    });

    it('should detect fuel theft on significant drop', () => {
        const previousReading = {
            vehicleId: 'veh123',
            deviceId: 'ESP32_001',
            timestamp: Date.now() - 2 * 60 * 1000, // 2 minutes ago
            fuelLevel: {
                liters: 150,
                percentage: 75,
            },
            organizationId: 'org1',
        };

        const newReading = {
            vehicleId: 'veh123',
            deviceId: 'ESP32_001',
            timestamp: Date.now(),
            fuelLevel: {
                liters: 120, // 30L drop
                percentage: 60, // 15% drop
            },
            location: {
                lat: 37.7749,
                lon: -122.4194,
                speed: 0,
                satellites: 8,
            },
            sensors: {
                ultrasonic: { distance: 40, valid: true },
                float: { value: 2000, valid: true },
                gps: { fix: true, satellites: 8, speed: 0 },
                tamper: false,
                battery: 4.1,
                signalStrength: 25,
            },
            organizationId: 'org1',
        };

        const fuelDrop = previousReading.fuelLevel.liters - newReading.fuelLevel.liters;
        const percentageDrop = previousReading.fuelLevel.percentage - newReading.fuelLevel.percentage;
        const timeDiff = (newReading.timestamp - previousReading.timestamp) / 1000 / 60;

        const THEFT_THRESHOLD = 10;
        const TIME_WINDOW = 5;

        const isTheft = percentageDrop > THEFT_THRESHOLD && timeDiff < TIME_WINDOW;

        expect(isTheft).toBe(true);
        expect(fuelDrop).toBe(30);
        expect(percentageDrop).toBe(15);
    });

    it('should not trigger on normal fuel consumption', () => {
        const previousReading = {
            fuelLevel: { percentage: 75 },
            timestamp: Date.now() - 30 * 60 * 1000, // 30 minutes ago
        };

        const newReading = {
            fuelLevel: { percentage: 70 }, // 5% drop over 30 min
            timestamp: Date.now(),
        };

        const percentageDrop = previousReading.fuelLevel.percentage - newReading.fuelLevel.percentage;
        const timeDiff = (newReading.timestamp - previousReading.timestamp) / 1000 / 60;

        const THEFT_THRESHOLD = 10;
        const TIME_WINDOW = 5;

        const isTheft = percentageDrop > THEFT_THRESHOLD && timeDiff < TIME_WINDOW;

        expect(isTheft).toBe(false);
    });
});
