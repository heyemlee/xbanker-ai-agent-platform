from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from ..database import get_db
from ..models.client import Client
from ..models.risk_alert import RiskAlert
from ..schemas.insights import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Get dashboard statistics
    """
    # Total clients
    total_clients = db.query(Client).count()
    
    # High risk clients
    high_risk_clients = db.query(Client).filter(
        Client.risk_score.in_(["High", "Critical"])
    ).count()
    
    # Open risk alerts (all alerts, or you could filter by recent)
    open_risk_alerts = db.query(RiskAlert).count()
    
    # Recent KYC analyses (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_kyc_analyses = db.query(Client).filter(
        Client.created_at >= seven_days_ago
    ).count()
    
    return {
        "total_clients": total_clients,
        "high_risk_clients": high_risk_clients,
        "open_risk_alerts": open_risk_alerts,
        "recent_kyc_analyses": recent_kyc_analyses
    }
