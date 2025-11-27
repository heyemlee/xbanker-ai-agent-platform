import json
import logging
from typing import Dict, Any, Optional, List
from openai import OpenAI
from ..config import settings

logger = logging.getLogger(__name__)


class LLMService:
    """Service for interacting with OpenAI API for KYC, Risk, and Insights analysis"""
    
    def __init__(self):
        self.client = None
        self.mock_mode = False
        
        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "":
            try:
                self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
                logger.info("OpenAI client initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}. Using mock mode.")
                self.mock_mode = True
        else:
            logger.warning("No OpenAI API key provided. Using mock mode.")
            self.mock_mode = True
    
    def _call_llm(self, system_prompt: str, user_prompt: str) -> str:
        """Generic method to call OpenAI API"""
        if self.mock_mode or not self.client:
            logger.info("Mock mode: returning placeholder response")
            return self._get_mock_response(system_prompt, user_prompt)
        
        try:
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"LLM API call failed: {e}")
            return self._get_mock_response(system_prompt, user_prompt)
    
    def _get_mock_response(self, system_prompt: str, user_prompt: str) -> str:
        """Generate mock responses for demo purposes"""
        if "KYC" in system_prompt:
            return json.dumps({
                "pep_flag": False,
                "sanctions_flag": False,
                "risk_score": "Medium",
                "risk_rationale": "Client has business activities in multiple jurisdictions including some higher-risk regions. Source of wealth appears legitimate and verified. No PEP or sanctions concerns identified. Medium risk rating assigned due to cross-border complexity.",
                "kyc_summary": "Professional client with established business background. Wealth sources verified through documentation. Enhanced monitoring recommended for cross-border transactions. Overall profile suggests standard risk with appropriate due diligence measures in place."
            })
        elif "risk surveillance" in system_prompt.lower():
            return json.dumps({
                "severity": "Medium",
                "risk_tags": ["transaction_pattern_risk", "jurisdiction_risk"],
                "summary": "Analysis indicates potential elevated risk factors related to transaction patterns and jurisdictional exposure. Recent activity shows increased volume in cross-border transfers. No immediate red flags but warrants enhanced monitoring.",
                "next_steps": "Recommend: (1) Enhanced monitoring of transaction patterns over next 30 days; (2) Request updated source of funds documentation for recent large transfers; (3) Schedule compliance review meeting; (4) Continue routine surveillance."
            })
        else:  # Insights
            return json.dumps({
                "profile_overview": [
                    "Established client with verified professional background",
                    "Diversified portfolio with international exposure",
                    "Active engagement with wealth management services",
                    "Long-term relationship with steady asset growth"
                ],
                "risk_compliance_view": [
                    "Current risk rating: Medium (appropriate for profile)",
                    "All KYC documentation current and verified",
                    "Active monitoring in place for cross-border activities",
                    "No outstanding compliance issues"
                ],
                "suggested_rm_actions": [
                    "Schedule quarterly portfolio review to discuss performance",
                    "Proactively address any compliance questions to maintain trust",
                    "Review estate planning needs given portfolio size",
                    "Discuss tax optimization strategies for international holdings"
                ],
                "next_best_actions": [
                    "Introduce structured products for portfolio diversification",
                    "Offer family office services for comprehensive wealth management",
                    "Present sustainable investment opportunities",
                    "Recommend private banking concierge services"
                ]
            })
    
    async def generate_completion(self, prompt: str, temperature: float = 0.3, max_tokens: int = 500) -> str:
        """
        Generate a completion from the LLM.
        Used by agent orchestrator.
        
        Args:
            prompt: The prompt to send to the LLM
            temperature: Sampling temperature
            max_tokens: Maximum tokens in response
            
        Returns:
            String response from LLM
        """
        if self.mock_mode or not self.client:
            logger.info("Mock mode: returning placeholder response")
            
            # Check if this is a compliance decision request
            if "Compliance Officer" in prompt:
                return json.dumps({
                    "compliance_status": "Approved",
                    "confidence_score": 0.98,
                    "risk_score": 15,
                    "approval_tier": "Level 1 (Automated)",
                    "decision_breakdown": {
                        "kyc_data": "Pass",
                        "rag_check": "Pass",
                        "pep_check": "Pass",
                        "sanctions_check": "Pass"
                    },
                    "pep_flag": False,
                    "sanctions_flag": False,
                    "recommended_actions": [
                        "Approve account opening",
                        "Schedule standard annual review",
                        "Enable standard transaction limits"
                    ],
                    "rationale": "Client profile is consistent with low-risk parameters. No negative news, PEP matches, or sanctions hits found. Source of wealth is verified and transparent."
                })

            # Return generic mock JSON for other requests
            return json.dumps({
                "wealth_sources": ["Technology investments", "Business profits"],
                "business_activities": ["Private equity", "Consulting"],
                "jurisdictions": ["UK", "Monaco", "Switzerland"],
                "red_flags": [],
                "confidence_score": 0.85
            })
        
        try:
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"LLM API call failed: {e}")
            return json.dumps({
                "error": "LLM call failed",
                "fallback": True
            })
    
    def analyze_kyc(self, kyc_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze KYC data and generate risk assessment
        
        Args:
            kyc_data: Dictionary containing client info and KYC notes
        
        Returns:
            Dictionary with pep_flag, sanctions_flag, risk_score, risk_rationale, kyc_summary
        """
        system_prompt = """You are an expert KYC (Know Your Customer) analyst for private banks and wealth management firms.

Your task is to analyze client information and KYC documentation to:
1. Identify if the client is a Politically Exposed Person (PEP)
2. Identify any sanctions concerns
3. Assign a risk score (Low, Medium, or High)
4. Provide rationale for the risk score
5. Generate a professional KYC summary suitable for compliance records

CRITICAL: You must respond with ONLY a valid JSON object in this exact format:
{
  "pep_flag": boolean,
  "sanctions_flag": boolean,
  "risk_score": "Low" | "Medium" | "High",
  "risk_rationale": "string explaining the risk assessment",
  "kyc_summary": "string with professional compliance summary"
}

Do not include any text before or after the JSON object."""

        user_prompt = f"""Analyze the following client information:

Full Name: {kyc_data.get('full_name', 'N/A')}
Date of Birth: {kyc_data.get('date_of_birth', 'N/A')}
Nationality: {kyc_data.get('nationality', 'N/A')}
Residency: {kyc_data.get('residency_country', 'N/A')}
Source of Wealth: {kyc_data.get('source_of_wealth', 'N/A')}
Business Activity: {kyc_data.get('business_activity', 'N/A')}

KYC Notes/Documentation:
{kyc_data.get('kyc_notes', 'N/A')}

Provide your analysis in the required JSON format."""

        response_text = self._call_llm(system_prompt, user_prompt)
        
        try:
            # Try to parse JSON from response
            # Handle cases where LLM might include markdown code blocks
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
            else:
                json_str = response_text.strip()
            
            result = json.loads(json_str)
            return result
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            logger.error(f"Response was: {response_text}")
            # Return safe defaults
            return {
                "pep_flag": False,
                "sanctions_flag": False,
                "risk_score": "Medium",
                "risk_rationale": "Unable to complete automated analysis. Manual review required.",
                "kyc_summary": "Automated KYC analysis incomplete. Please conduct manual review of client documentation."
            }
    
    def analyze_risk(self, activity_log: str, client_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyze activity logs for risk signals
        
        Args:
            activity_log: Text describing client activities, news, or transactions
            client_name: Optional client name for context
        
        Returns:
            Dictionary with severity, risk_tags, summary, next_steps
        """
        system_prompt = """You are an expert compliance and risk surveillance analyst for private banks.

Your task is to analyze client activity logs, news, and transaction information to identify potential risks.

You should look for:
- High-risk jurisdictions
- Unusual transaction patterns
- Negative news or adverse media
- PEP status changes
- Sanctions concerns
- Regulatory red flags
- Association risks

CRITICAL: You must respond with ONLY a valid JSON object in this exact format:
{
  "severity": "Low" | "Medium" | "High" | "Critical",
  "risk_tags": ["tag1", "tag2", ...],
  "summary": "string describing the risk findings",
  "next_steps": "string with recommended actions"
}

Risk tags should use values like: "jurisdiction_risk", "transaction_pattern_risk", "pep_risk", "sanctions_risk", "negative_news", "association_risk", "regulatory_risk"

Do not include any text before or after the JSON object."""

        context = f"Client: {client_name}\n\n" if client_name else ""
        user_prompt = f"""{context}Activity Log to Analyze:
{activity_log}

Provide your risk analysis in the required JSON format."""

        response_text = self._call_llm(system_prompt, user_prompt)
        
        try:
            # Parse JSON from response
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
            else:
                json_str = response_text.strip()
            
            result = json.loads(json_str)
            return result
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            logger.error(f"Response was: {response_text}")
            return {
                "severity": "Medium",
                "risk_tags": ["analysis_error"],
                "summary": "Automated risk analysis incomplete. Manual review required.",
                "next_steps": "Please conduct manual review of the activity log by compliance team."
            }
    
    def generate_insights(
        self,
        client_data: Dict[str, Any],
        risk_alerts: List[Dict[str, Any]]
    ) -> Dict[str, List[str]]:
        """
        Generate Client 360 insights for relationship managers
        
        Args:
            client_data: Client profile information
            risk_alerts: List of risk alerts for the client
        
        Returns:
            Dictionary with profile_overview, risk_compliance_view, suggested_rm_actions, next_best_actions
        """
        system_prompt = """You are an expert relationship manager advisor for private banking.

Your task is to generate actionable insights for relationship managers based on client profile and risk information.

CRITICAL: You must respond with ONLY a valid JSON object in this exact format:
{
  "profile_overview": ["point 1", "point 2", "point 3", "point 4"],
  "risk_compliance_view": ["point 1", "point 2", "point 3", "point 4"],
  "suggested_rm_actions": ["action 1", "action 2", "action 3", "action 4"],
  "next_best_actions": ["opportunity 1", "opportunity 2", "opportunity 3", "opportunity 4"]
}

Each array should contain 3-5 concise, actionable bullet points.

Do not include any text before or after the JSON object."""

        alerts_summary = "\n".join([
            f"- {alert.get('severity')} severity: {alert.get('summary', 'N/A')[:100]}..."
            for alert in risk_alerts[:5]  # Limit to 5 most recent
        ]) if risk_alerts else "No active alerts"

        user_prompt = f"""Generate Client 360 insights:

CLIENT PROFILE:
Name: {client_data.get('full_name', 'N/A')}
Nationality: {client_data.get('nationality', 'N/A')}
Residency: {client_data.get('residency_country', 'N/A')}
Risk Score: {client_data.get('risk_score', 'N/A')}
Source of Wealth: {client_data.get('source_of_wealth', 'N/A')}
Business Activity: {client_data.get('business_activity', 'N/A')}
PEP Status: {'Yes' if client_data.get('pep_flag') else 'No'}

KYC SUMMARY:
{client_data.get('kyc_summary', 'N/A')}

RISK ALERTS:
{alerts_summary}

Provide insights in the required JSON format."""

        response_text = self._call_llm(system_prompt, user_prompt)
        
        try:
            # Parse JSON from response
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
            else:
                json_str = response_text.strip()
            
            result = json.loads(json_str)
            return result
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            logger.error(f"Response was: {response_text}")
            return {
                "profile_overview": [
                    "Client profile analysis in progress",
                    "Manual review recommended"
                ],
                "risk_compliance_view": [
                    "Automated analysis incomplete",
                    "Please review compliance status manually"
                ],
                "suggested_rm_actions": [
                    "Schedule client review meeting",
                    "Update client documentation"
                ],
                "next_best_actions": [
                    "Review service offerings",
                    "Schedule quarterly check-in"
                ]
            }


# Global instance
llm_service = LLMService()
