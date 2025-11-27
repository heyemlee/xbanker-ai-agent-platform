from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta, date

from ..database import get_db
from ..models import Client, RiskAlert, Case, KYCRecord
from ..schemas.insights import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Get dashboard statistics aligned with compliance operations
    """
    # Client Perspective
    total_clients = db.query(Client).count()
    
    # High risk clients (based on latest KYC + transaction monitoring)
    high_risk_clients = db.query(Client).filter(
        Client.risk_score.in_(["High", "Critical"])
    ).count()
    
    # Case Perspective (NEW)
    open_cases = db.query(Case).filter(
        Case.status.in_(["Open", "Under Investigation"])
    ).count()
    
    # New alerts (today)
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    new_alerts_today = db.query(RiskAlert).filter(
        RiskAlert.created_at >= today_start
    ).count()
    
    # New alerts (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    new_alerts_7days = db.query(RiskAlert).filter(
        RiskAlert.created_at >= seven_days_ago
    ).count()
    
    # Compliance Health (NEW)
    # KYC up-to-date percentage (clients with next_review_date in future or null)
    today = date.today()
    clients_with_reviews = db.query(Client).filter(
        Client.next_review_date.isnot(None)
    ).count()
    
    if clients_with_reviews > 0:
        uptodate_clients = db.query(Client).filter(
            and_(
                Client.next_review_date.isnot(None),
                Client.next_review_date >= today
            )
        ).count()
        kyc_uptodate_percentage = round((uptodate_clients / clients_with_reviews) * 100, 1)
    else:
        kyc_uptodate_percentage = 100.0  # No reviews scheduled = 100% compliant
    
    # Upcoming reviews (next 30 days)
    thirty_days_from_now = today + timedelta(days=30)
    kyc_upcoming_reviews = db.query(Client).filter(
        and_(
            Client.next_review_date.isnot(None),
            Client.next_review_date >= today,
            Client.next_review_date <= thirty_days_from_now
        )
    ).count()
    
    # Legacy metric for backward compatibility (but will be removed from frontend)
    open_risk_alerts = db.query(RiskAlert).filter(
        RiskAlert.status.in_(["Open", "Under Review"])
    ).count()
    
    return {
        "total_clients": total_clients,
        "high_risk_clients": high_risk_clients,
        "open_risk_alerts": open_risk_alerts,  # Legacy
        "recent_kyc_analyses": 0,  # Deprecated
        "open_cases": open_cases,  # NEW
        "new_alerts_today": new_alerts_today,  # NEW
        "new_alerts_7days": new_alerts_7days,  # NEW
        "kyc_uptodate_percentage": kyc_uptodate_percentage,  # NEW
        "kyc_upcoming_reviews": kyc_upcoming_reviews  # NEW
    }
