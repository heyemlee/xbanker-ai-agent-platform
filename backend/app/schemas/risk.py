from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class RiskAnalysisRequest(BaseModel):
    """Request schema for risk surveillance analysis"""
    client_id: Optional[int] = Field(None, description="Optional client ID to associate alert with")
    activity_log: str = Field(..., description="Activity log or news snippet to analyze")


class RiskAlertResponse(BaseModel):
    """Response schema for risk alert"""
    id: int
    client_id: Optional[int] = None
    severity: str
    risk_tags: Optional[List[str]] = None
    summary: str
    next_steps: Optional[str] = None
    raw_activity_log: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class RiskAlertListItem(BaseModel):
    """Schema for risk alert list items"""
    id: int
    client_id: Optional[int] = None
    client_name: Optional[str] = None
    severity: str
    risk_tags: Optional[List[str]] = None
    summary: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class RiskAlertListResponse(BaseModel):
    """Response schema for risk alert list"""
    alerts: List[RiskAlertListItem]
    total: int
