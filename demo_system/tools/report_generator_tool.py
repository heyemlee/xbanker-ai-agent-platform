"""
Report Generator Demo Tool - Generates compliance reports

Combines outputs from other tools (OCR, Risk Score) to create comprehensive reports.
For interview demo purposes - generates formatted mock reports.
"""

import json
import time
from typing import Dict, Any, Optional
from datetime import datetime


class ReportGeneratorTool:
    """
    MCP Tool: Compliance Report Generator
    
    Generates comprehensive compliance reports by combining data from multiple sources.
    """
    
    # Tool metadata for MCP discovery
    TOOL_NAME = "compliance_report_generator"
    TOOL_DESCRIPTION = "Generates comprehensive compliance reports from OCR, risk scores, and other data sources"
    
    TOOL_SCHEMA = {
        "name": TOOL_NAME,
        "description": TOOL_DESCRIPTION,
        "input_schema": {
            "type": "object",
            "properties": {
                "client_name": {
                    "type": "string",
                    "description": "Client name for the report"
                },
                "ocr_data": {
                    "type": "object",
                    "description": "OCR extracted data from documents"
                },
                "risk_data": {
                    "type": "object",
                    "description": "Risk assessment data"
                },
                "additional_context": {
                    "type": "string",
                    "description": "Additional context or notes to include"
                },
                "report_type": {
                    "type": "string",
                    "description": "Type of report: 'onboarding', 'annual_review', 'enhanced_dd'",
                    "enum": ["onboarding", "annual_review", "enhanced_dd"],
                    "default": "onboarding"
                }
            },
            "required": ["client_name"]
        }
    }
    
    def __init__(self):
        """Initialize report generator tool"""
        self.execution_count = 0
    
    def execute(
        self,
        client_name: str,
        ocr_data: Optional[Dict[str, Any]] = None,
        risk_data: Optional[Dict[str, Any]] = None,
        additional_context: Optional[str] = None,
        report_type: str = "onboarding"
    ) -> Dict[str, Any]:
        """
        Generate compliance report
        
        Args:
            client_name: Client name
            ocr_data: OCR results from document scanning
            risk_data: Risk assessment results
            additional_context: Additional notes
            report_type: Type of report to generate
            
        Returns:
            Dict with formatted report and metadata
        """
        start_time = time.time()
        self.execution_count += 1
        
        # Simulate report generation delay
        time.sleep(0.4)
        
        # Generate report
        report = self._generate_report(
            client_name=client_name,
            ocr_data=ocr_data,
            risk_data=risk_data,
            additional_context=additional_context,
            report_type=report_type
        )
        
        execution_time = time.time() - start_time
        
        return {
            "tool": self.TOOL_NAME,
            "status": "success",
            "client_name": client_name,
            "report_type": report_type,
            "report": report,
            "metadata": {
                "processing_time_seconds": round(execution_time, 2),
                "timestamp": datetime.now().isoformat(),
                "execution_number": self.execution_count,
                "report_id": f"RPT-{datetime.now().strftime('%Y%m%d')}-{self.execution_count:04d}"
            },
            "mock_data": True,
            "production_note": "In production, would generate PDF reports and integrate with compliance management systems"
        }
    
    def _generate_report(
        self,
        client_name: str,
        ocr_data: Optional[Dict[str, Any]],
        risk_data: Optional[Dict[str, Any]],
        additional_context: Optional[str],
        report_type: str
    ) -> str:
        """
        Generate formatted compliance report
        """
        # Extract key information
        risk_level = risk_data.get("risk_level", "Unknown") if risk_data else "Not Assessed"
        risk_score = risk_data.get("risk_score", 0) if risk_data else 0
        
        # Count documents processed
        doc_count = 1 if ocr_data and ocr_data.get("extracted_text") else 0
        
        # Generate report header
        report_title = {
            "onboarding": "CLIENT ONBOARDING COMPLIANCE REPORT",
            "annual_review": "ANNUAL CLIENT REVIEW REPORT",
            "enhanced_dd": "ENHANCED DUE DILIGENCE REPORT"
        }.get(report_type, "COMPLIANCE REPORT")
        
        # Build report
        report_lines = [
            "=" * 80,
            report_title.center(80),
            "=" * 80,
            "",
            f"Report ID: RPT-{datetime.now().strftime('%Y%m%d')}-{self.execution_count:04d}",
            f"Generation Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"Client Name: {client_name}",
            "",
            "-" * 80,
            "EXECUTIVE SUMMARY",
            "-" * 80,
            "",
        ]
        
        # Add document processing summary
        if ocr_data:
            report_lines.extend([
                f"Documents Processed: {doc_count}",
                f"OCR Confidence: {ocr_data.get('metadata', {}).get('confidence_score', 0):.1%}",
                "",
            ])
        
        # Add risk assessment summary
        if risk_data:
            report_lines.extend([
                "RISK ASSESSMENT:",
                f"  Risk Level: {risk_level}",
                f"  Risk Score: {risk_score}/100",
                f"  Assessment: {risk_data.get('analysis', 'No analysis available')}",
                "",
            ])
            
            # Add risk factors
            risk_factors = risk_data.get("risk_factors", [])
            if risk_factors:
                report_lines.extend([
                    "Risk Factors Identified:",
                ])
                for i, factor in enumerate(risk_factors[:5], 1):
                    report_lines.append(f"  {i}. {factor}")
                report_lines.append("")
        
        # Add OCR extracted information
        if ocr_data and ocr_data.get("extracted_text"):
            report_lines.extend([
                "-" * 80,
                "DOCUMENT ANALYSIS",
                "-" * 80,
                "",
                "Key Information Extracted:",
                "",
                ocr_data["extracted_text"][:500] + "..." if len(ocr_data["extracted_text"]) > 500 else ocr_data["extracted_text"],
                "",
            ])
        
        # Add recommendations
        report_lines.extend([
            "-" * 80,
            "RECOMMENDATIONS",
            "-" * 80,
            "",
        ])
        
        if risk_data:
            report_lines.append(f"• {risk_data.get('recommendation', 'Standard procedures apply')}")
        
        if risk_level == "Low":
            report_lines.extend([
                "• Approve for standard onboarding",
                "• Apply standard monitoring procedures",
                "• Schedule annual review"
            ])
        elif risk_level == "Medium":
            report_lines.extend([
                "• Approve with enhanced monitoring",
                "• Request additional documentation for high-value transactions",
                "• Schedule semi-annual reviews"
            ])
        else:  # High
            report_lines.extend([
                "• Conduct enhanced due diligence before approval",
                "• Escalate to senior compliance team",
                "• Implement continuous monitoring",
                "• Document all transactions"
            ])
        
        # Add additional context
        if additional_context:
            report_lines.extend([
                "",
                "-" * 80,
                "ADDITIONAL NOTES",
                "-" * 80,
                "",
                additional_context,
            ])
        
        # Add footer
        report_lines.extend([
            "",
            "-" * 80,
            "REPORT VALIDATION",
            "-" * 80,
            "",
            "This report was automatically generated by the AI Agent Platform.",
            "For interview demonstration purposes - contains mock data.",
            "",
            f"Generated by: Multi-Agent Compliance System v1.0",
            f"Timestamp: {datetime.now().isoformat()}",
            "",
            "=" * 80,
        ])
        
        return "\n".join(report_lines)
    
    def get_schema(self) -> Dict[str, Any]:
        """Return tool schema for MCP discovery"""
        return self.TOOL_SCHEMA
    
    def __repr__(self) -> str:
        return f"<ReportGeneratorTool executions={self.execution_count}>"
