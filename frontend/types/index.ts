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
    status: string; // Active, Onboarding, Under Review
    next_review_date?: string;
    created_at: string;
    updated_at: string;
}

export interface ClientListItem {
    id: number;
    full_name: string;
    nationality?: string;
    risk_score?: string;
    status?: string;
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

export interface KYCRecord {
    id: number;
    version: number;
    risk_score?: string;
    risk_rationale?: string;
    kyc_summary?: string;
    pep_flag: boolean;
    sanctions_flag: boolean;
    cdd_conclusion?: string; // Standard CDD, Enhanced CDD
    edd_required: boolean;
    review_date?: string;
    next_review_date?: string;
    created_at: string;
    created_by?: string;
}

// Risk Alert types
export interface RiskAlert {
    id: number;
    client_id?: number;
    severity: string;
    status: string; // Open, Under Review, Escalated, Closed
    priority: string; // Low, Medium, High, Critical
    risk_tags?: string[];
    summary: string;
    next_steps?: string;
    sla_due_date?: string;
    assigned_to?: string;
    raw_activity_log?: string;
    created_at: string;
}

export interface RiskAlertListItem {
    id: number;
    client_id?: number;
    client_name?: string;
    severity: string;
    status: string;
    priority: string;
    risk_tags?: string[];
    summary: string;
    sla_due_date?: string;
    assigned_to?: string;
    created_at: string;
    is_overdue?: boolean;
}

export interface RiskAnalysisRequest {
    client_id?: number;
    activity_log: string;
}

// Case types
export interface Case {
    id: number;
    alert_id?: number;
    client_id?: number;
    client_name?: string;
    case_type: string; // AML, Sanctions, Fraud, etc.
    status: string; // Open, Under Investigation, Closed
    priority: string; // Low, Medium, High, Critical
    assigned_to?: string;
    investigation_notes?: string;
    conclusion?: string;
    sar_status?: string; // Not Required, Pending, Filed, Rejected
    sar_filed_date?: string;
    sar_reference?: string;
    created_at: string;
    updated_at: string;
    closed_at?: string;
}

export interface CaseCreate {
    alert_id?: number;
    client_id?: number;
    case_type: string;
    priority?: string;
    assigned_to?: string;
    investigation_notes?: string;
}

export interface CaseUpdate {
    status?: string;
    priority?: string;
    assigned_to?: string;
    investigation_notes?: string;
    conclusion?: string;
    sar_status?: string;
    sar_filed_date?: string;
    sar_reference?: string;
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
    // Client Perspective
    total_clients: number;
    high_risk_clients: number;

    // Legacy (for backward compatibility)
    open_risk_alerts: number;
    recent_kyc_analyses: number;

    // Case Perspective (NEW)
    open_cases: number;
    new_alerts_today: number;
    new_alerts_7days: number;

    // Compliance Health (NEW)
    kyc_uptodate_percentage: number;
    kyc_upcoming_reviews: number;
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
