from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from ..models.client import Client
from ..models.risk_alert import RiskAlert
from ..schemas.client import (
    KYCAnalysisRequest,
    ClientResponse,
    ClientListResponse,
    ClientListItem
)
from ..services.llm_service import llm_service

router = APIRouter(prefix="/api/kyc", tags=["KYC Workflows"])


@router.post("/analyze", response_model=ClientResponse)
async def analyze_kyc(
    request: KYCAnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze KYC data using AI and create client profile with risk assessment
    """
    # Prepare data for LLM
    kyc_data = {
        "full_name": request.full_name,
        "date_of_birth": str(request.date_of_birth) if request.date_of_birth else None,
        "nationality": request.nationality,
        "residency_country": request.residency_country,
        "source_of_wealth": request.source_of_wealth,
        "business_activity": request.business_activity,
        "kyc_notes": request.kyc_notes
    }
    
    # Call LLM service to analyze KYC data
    analysis_result = llm_service.analyze_kyc(kyc_data)
    
    # Create client record
    client = Client(
        full_name=request.full_name,
        date_of_birth=request.date_of_birth,
        nationality=request.nationality,
        residency_country=request.residency_country,
        source_of_wealth=request.source_of_wealth,
        business_activity=request.business_activity,
        pep_flag=analysis_result.get("pep_flag", False),
        sanctions_flag=analysis_result.get("sanctions_flag", False),
        risk_score=analysis_result.get("risk_score", "Medium"),
        risk_rationale=analysis_result.get("risk_rationale", ""),
        kyc_summary=analysis_result.get("kyc_summary", ""),
        raw_kyc_notes=request.kyc_notes
    )
    
    db.add(client)
    db.commit()
    db.refresh(client)
    
    return client


@router.get("/clients", response_model=ClientListResponse)
async def get_clients(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get list of all clients
    """
    clients = db.query(Client).order_by(Client.created_at.desc()).offset(skip).limit(limit).all()
    total = db.query(Client).count()
    
    return {
        "clients": clients,
        "total": total
    }


@router.get("/clients/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed client profile by ID
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return client
