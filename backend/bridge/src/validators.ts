import { z } from "zod";

export const mqttPayloadSchema = z.object({
    deviceId: z.string().min(1),
    timestamp: z.number().positive(),
    data: z.object({
        fuel: z.object({
            ultrasonic: z.number().min(0),
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
        battery: z.number().min(0).max(5),
        signal: z.number().int().min(0).max(31),
    }),
});
