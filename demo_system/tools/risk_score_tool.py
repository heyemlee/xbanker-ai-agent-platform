"""
Risk Score Demo Tool - Generates risk assessment scores

For interview demo purposes - returns randomized but realistic risk scores.
In production, would integrate with internal risk models or third-party APIs.
"""

import json
import time
import random
from typing import Dict, Any, List, Optional
from datetime import datetime


class RiskScoreTool:
    """
    MCP Tool: Risk Score Calculator
    
    Simulates calculating risk scores based on client profile and activity.
    """
    
    # Tool metadata for MCP discovery
    TOOL_NAME = "risk_score_calculator"
    TOOL_DESCRIPTION = "Calculates risk scores for clients based on profile, activity, and external data"
    
    TOOL_SCHEMA = {
        "name": TOOL_NAME,
        "description": TOOL_DESCRIPTION,
        "input_schema": {
            "type": "object",
            "properties": {
                "client_name": {
                    "type": "string",
                    "description": "Client name to assess"
                },
                "client_data": {
                    "type": "object",
                    "description": "Client profile data (nationality, jurisdictions, wealth sources, etc.)",
                    "properties": {
                        "nationality": {"type": "string"},
                        "jurisdictions": {"type": "array", "items": {"type": "string"}},
                        "wealth_sources": {"type": "array", "items": {"type": "string"}},
                        "transaction_volume": {"type": "string"}
                    }
                }
            },
            "required": ["client_name"]
        }
    }
    
    # Risk factor definitions
    RISK_FACTORS = {
        "jurisdiction": {
            "high_risk": ["Russia", "Iran", "North Korea", "Syria", "Afghanistan"],
            "medium_risk": ["China", "UAE", "Cayman Islands", "Panama"],
            "low_risk": ["UK", "US", "Switzerland", "Germany", "Singapore"]
        },
        "wealth_source": {
            "high_risk": ["Cryptocurrency mining", "Unnamed sources", "Cash businesses"],
            "medium_risk": ["Real estate", "Private equity", "Offshore investments"],
            "low_risk": ["Technology sale", "Inheritance", "Professional income"]
        }
    }
    
    def __init__(self):
        """Initialize risk score tool"""
        self.execution_count = 0
        random.seed(42)  # Deterministic for demo consistency
    
    def execute(
        self, 
        client_name: str, 
        client_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Calculate risk score (mock version)
        
        Args:
            client_name: Name of client
            client_data: Optional client profile data
            
        Returns:
            Dict with risk score and analysis
        """
        start_time = time.time()
        self.execution_count += 1
        
        # Simulate risk calculation delay
        time.sleep(0.3)
        
        # Calculate mock risk score
        risk_assessment = self._calculate_mock_risk(client_name, client_data or {})
        
        execution_time = time.time() - start_time
        
        return {
            "tool": self.TOOL_NAME,
            "status": "success",
            "client_name": client_name,
            "risk_level": risk_assessment["level"],
            "risk_score": risk_assessment["score"],  # 0-100
            "risk_factors": risk_assessment["factors"],
            "analysis": risk_assessment["analysis"],
            "recommendation": risk_assessment["recommendation"],
            "metadata": {
                "processing_time_seconds": round(execution_time, 2),
                "timestamp": datetime.now().isoformat(),
                "execution_number": self.execution_count,
                "model_version": "demo_v1.0"
            },
            "mock_data": True,
            "production_note": "In production, would integrate with internal risk models and external data sources"
        }
    
    def _calculate_mock_risk(
        self, 
        client_name: str, 
        client_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate realistic but randomized risk assessment
        """
        # Base score (deterministic based on name hash for consistency)
        base_score = (hash(client_name) % 50) + 10  # Range: 10-60
        
        # Adjust based on client data
        jurisdictions = client_data.get("jurisdictions", [])
        wealth_sources = client_data.get("wealth_sources", [])
        
        risk_factors = []
        score_adjustment = 0
        
        # Check jurisdictions
        for jurisdiction in jurisdictions:
            if jurisdiction in self.RISK_FACTORS["jurisdiction"]["high_risk"]:
                risk_factors.append(f"High-risk jurisdiction: {jurisdiction}")
                score_adjustment += 20
            elif jurisdiction in self.RISK_FACTORS["jurisdiction"]["medium_risk"]:
                risk_factors.append(f"Medium-risk jurisdiction: {jurisdiction}")
                score_adjustment += 10
        
        # Check wealth sources
        for source in wealth_sources:
            if any(risk in source for risk in self.RISK_FACTORS["wealth_source"]["high_risk"]):
                risk_factors.append(f"High-risk wealth source: {source}")
                score_adjustment += 15
            elif any(risk in source for risk in self.RISK_FACTORS["wealth_source"]["medium_risk"]):
                risk_factors.append(f"Medium-risk wealth source: {source}")
                score_adjustment += 5
        
        # Calculate final score
        final_score = min(100, base_score + score_adjustment)
        
        # Determine risk level
        if final_score < 30:
            level = "Low"
            recommendation = "Standard monitoring procedures recommended"
        elif final_score < 65:
            level = "Medium"
            recommendation = "Enhanced monitoring recommended"
        else:
            level = "High"
            recommendation = "Enhanced due diligence required before onboarding"
        
        # Generate analysis
        if not risk_factors:
            risk_factors = ["Clean profile", "Transparent wealth sources", "Low-risk jurisdictions"]
            analysis = f"Client {client_name} presents a {level.lower()} risk profile with no significant red flags."
        else:
            analysis = f"Client {client_name} presents a {level.lower()} risk profile. Key factors: {', '.join(risk_factors[:2])}."
        
        return {
            "level": level,
            "score": final_score,
            "factors": risk_factors,
            "analysis": analysis,
            "recommendation": recommendation
        }
    
    def get_schema(self) -> Dict[str, Any]:
        """Return tool schema for MCP discovery"""
        return self.TOOL_SCHEMA
    
    def __repr__(self) -> str:
        return f"<RiskScoreTool executions={self.execution_count}>"
