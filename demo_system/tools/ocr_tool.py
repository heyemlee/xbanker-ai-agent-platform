"""
OCR Demo Tool - Simulates OCR text extraction from documents

For interview demo purposes - returns mock OCR text.
In production, would integrate with AWS Textract, Google Vision, or similar.
"""

import json
import time
from typing import Dict, Any
from datetime import datetime


class OCRTool:
    """
    MCP Tool: OCR Document Scanner
    
    Simulates extracting text from document images/PDFs.
    """
    
    # Tool metadata for MCP discovery
    TOOL_NAME = "ocr_document_scanner"
    TOOL_DESCRIPTION = "Extracts text from document images or PDFs using OCR technology"
    
    TOOL_SCHEMA = {
        "name": TOOL_NAME,
        "description": TOOL_DESCRIPTION,
        "input_schema": {
            "type": "object",
            "properties": {
                "document_path": {
                    "type": "string",
                    "description": "Path to the document file (image or PDF)"
                },
                "language": {
                    "type": "string",
                    "description": "Document language (default: 'en')",
                    "default": "en"
                }
            },
            "required": ["document_path"]
        }
    }
    
    # Mock OCR results for different document types
    MOCK_OCR_RESULTS = {
        "passport": """
PASSPORT
Surname: ANDERSON
Given Names: JAMES ROBERT
Nationality: UNITED KINGDOM
Date of Birth: 15 MAR 1985
Place of Birth: LONDON, UK
Passport No: 512789456
Date of Issue: 01 JAN 2020
Date of Expiry: 01 JAN 2030
Authority: UK PASSPORT SERVICE
        """.strip(),
        
        "bank_statement": """
PRIVATE BANKING STATEMENT
Account Holder: James R. Anderson
Account Number: ****7890
Statement Period: October 2024

SUMMARY:
Opening Balance: £2,450,000.00
Total Credits: £850,000.00
Total Debits: £320,000.00
Closing Balance: £2,980,000.00

TRANSACTIONS:
01 Oct - Wire Transfer (Credit) - £500,000.00 - Tech Startup Investment Exit
05 Oct - Wire Transfer (Debit) - £120,000.00 - Property Purchase Deposit
12 Oct - Dividend (Credit) - £350,000.00 - Portfolio Holdings
20 Oct - Wire Transfer (Debit) - £200,000.00 - Charity Foundation Donation
        """.strip(),
        
        "kyc_form": """
KNOW YOUR CLIENT (KYC) FORM

Client Information:
Full Name: James Robert Anderson
Date of Birth: 15 March 1985
Nationality: British
Residency: Monaco
Tax ID: UK-NI-AB123456C

Source of Wealth:
- Technology company sale (2020): £15M
- Investment portfolio returns: £5M annually
- Angel investments: 12 startups

Business Activities:
- Private equity investor
- Technology sector advisor
- Board member: 3 tech startups

Expected Transaction Volume:
- £1M - £5M per month
- Purpose: Investments, wealth management

Risk Factors:
- Multiple jurisdictions (UK, Monaco, Switzerland)
- High-value transactions
- Tech sector focus (medium volatility)
        """.strip(),
        
        "default": """
[OCR Extracted Text]

This is a simulated OCR extraction result for demo purposes.
In production, this would contain actual text extracted from your document
using services like AWS Textract, Google Cloud Vision, or Azure Computer Vision.

Document appears to contain:
- Personal identification information
- Financial transaction records
- Business registration details
- Compliance documentation

For interview demonstration only - mock data.
        """.strip()
    }
    
    def __init__(self):
        """Initialize OCR tool"""
        self.execution_count = 0
    
    def execute(self, document_path: str, language: str = "en") -> Dict[str, Any]:
        """
        Execute OCR extraction (mock version)
        
        Args:
            document_path: Path to document
            language: Document language
            
        Returns:
            Dict with extracted text and metadata
        """
        start_time = time.time()
        self.execution_count += 1
        
        # Simulate OCR processing delay
        time.sleep(0.5)  # Simulates processing time
        
        # Determine mock result based on document name
        extracted_text = self._get_mock_text(document_path)
        
        # Simulate confidence scores
        confidence_score = 0.95  # High confidence for clean documents
        
        execution_time = time.time() - start_time
        
        return {
            "tool": self.TOOL_NAME,
            "status": "success",
            "document_path": document_path,
            "language": language,
            "extracted_text": extracted_text,
            "metadata": {
                "page_count": 1,
                "confidence_score": confidence_score,
                "processing_time_seconds": round(execution_time, 2),
                "timestamp": datetime.now().isoformat(),
                "execution_number": self.execution_count
            },
            "mock_data": True,
            "production_note": "In production, would integrate with AWS Textract or similar OCR service"
        }
    
    def _get_mock_text(self, document_path: str) -> str:
        """
        Get appropriate mock text based on document path
        """
        path_lower = document_path.lower()
        
        if "passport" in path_lower:
            return self.MOCK_OCR_RESULTS["passport"]
        elif "bank" in path_lower or "statement" in path_lower:
            return self.MOCK_OCR_RESULTS["bank_statement"]
        elif "kyc" in path_lower or "form" in path_lower:
            return self.MOCK_OCR_RESULTS["kyc_form"]
        else:
            return self.MOCK_OCR_RESULTS["default"]
    
    def get_schema(self) -> Dict[str, Any]:
        """Return tool schema for MCP discovery"""
        return self.TOOL_SCHEMA
    
    def __repr__(self) -> str:
        return f"<OCRTool executions={self.execution_count}>"
