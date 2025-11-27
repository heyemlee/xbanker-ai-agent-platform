import {
    Client,
    ClientListResponse,
    KYCAnalysisRequest,
    KYCRecord,
    RiskAlert,
    RiskAlertListResponse,
    RiskAnalysisRequest,
    ClientInsights,
    DashboardStats,
    Case,
    CaseCreate,
    CaseUpdate,
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

    // Client Detail Endpoints (NEW)
    async getClientInsights(clientId: number): Promise<ClientInsights> {
        return this.request<ClientInsights>(`/api/clients/${clientId}/insights`);
    }

    async getClientKYCHistory(clientId: number): Promise<KYCRecord[]> {
        return this.request<KYCRecord[]>(`/api/clients/${clientId}/kyc-history`);
    }

    async getClientAlerts(clientId: number): Promise<RiskAlert[]> {
        return this.request<RiskAlert[]>(`/api/clients/${clientId}/alerts`);
    }

    async getClientCases(clientId: number): Promise<Case[]> {
        return this.request<Case[]>(`/api/clients/${clientId}/cases`);
    }

    async getClientActivity(clientId: number): Promise<any> {
        return this.request<any>(`/api/clients/${clientId}/activity`);
    }

    // Cases Endpoints (NEW)
    async getCases(filters?: {
        status?: string;
        priority?: string;
        assigned_to?: string;
    }): Promise<Case[]> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.priority) params.append('priority', filters.priority);
        if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to);

        const query = params.toString() ? `?${params.toString()}` : '';
        return this.request<Case[]>(`/api/cases${query}`);
    }

    async getCase(id: number): Promise<Case> {
        return this.request<Case>(`/api/cases/${id}`);
    }

    async createCase(data: CaseCreate): Promise<Case> {
        return this.request<Case>('/api/cases', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateCase(id: number, data: CaseUpdate): Promise<Case> {
        return this.request<Case>(`/api/cases/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Alerts Queue Endpoints (NEW)
    async getOpenAlerts(filters?: {
        priority?: string;
        severity?: string;
        assigned_to?: string;
    }): Promise<RiskAlert[]> {
        const params = new URLSearchParams();
        if (filters?.priority) params.append('priority', filters.priority);
        if (filters?.severity) params.append('severity', filters.severity);
        if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to);

        const query = params.toString() ? `?${params.toString()}` : '';
        return this.request<RiskAlert[]>(`/api/alerts/open${query}`);
    }

    // Dashboard Endpoints
    async getDashboardStats(): Promise<DashboardStats> {
        return this.request<DashboardStats>('/api/dashboard/stats');
    }
}

export const apiClient = new APIClient();
