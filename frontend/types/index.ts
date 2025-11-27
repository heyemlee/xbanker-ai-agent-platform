// Client types
export interface Client {
    id: number;
    full_name: string;
    date_of_birth?: string;
    nationality?: string;
    residency_country?: string;
    source_of_wealth?: string;
    business_activity?: string;
    pep_flag: boolean;
    sanctions_flag: boolean;
    risk_score?: string;
    risk_rationale?: string;
    kyc_summary?: string;
    raw_kyc_notes?: string;
    created_at: string;
    updated_at: string;
}

export interface ClientListItem {
    id: number;
    full_name: string;
    nationality?: string;
    risk_score?: string;
    created_at: string;
}

// KYC types
export interface KYCAnalysisRequest {
    full_name: string;
    date_of_birth?: string;
    nationality?: string;
    residency_country?: string;
    source_of_wealth?: string;
    business_activity?: string;
    kyc_notes: string;
}

// Risk Alert types
export interface RiskAlert {
    id: number;
    client_id?: number;
    severity: string;
    risk_tags?: string[];
    summary: string;
    next_steps?: string;
    raw_activity_log?: string;
    created_at: string;
}

export interface RiskAlertListItem {
    id: number;
    client_id?: number;
    client_name?: string;
    severity: string;
    risk_tags?: string[];
    summary: string;
    created_at: string;
}

export interface RiskAnalysisRequest {
    client_id?: number;
    activity_log: string;
}

// Insights types
export interface ClientInsights {
    client_id: number;
    client_name: string;
    insights: {
        profile_overview: string[];
        risk_compliance_view: string[];
        suggested_rm_actions: string[];
        next_best_actions: string[];
    };
    generated_at: string;
}

// Dashboard types
export interface DashboardStats {
    total_clients: number;
    high_risk_clients: number;
    open_risk_alerts: number;
    recent_kyc_analyses: number;
}

// API Response types
export interface ClientListResponse {
    clients: ClientListItem[];
    total: number;
}

export interface RiskAlertListResponse {
    alerts: RiskAlertListItem[];
    total: number;
}
