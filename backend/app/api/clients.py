from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from ..database import get_db
from ..models.client import Client
from ..models.risk_alert import RiskAlert
from ..schemas.insights import ClientInsights
from ..services.llm_service import llm_service

router = APIRouter(prefix="/api/clients", tags=["Client Insights"])


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
