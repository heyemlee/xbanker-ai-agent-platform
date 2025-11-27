from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any

from ..database import get_db
from ..models.client import Client
from ..models.risk_alert import RiskAlert
from ..schemas.risk import (
    RiskAnalysisRequest,
    RiskAlertResponse,
    RiskAlertListResponse,
    RiskAlertListItem
)
from ..services.ai_analysis_service import AIAnalysisService

router = APIRouter(prefix="/api/risk", tags=["Risk Surveillance"])


@router.post("/surveillance", response_model=RiskAlertResponse)
async def analyze_risk(
    request: RiskAnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze activity logs for risk signals using AI and create risk alert
    """
    # Get client name if client_id provided
    client_name = None
    if request.client_id:
        client = db.query(Client).filter(Client.id == request.client_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        client_name = client.full_name
    
    # Prepare context for AI
    context = {
        "activity_log": request.activity_log,
        "client_name": client_name
    }
    
    # Call Unified AI Service
    analysis_result = await AIAnalysisService.analyze(
        context=context,
        template_type="RISK_SURVEILLANCE",
        client_id=request.client_id
    )
    
    # Create risk alert record
    alert = RiskAlert(
        client_id=request.client_id,
        severity=analysis_result.get("severity", "Medium"),
        risk_tags=analysis_result.get("risk_tags", []),
        summary=analysis_result.get("summary", ""),
        next_steps=analysis_result.get("next_steps", ""),
        priority=analysis_result.get("priority", "Medium"),
        status="Open",
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
