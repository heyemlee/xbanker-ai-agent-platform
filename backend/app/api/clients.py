from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from typing import List
from pydantic import BaseModel

from ..database import get_db
from ..models import Client, RiskAlert, KYCRecord, Case
from ..schemas.insights import ClientInsights
from ..services.llm_service import llm_service

router = APIRouter(prefix="/api/clients", tags=["Client Insights"])


# Pydantic Schemas for new endpoints
class KYCRecordResponse(BaseModel):
    id: int
    version: int
    risk_score: str | None
    risk_rationale: str | None
    kyc_summary: str | None
    pep_flag: bool
    sanctions_flag: bool
    cdd_conclusion: str | None
    edd_required: bool
    review_date: str | None
    next_review_date: str | None
    created_at: str
    created_by: str | None

    class Config:
        from_attributes = True


class ClientAlertResponse(BaseModel):
    id: int
    severity: str
    status: str
    priority: str
    summary: str
    risk_tags: List[str] | None
    sla_due_date: str | None
    created_at: str

    class Config:
        from_attributes = True


class ClientCaseResponse(BaseModel):
    id: int
    case_type: str
    status: str
    priority: str
    investigation_notes: str | None
    conclusion: str | None
    sar_status: str | None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


@router.get("/{client_id}/insights", response_model=ClientInsights)
async def get_client_insights(
    client_id: int,
    db: Session = Depends(get_db)
):
    """
    Generate AI-powered Client 360 insights for relationship managers
    """
    # Get client
    client = db.query(Client).filter(Client.id == client_id).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Get client's risk alerts
    alerts = db.query(RiskAlert).filter(
        RiskAlert.client_id == client_id
    ).order_by(RiskAlert.created_at.desc()).limit(10).all()
    
    # Prepare client data
    client_data = {
        "full_name": client.full_name,
        "nationality": client.nationality,
        "residency_country": client.residency_country,
        "risk_score": client.risk_score,
        "source_of_wealth": client.source_of_wealth,
        "business_activity": client.business_activity,
        "pep_flag": client.pep_flag,
        "kyc_summary": client.kyc_summary
    }
    
    # Prepare alerts data
    alerts_data = [
        {
            "severity": alert.severity,
            "summary": alert.summary,
            "risk_tags": alert.risk_tags
        }
        for alert in alerts
    ]
    
    # Generate insights using LLM
    insights = llm_service.generate_insights(client_data, alerts_data)
    
    return {
        "client_id": client_id,
        "client_name": client.full_name,
        "insights": insights,
        "generated_at": datetime.utcnow()
    }


@router.get("/{client_id}/kyc-history", response_model=List[KYCRecordResponse])
def get_client_kyc_history(
    client_id: int,
    db: Session = Depends(get_db)
):
    """Get all KYC record versions for a client"""
    client = db.query(Client).filter(Client.id == client_id).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    kyc_records = db.query(KYCRecord).filter(
        KYCRecord.client_id == client_id
    ).order_by(desc(KYCRecord.version)).all()
    
    return [
        KYCRecordResponse(
            id=record.id,
            version=record.version,
            risk_score=record.risk_score,
            risk_rationale=record.risk_rationale,
            kyc_summary=record.kyc_summary,
            pep_flag=record.pep_flag,
            sanctions_flag=record.sanctions_flag,
            cdd_conclusion=record.cdd_conclusion,
            edd_required=record.edd_required,
            review_date=record.review_date.isoformat() if record.review_date else None,
            next_review_date=record.next_review_date.isoformat() if record.next_review_date else None,
            created_at=record.created_at.isoformat(),
            created_by=record.created_by
        )
        for record in kyc_records
    ]


@router.get("/{client_id}/alerts", response_model=List[ClientAlertResponse])
def get_client_alerts(
    client_id: int,
    db: Session = Depends(get_db)
):
    """Get all alerts related to a client"""
    client = db.query(Client).filter(Client.id == client_id).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    alerts = db.query(RiskAlert).filter(
        RiskAlert.client_id == client_id
    ).order_by(desc(RiskAlert.created_at)).all()
    
    return [
        ClientAlertResponse(
            id=alert.id,
            severity=alert.severity,
            status=alert.status,
            priority=alert.priority,
            summary=alert.summary,
            risk_tags=alert.risk_tags,
            sla_due_date=alert.sla_due_date.isoformat() if alert.sla_due_date else None,
            created_at=alert.created_at.isoformat()
        )
        for alert in alerts
    ]


@router.get("/{client_id}/cases", response_model=List[ClientCaseResponse])
def get_client_cases(
    client_id: int,
    db: Session = Depends(get_db)
):
    """Get all cases related to a client"""
    client = db.query(Client).filter(Client.id == client_id).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    cases = db.query(Case).filter(
        Case.client_id == client_id
    ).order_by(desc(Case.created_at)).all()
    
    return [
        ClientCaseResponse(
            id=case.id,
            case_type=case.case_type,
            status=case.status,
            priority=case.priority,
            investigation_notes=case.investigation_notes,
            conclusion=case.conclusion,
            sar_status=case.sar_status,
            created_at=case.created_at.isoformat(),
            updated_at=case.updated_at.isoformat()
        )
        for case in cases
    ]


@router.get("/{client_id}/activity")
def get_client_activity(
    client_id: int,
    db: Session = Depends(get_db)
):
    """Get recent activity summary for a client (placeholder for future transaction integration)"""
    client = db.query(Client).filter(Client.id == client_id).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Placeholder response - to be enhanced when transaction system is integrated
    return {
        "client_id": client_id,
        "summary": "Activity tracking will be available once transaction monitoring system is integrated.",
        "recent_transactions": [],
        "behavioral_patterns": []
    }
