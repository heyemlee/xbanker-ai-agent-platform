"""
Cases and Alerts API endpoints
Handles compliance case management and alert queue operations
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import List, Optional
from datetime import datetime, timedelta
from ..database import get_db
from ..models import Case, RiskAlert, Client
from pydantic import BaseModel

router = APIRouter()


# Pydantic Schemas
class CaseCreate(BaseModel):
    alert_id: Optional[int] = None
    client_id: Optional[int] = None
    case_type: str
    priority: str = "Medium"
    assigned_to: Optional[str] = None
    investigation_notes: Optional[str] = None


class CaseUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    investigation_notes: Optional[str] = None
    conclusion: Optional[str] = None
    sar_status: Optional[str] = None
    sar_filed_date: Optional[str] = None
    sar_reference: Optional[str] = None


class CaseResponse(BaseModel):
    id: int
    alert_id: Optional[int]
    client_id: Optional[int]
    client_name: Optional[str]
    case_type: str
    status: str
    priority: str
    assigned_to: Optional[str]
    investigation_notes: Optional[str]
    conclusion: Optional[str]
    sar_status: Optional[str]
    sar_filed_date: Optional[str]
    sar_reference: Optional[str]
    created_at: str
    updated_at: str
    closed_at: Optional[str]

    class Config:
        from_attributes = True


class AlertQueueItem(BaseModel):
    id: int
    client_id: Optional[int]
    client_name: Optional[str]
    severity: str
    status: str
    priority: str
    summary: str
    sla_due_date: Optional[str]
    assigned_to: Optional[str]
    risk_tags: Optional[List[str]]
    created_at: str
    is_overdue: bool

    class Config:
        from_attributes = True


# API Endpoints

@router.get("/cases", response_model=List[CaseResponse])
def list_cases(
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    assigned_to: Optional[str] = Query(None, description="Filter by assigned analyst"),
    db: Session = Depends(get_db)
):
    """List all cases with optional filters"""
    query = db.query(Case)
    
    if status:
        query = query.filter(Case.status == status)
    if priority:
        query = query.filter(Case.priority == priority)
    if assigned_to:
        query = query.filter(Case.assigned_to == assigned_to)
    
    cases = query.order_by(desc(Case.created_at)).all()
    
    # Add client names
    result = []
    for case in cases:
        case_dict = {
            "id": case.id,
            "alert_id": case.alert_id,
            "client_id": case.client_id,
            "client_name": case.client.full_name if case.client else None,
            "case_type": case.case_type,
            "status": case.status,
            "priority": case.priority,
            "assigned_to": case.assigned_to,
            "investigation_notes": case.investigation_notes,
            "conclusion": case.conclusion,
            "sar_status": case.sar_status,
            "sar_filed_date": case.sar_filed_date.isoformat() if case.sar_filed_date else None,
            "sar_reference": case.sar_reference,
            "created_at": case.created_at.isoformat(),
            "updated_at": case.updated_at.isoformat(),
            "closed_at": case.closed_at.isoformat() if case.closed_at else None,
        }
        result.append(CaseResponse(**case_dict))
    
    return result


@router.post("/cases", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(case_data: CaseCreate, db: Session = Depends(get_db)):
    """Create a new compliance case (typically from escalated alert)"""
    
    # Validate client_id if provided
    if case_data.client_id:
        client = db.query(Client).filter(Client.id == case_data.client_id).first()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Client {case_data.client_id} not found"
            )
    
    # Validate alert_id if provided
    if case_data.alert_id:
        alert = db.query(RiskAlert).filter(RiskAlert.id == case_data.alert_id).first()
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Alert {case_data.alert_id} not found"
            )
        # Update alert status to Escalated
        alert.status = "Escalated"
    
    # Create new case
    new_case = Case(
        alert_id=case_data.alert_id,
        client_id=case_data.client_id,
        case_type=case_data.case_type,
        priority=case_data.priority,
        assigned_to=case_data.assigned_to,
        investigation_notes=case_data.investigation_notes,
        status="Open"
    )
    
    db.add(new_case)
    db.commit()
    db.refresh(new_case)
    
    # Build response
    case_dict = {
        "id": new_case.id,
        "alert_id": new_case.alert_id,
        "client_id": new_case.client_id,
        "client_name": new_case.client.full_name if new_case.client else None,
        "case_type": new_case.case_type,
        "status": new_case.status,
        "priority": new_case.priority,
        "assigned_to": new_case.assigned_to,
        "investigation_notes": new_case.investigation_notes,
        "conclusion": new_case.conclusion,
        "sar_status": new_case.sar_status,
        "sar_filed_date": new_case.sar_filed_date.isoformat() if new_case.sar_filed_date else None,
        "sar_reference": new_case.sar_reference,
        "created_at": new_case.created_at.isoformat(),
        "updated_at": new_case.updated_at.isoformat(),
        "closed_at": new_case.closed_at.isoformat() if new_case.closed_at else None,
    }
    
    return CaseResponse(**case_dict)


@router.get("/cases/{case_id}", response_model=CaseResponse)
def get_case(case_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific case"""
    case = db.query(Case).filter(Case.id == case_id).first()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case {case_id} not found"
        )
    
    case_dict = {
        "id": case.id,
        "alert_id": case.alert_id,
        "client_id": case.client_id,
        "client_name": case.client.full_name if case.client else None,
        "case_type": case.case_type,
        "status": case.status,
        "priority": case.priority,
        "assigned_to": case.assigned_to,
        "investigation_notes": case.investigation_notes,
        "conclusion": case.conclusion,
        "sar_status": case.sar_status,
        "sar_filed_date": case.sar_filed_date.isoformat() if case.sar_filed_date else None,
        "sar_reference": case.sar_reference,
        "created_at": case.created_at.isoformat(),
        "updated_at": case.updated_at.isoformat(),
        "closed_at": case.closed_at.isoformat() if case.closed_at else None,
    }
    
    return CaseResponse(**case_dict)


@router.put("/cases/{case_id}", response_model=CaseResponse)
def update_case(case_id: int, case_update: CaseUpdate, db: Session = Depends(get_db)):
    """Update a case (notes, status, conclusion, SAR)"""
    case = db.query(Case).filter(Case.id == case_id).first()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case {case_id} not found"
        )
    
    # Update fields
    if case_update.status is not None:
        case.status = case_update.status
        if case_update.status == "Closed":
            case.closed_at = datetime.utcnow()
    if case_update.priority is not None:
        case.priority = case_update.priority
    if case_update.assigned_to is not None:
        case.assigned_to = case_update.assigned_to
    if case_update.investigation_notes is not None:
        case.investigation_notes = case_update.investigation_notes
    if case_update.conclusion is not None:
        case.conclusion = case_update.conclusion
    if case_update.sar_status is not None:
        case.sar_status = case_update.sar_status
    if case_update.sar_filed_date is not None:
        case.sar_filed_date = datetime.fromisoformat(case_update.sar_filed_date).date()
    if case_update.sar_reference is not None:
        case.sar_reference = case_update.sar_reference
    
    db.commit()
    db.refresh(case)
    
    case_dict = {
        "id": case.id,
        "alert_id": case.alert_id,
        "client_id": case.client_id,
        "client_name": case.client.full_name if case.client else None,
        "case_type": case.case_type,
        "status": case.status,
        "priority": case.priority,
        "assigned_to": case.assigned_to,
        "investigation_notes": case.investigation_notes,
        "conclusion": case.conclusion,
        "sar_status": case.sar_status,
        "sar_filed_date": case.sar_filed_date.isoformat() if case.sar_filed_date else None,
        "sar_reference": case.sar_reference,
        "created_at": case.created_at.isoformat(),
        "updated_at": case.updated_at.isoformat(),
        "closed_at": case.closed_at.isoformat() if case.closed_at else None,
    }
    
    return CaseResponse(**case_dict)


@router.get("/alerts/open", response_model=List[AlertQueueItem])
def get_open_alerts(
    priority: Optional[str] = Query(None, description="Filter by priority"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    assigned_to: Optional[str] = Query(None, description="Filter by assigned analyst"),
    db: Session = Depends(get_db)
):
    """Get open alerts queue for compliance team dashboard"""
    query = db.query(RiskAlert).filter(RiskAlert.status.in_(["Open", "Under Review"]))
    
    if priority:
        query = query.filter(RiskAlert.priority == priority)
    if severity:
        query = query.filter(RiskAlert.severity == severity)
    if assigned_to:
        query = query.filter(RiskAlert.assigned_to == assigned_to)
    
    alerts = query.order_by(asc(RiskAlert.sla_due_date), desc(RiskAlert.created_at)).all()
    
    # Build response with SLA status
    result = []
    now = datetime.utcnow()
    
    for alert in alerts:
        is_overdue = False
        if alert.sla_due_date:
            is_overdue = alert.sla_due_date < now
        
        alert_dict = {
            "id": alert.id,
            "client_id": alert.client_id,
            "client_name": alert.client.full_name if alert.client else None,
            "severity": alert.severity,
            "status": alert.status,
            "priority": alert.priority,
            "summary": alert.summary,
            "sla_due_date": alert.sla_due_date.isoformat() if alert.sla_due_date else None,
            "assigned_to": alert.assigned_to,
            "risk_tags": alert.risk_tags,
            "created_at": alert.created_at.isoformat(),
            "is_overdue": is_overdue
        }
        result.append(AlertQueueItem(**alert_dict))
    
    return result
