from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any, Dict
from datetime import datetime, timedelta, date

from ..database import get_db
from ..models.client import Client
from ..models.kyc_record import KYCRecord
from ..schemas.client import (
    KYCAnalysisRequest,
    ClientResponse,
    ClientListResponse,
    ClientListItem
)
from ..services.ai_analysis_service import AIAnalysisService

router = APIRouter(prefix="/api/kyc", tags=["KYC Workflows"])


@router.post("/analyze", response_model=ClientResponse)
async def analyze_kyc(
    request: KYCAnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze KYC data using AI, create/update client, and record KYC history
    """
    # Prepare context for AI
    context = {
        "full_name": request.full_name,
        "date_of_birth": str(request.date_of_birth) if request.date_of_birth else None,
        "nationality": request.nationality,
        "residency_country": request.residency_country,
        "source_of_wealth": request.source_of_wealth,
        "business_activity": request.business_activity,
        "kyc_notes": request.kyc_notes
    }
    
    # Call Unified AI Service
    analysis_result = await AIAnalysisService.analyze(
        context=context,
        template_type="KYC_ANALYSIS"
    )
    
    # Calculate next review date
    next_review_months = analysis_result.get("next_review_months", 12)
    next_review_date = date.today() + timedelta(days=next_review_months * 30)
    
    # Check if client exists
    client = db.query(Client).filter(Client.full_name == request.full_name).first()
    
    if client:
        # Update existing client
        client.date_of_birth = request.date_of_birth or client.date_of_birth
        client.nationality = request.nationality or client.nationality
        client.residency_country = request.residency_country or client.residency_country
        client.source_of_wealth = request.source_of_wealth or client.source_of_wealth
        client.business_activity = request.business_activity or client.business_activity
        client.raw_kyc_notes = request.kyc_notes
        client.updated_at = datetime.utcnow()
    else:
        # Create new client
        client = Client(
            full_name=request.full_name,
            date_of_birth=request.date_of_birth,
            nationality=request.nationality,
            residency_country=request.residency_country,
            source_of_wealth=request.source_of_wealth,
            business_activity=request.business_activity,
            raw_kyc_notes=request.kyc_notes,
            status="Active"
        )
        db.add(client)
        db.flush()  # Get ID
        
    # Update Client Risk Profile
    client.risk_score = analysis_result.get("risk_score", "Medium")
    client.risk_rationale = analysis_result.get("risk_rationale", "")
    client.kyc_summary = analysis_result.get("kyc_summary", "")
    client.pep_flag = analysis_result.get("pep_flag", False)
    client.sanctions_flag = analysis_result.get("sanctions_flag", False)
    client.next_review_date = next_review_date
    
    # Create KYC Record (History)
    # Determine version
    last_record = db.query(KYCRecord).filter(KYCRecord.client_id == client.id).order_by(KYCRecord.version.desc()).first()
    new_version = (last_record.version + 1) if last_record else 1
    
    kyc_record = KYCRecord(
        client_id=client.id,
        version=new_version,
        risk_score=client.risk_score,
        risk_rationale=client.risk_rationale,
        kyc_summary=client.kyc_summary,
        cdd_conclusion=analysis_result.get("cdd_conclusion", "Standard CDD"),
        edd_required=analysis_result.get("edd_required", False),
        review_date=date.today(),
        next_review_date=next_review_date
    )
    db.add(kyc_record)
    
    db.commit()
    db.refresh(client)
    
    # Construct response combining Client and Analysis details
    response_data = {
        "id": client.id,
        "full_name": client.full_name,
        "date_of_birth": client.date_of_birth,
        "nationality": client.nationality,
        "residency_country": client.residency_country,
        "source_of_wealth": client.source_of_wealth,
        "business_activity": client.business_activity,
        "pep_flag": client.pep_flag,
        "sanctions_flag": client.sanctions_flag,
        "risk_score": client.risk_score,
        "risk_rationale": client.risk_rationale,
        "kyc_summary": client.kyc_summary,
        "raw_kyc_notes": client.raw_kyc_notes,
        "created_at": client.created_at,
        "updated_at": client.updated_at,
        # Enhanced fields from analysis
        "cdd_conclusion": kyc_record.cdd_conclusion,
        "edd_required": kyc_record.edd_required,
        "next_review_date": client.next_review_date
    }
    
    return response_data


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
    
    # For GET, we might not have the latest KYC record details in the Client object directly
    # if we want to populate cdd_conclusion etc. we should fetch the latest record.
    # However, ClientResponse fields are optional.
    
    return client
