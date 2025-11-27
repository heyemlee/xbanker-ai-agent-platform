import {
    Client,
    ClientListResponse,
    KYCAnalysisRequest,
    RiskAlert,
    RiskAlertListResponse,
    RiskAnalysisRequest,
    ClientInsights,
    DashboardStats,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class APIClient {
    private async request<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Request failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    // KYC Endpoints
    async analyzeKYC(data: KYCAnalysisRequest): Promise<Client> {
        return this.request<Client>('/api/kyc/analyze', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getClients(): Promise<ClientListResponse> {
        return this.request<ClientListResponse>('/api/kyc/clients');
    }

    async getClient(id: number): Promise<Client> {
        return this.request<Client>(`/api/kyc/clients/${id}`);
    }

    // Risk Endpoints
    async analyzeRisk(data: RiskAnalysisRequest): Promise<RiskAlert> {
        return this.request<RiskAlert>('/api/risk/surveillance', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getRiskAlerts(filters?: {
        severity?: string;
        client_id?: number;
    }): Promise<RiskAlertListResponse> {
        const params = new URLSearchParams();
        if (filters?.severity) params.append('severity', filters.severity);
        if (filters?.client_id) params.append('client_id', filters.client_id.toString());

        const query = params.toString() ? `?${params.toString()}` : '';
        return this.request<RiskAlertListResponse>(`/api/risk/alerts${query}`);
    }

    // Client Insights Endpoints
    async getClientInsights(clientId: number): Promise<ClientInsights> {
        return this.request<ClientInsights>(`/api/clients/${clientId}/insights`);
    }

    // Dashboard Endpoints
    async getDashboardStats(): Promise<DashboardStats> {
        return this.request<DashboardStats>('/api/dashboard/stats');
    }
}

export const apiClient = new APIClient();
