"""
Unified AI Analysis Service
Provides a single analysis engine with template-based prompts for both KYC and Risk Surveillance
"""

import os
import json
from typing import Dict, Any, Optional, Literal
from openai import OpenAI

from ..config import settings

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY)

TemplateType = Literal["KYC_ANALYSIS", "RISK_SURVEILLANCE"]


class AIAnalysisService:
    """Unified AI analysis service with template-based prompts"""
    
    @staticmethod
    def _get_kyc_prompt(context: Dict[str, Any]) -> str:
        """Generate KYC analysis prompt"""
        return f"""You are an expert KYC (Know Your Customer) compliance analyst. Analyze the following client information and provide a comprehensive risk assessment.

**Client Information:**
- Full Name: {context.get('full_name', 'N/A')}
- Date of Birth: {context.get('date_of_birth', 'N/A')}
- Nationality: {context.get('nationality', 'N/A')}
- Residency Country: {context.get('residency_country', 'N/A')}
- Source of Wealth: {context.get('source_of_wealth', 'N/A')}
- Business Activity: {context.get('business_activity', 'N/A')}

**KYC Documentation & Notes:**
{context.get('kyc_notes', 'N/A')}

**Analysis Requirements:**
1. Assess overall risk level (Low, Medium, or High)
2. Check for PEP (Politically Exposed Person) indicators
3. Check for sanctions list matches or concerns
4. Determine if Standard CDD or Enhanced CDD is required
5. Recommend if Enhanced Due Diligence (EDD) is necessary
6. Suggest next review date based on risk level

Please provide your analysis in the following JSON format:
{{
  "risk_score": "Low|Medium|High",
  "pep_flag": true|false,
  "sanctions_flag": true|false,
  "risk_rationale": "Detailed explanation of the risk assessment",
  "kyc_summary": "Executive summary of the client profile and key findings",
  "cdd_conclusion": "Standard CDD|Enhanced CDD",
  "edd_required": true|false,
  "next_review_months": 12|6|3
}}

Respond ONLY with the JSON object, no additional text."""

    @staticmethod
    def _get_risk_surveillance_prompt(context: Dict[str, Any]) -> str:
        """Generate risk surveillance analysis prompt"""
        client_info = ""
        if context.get('client_name'):
            client_info = f"\n**Associated Client:** {context['client_name']}"
        
        return f"""You are an expert in financial crime risk surveillance and transaction monitoring. Analyze the following activity/transaction data for potential money laundering, fraud, or other suspicious patterns.{client_info}

**Activity Log / Transaction Data / Intelligence:**
{context.get('activity_log', 'N/A')}

**Analysis Requirements:**
1. Identify any suspicious patterns or red flags
2. Assess severity level (Low, Medium, High, or Critical)
3. Tag relevant risk categories
4. Provide actionable next steps for the compliance team
5. List any entities (persons, companies, locations) involved

Please provide your analysis in the following JSON format:
{{
  "severity": "Low|Medium|High|Critical",
  "summary": "Brief summary of the alert",
  "risk_tags": ["tag1", "tag2", "tag3"],
  "entities": ["entity1", "entity2"],
  "next_steps": "Recommended actions for compliance team",
  "priority": "Low|Medium|High|Critical"
}}

Common risk tags include: transaction_pattern_risk, pep_association, high_risk_jurisdiction, structuring, unusual_activity, sanctions_exposure, adverse_media

Respond ONLY with the JSON object, no additional text."""

    @classmethod
    async def analyze(
        cls,
        context: Dict[str, Any],
        template_type: TemplateType,
        client_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Unified analysis method that handles both KYC and Risk Surveillance
        
        Args:
            context: Dictionary containing all relevant data for analysis
            template_type: Type of analysis to perform
            client_id: Optional client ID for linking results
            
        Returns:
            Dictionary containing analysis results specific to template type
        """
        try:
            # Select appropriate prompt based on template
            if template_type == "KYC_ANALYSIS":
                prompt = cls._get_kyc_prompt(context)
            elif template_type == "RISK_SURVEILLANCE":
                prompt = cls._get_risk_surveillance_prompt(context)
            else:
                raise ValueError(f"Unknown template type: {template_type}")
            
            # Call OpenAI API
            # Force gpt-4o to avoid env var conflicts causing 400 error
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert compliance analyst. Always respond with valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            # Parse response
            result = json.loads(response.choices[0].message.content)
            
            # Add client_id to result if provided
            if client_id:
                result["client_id"] = client_id
            
            return result
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse AI response as JSON: {e}")
        except Exception as e:
            raise Exception(f"AI analysis failed: {str(e)}")
    
    @classmethod
    def analyze_sync(
        cls,
        context: Dict[str, Any],
        template_type: TemplateType,
        client_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Synchronous version of analyze method for non-async contexts
        """
        try:
            # Select appropriate prompt based on template
            if template_type == "KYC_ANALYSIS":
                prompt = cls._get_kyc_prompt(context)
            elif template_type == "RISK_SURVEILLANCE":
                prompt = cls._get_risk_surveillance_prompt(context)
            else:
                raise ValueError(f"Unknown template type: {template_type}")
            
            # Call OpenAI API
            # Force gpt-4o to avoid env var conflicts causing 400 error
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert compliance analyst. Always respond with valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            # Parse response
            result = json.loads(response.choices[0].message.content)
            
            # Add client_id to result if provided
            if client_id:
                result["client_id"] = client_id
            
            return result
            
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse AI response as JSON: {e}")
        except Exception as e:
            raise Exception(f"AI analysis failed: {str(e)}")
