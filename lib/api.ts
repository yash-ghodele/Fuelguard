import { auth as firebaseAuth } from './firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-project.cloudfunctions.net/api';

async function getAuthToken(): Promise<string | null> {
    const auth: any = firebaseAuth;
    const user = auth?.currentUser;
    if (!user) return null;
    return await user.getIdToken();
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || error.message || 'Request failed');
    }
    return response.json();
}

export const api = {
    vehicles: {
        list: () => apiRequest<{ vehicles: any[] }>('/vehicles'),
        get: (id: string) => apiRequest<{ vehicle: any }>(`/vehicles/${id}`),
        create: (data: any) => apiRequest<{ vehicle: any }>('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: any) => apiRequest<{ vehicle: any }>(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => apiRequest<{ success: boolean }>(`/vehicles/${id}`, { method: 'DELETE' }),
        fuelHistory: (id: string, params?: { limit?: number; startTime?: number }) => {
            const query = new URLSearchParams(params as any).toString();
            return apiRequest<{ readings: any[] }>(`/vehicles/${id}/fuel-history?${query}`);
        },
    },
    devices: {
        list: () => apiRequest<{ devices: any[] }>('/devices'),
        get: (id: string) => apiRequest<{ device: any }>(`/devices/${id}`),
        register: (data: any) => apiRequest<{ device: any }>('/devices', { method: 'POST', body: JSON.stringify(data) }),
        updateConfig: (id: string, config: any) => apiRequest<{ device: any }>(`/devices/${id}/config`, { method: 'PUT', body: JSON.stringify(config) }),
        sendCommand: (id: string, command: string, payload?: any) => apiRequest<{ command: any }>(`/devices/${id}/command`, { method: 'POST', body: JSON.stringify({ command, payload }) }),
        health: (id: string) => apiRequest<{ health: any }>(`/devices/${id}/health`),
    },
    alerts: {
        list: (params?: { vehicleId?: string; status?: string; type?: string }) => {
            const query = new URLSearchParams(params as any).toString();
            return apiRequest<{ alerts: any[] }>(`/alerts?${query}`);
        },
        get: (id: string) => apiRequest<{ alert: any }>(`/alerts/${id}`),
        resolve: (id: string, notes?: string, status?: string) => apiRequest<{ success: boolean }>(`/alerts/${id}/resolve`, { method: 'PUT', body: JSON.stringify({ notes, status: status || 'resolved' }) }),
        stats: () => apiRequest<{ stats: any }>('/alerts/stats'),
    },
    dashboard: {
        summary: () => apiRequest<{ stats: any }>('/dashboard/summary'),
    },
};
