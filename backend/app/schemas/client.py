from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class KYCAnalysisRequest(BaseModel):
    """Request schema for KYC analysis"""
    full_name: str = Field(..., description="Client full name")
    date_of_birth: Optional[date] = Field(None, description="Client date of birth")
    nationality: Optional[str] = Field(None, description="Client nationality")
    residency_country: Optional[str] = Field(None, description="Country of residence")
    source_of_wealth: Optional[str] = Field(None, description="Source of wealth description")
    business_activity: Optional[str] = Field(None, description="Business activity description")
    kyc_notes: str = Field(..., description="Unstructured KYC notes or document text")


class ClientBase(BaseModel):
    """Base client schema"""
    full_name: str
    date_of_birth: Optional[date] = None
    nationality: Optional[str] = None
    residency_country: Optional[str] = None
    source_of_wealth: Optional[str] = None
    business_activity: Optional[str] = None


class ClientResponse(ClientBase):
    """Response schema for client data"""
    id: int
    pep_flag: bool
    sanctions_flag: bool
    risk_score: Optional[str] = None
    risk_rationale: Optional[str] = None
    kyc_summary: Optional[str] = None
    raw_kyc_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ClientListItem(BaseModel):
    """Schema for client list items"""
    id: int
    full_name: str
    nationality: Optional[str] = None
    risk_score: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ClientListResponse(BaseModel):
    """Response schema for client list"""
    clients: list[ClientListItem]
    total: int
