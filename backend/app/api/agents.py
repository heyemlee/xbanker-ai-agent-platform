"""
Agent Orchestration API Endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.agent_orchestrator import AgentOrchestrator
from app.services.llm_service import llm_service

router = APIRouter(prefix="/agents", tags=["agents"])

class AgentWorkflowRequest(BaseModel):
    full_name: str
    kyc_notes: str
    nationality: str | None = None
    residency_country: str | None = None

@router.post("/orchestrate")
async def run_agent_orchestration(
    request: AgentWorkflowRequest,
    db: Session = Depends(get_db)
):
    """
    Run multi-agent orchestration workflow.
    
    Demonstrates:
    - Multi-agent coordination
    - RAG for context retrieval
    - Tool calling for compliance checks
    """
    try:
        # Use global llm_service instance
        orchestrator = AgentOrchestrator(llm_service)
        
        # Run orchestration
        result = await orchestrator.orchestrate_kyc_workflow({
            "full_name": request.full_name,
            "kyc_notes": request.kyc_notes,
            "nationality": request.nationality,
            "residency_country": request.residency_country
        })
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Agent orchestration failed: {str(e)}"
        )

@router.get("/workflow-info")
async def get_workflow_info():
    """
    Get information about the agent orchestration workflow.
    """
    return {
        "workflow_name": "KYC Multi-Agent Analysis",
        "agents": [
            {
                "name": "KYC Analyst Agent",
                "role": "Data Extraction Specialist",
                "capabilities": [
                    "Extract structured data from unstructured text",
                    "Identify wealth sources and business activities",
                    "Flag potential red flags"
                ],
                "tools": []
            },
            {
                "name": "Risk Assessor Agent",
                "role": "Risk Analysis with RAG",
                "capabilities": [
                    "Assess risk based on extracted data",
                    "Compare to historical cases using RAG",
                    "Provide context-aware risk scoring"
                ],
                "tools": ["RAG Retrieval System"]
            },
            {
                "name": "Compliance Agent",
                "role": "Regulatory Validation",
                "capabilities": [
                    "Check PEP databases",
                    "Verify sanctions lists",
                    "Make final compliance decision"
                ],
                "tools": ["PEP Database API", "Sanctions Database API"]
            }
        ],
        "workflow_steps": [
            "1. KYC Analyst extracts structured data",
            "2. Risk Assessor retrieves similar cases (RAG) and assesses risk",
            "3. Compliance Agent calls tools to verify regulatory status",
            "4. Final decision synthesized from all agents"
        ]
    }
