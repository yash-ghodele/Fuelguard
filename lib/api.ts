import { auth } from "./firebase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/fuelguard/us-central1";

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async getAuthToken(): Promise<string | null> {
        try {
            if (auth.currentUser) {
                return await auth.currentUser.getIdToken();
            }
            return null;
        } catch (error) {
            console.error("Error getting auth token:", error);
            return null;
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const token = await this.getAuthToken();
            const headers: HeadersInit = {
                "Content-Type": "application/json",
                ...options.headers,
            };

            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error: any) {
            console.error(`API Error [${endpoint}]:`, error);
            return { success: false, error: error.message };
        }
    }

    // Dashboard API
    dashboard = {
        summary: () => this.request("/api/dashboard/summary"),
        stats: (timeRange?: string) => this.request(`/api/dashboard/stats?range=${timeRange || "24h"}`),
    };

    // Vehicles API
    vehicles = {
        list: () => this.request("/api/vehicles"),
        get: (id: string) => this.request(`/api/vehicles/${id}`),
        create: (data: any) => this.request("/api/vehicles", { method: "POST", body: JSON.stringify(data) }),
        update: (id: string, data: any) => this.request(`/api/vehicles/${id}`, { method: "PUT", body: JSON.stringify(data) }),
        delete: (id: string) => this.request(`/api/vehicles/${id}`, { method: "DELETE" }),
    };

    // Alerts API
    alerts = {
        list: (filters?: { vehicleId?: string; status?: string }) => {
            const params = new URLSearchParams(filters as any).toString();
            return this.request(`/api/alerts${params ? `?${params}` : ""}`);
        },
        get: (id: string) => this.request(`/api/alerts/${id}`),
        resolve: (id: string) => this.request(`/api/alerts/${id}/resolve`, { method: "POST" }),
    };

    // Fuel Readings API
    fuelReadings = {
        list: (vehicleId: string, timeRange?: string) => {
            const params = new URLSearchParams({ vehicleId, range: timeRange || "24h" }).toString();
            return this.request(`/api/fuel-readings?${params}`);
        },
        latest: (vehicleId: string) => this.request(`/api/fuel-readings/latest/${vehicleId}`),
    };

    // Devices API
    devices = {
        list: () => this.request("/api/devices"),
        get: (id: string) => this.request(`/api/devices/${id}`),
        health: (id: string) => this.request(`/api/devices/${id}/health`),
    };

    // Notifications API
    notifications = {
        list: () => this.request("/api/notifications"),
        markRead: (id: string) => this.request(`/api/notifications/${id}/read`, { method: "POST" }),
        markAllRead: () => this.request("/api/notifications/read-all", { method: "POST" }),
    };
}

export const api = new ApiClient(API_BASE_URL);
