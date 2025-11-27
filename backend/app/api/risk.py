from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models.client import Client
from ..models.risk_alert import RiskAlert
from ..schemas.risk import (
    RiskAnalysisRequest,
    RiskAlertResponse,
    RiskAlertListResponse,
    RiskAlertListItem
)
from ..services.llm_service import llm_service

router = APIRouter(prefix="/api/risk", tags=["Risk Surveillance"])


@router.post("/surveillance", response_model=RiskAlertResponse)
async def analyze_risk(
    request: RiskAnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze activity logs for risk signals using AI
    """
    # Get client name if client_id provided
    client_name = None
    if request.client_id:
        client = db.query(Client).filter(Client.id == request.client_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        client_name = client.full_name
    
    # Call LLM service to analyze risk
    risk_analysis = llm_service.analyze_risk(
        activity_log=request.activity_log,
        client_name=client_name
    )
    
    # Create risk alert record
    alert = RiskAlert(
        client_id=request.client_id,
        severity=risk_analysis.get("severity", "Medium"),
        risk_tags=risk_analysis.get("risk_tags", []),
        summary=risk_analysis.get("summary", ""),
        next_steps=risk_analysis.get("next_steps", ""),
        raw_activity_log=request.activity_log
    )
    
    db.add(alert)
    db.commit()
    db.refresh(alert)
    
    return alert


@router.get("/alerts", response_model=RiskAlertListResponse)
async def get_risk_alerts(
    severity: Optional[str] = Query(None, description="Filter by severity"),
    client_id: Optional[int] = Query(None, description="Filter by client ID"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get list of risk alerts with optional filtering
    """
    query = db.query(RiskAlert)
    
    if severity:
        query = query.filter(RiskAlert.severity == severity)
    
    if client_id:
        query = query.filter(RiskAlert.client_id == client_id)
    
    total = query.count()
    alerts = query.order_by(RiskAlert.created_at.desc()).offset(skip).limit(limit).all()
    
    # Build response with client names
    alert_items = []
    for alert in alerts:
        client_name = None
        if alert.client_id:
            client = db.query(Client).filter(Client.id == alert.client_id).first()
            if client:
                client_name = client.full_name
        
        alert_items.append(RiskAlertListItem(
            id=alert.id,
            client_id=alert.client_id,
            client_name=client_name,
            severity=alert.severity,
            risk_tags=alert.risk_tags,
            summary=alert.summary,
            created_at=alert.created_at
        ))
    
    return {
        "alerts": alert_items,
        "total": total
    }
