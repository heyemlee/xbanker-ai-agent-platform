from pydantic import BaseModel
from typing import List
from datetime import datetime


class ClientInsights(BaseModel):
    """Response schema for client 360 insights"""
    client_id: int
    client_name: str
    insights: dict  # Contains profile_overview, risk_compliance_view, suggested_rm_actions, next_best_actions
    generated_at: datetime


class DashboardStats(BaseModel):
    """Response schema for dashboard statistics"""
    total_clients: int
    high_risk_clients: int
    open_risk_alerts: int
    recent_kyc_analyses: int
