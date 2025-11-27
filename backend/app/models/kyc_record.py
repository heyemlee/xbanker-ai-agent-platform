from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class KYCRecord(Base):
    """KYC Record model for tracking historical KYC versions and reviews"""
    
    __tablename__ = "kyc_records"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False, index=True)
    
    # Version tracking
    version = Column(Integer, nullable=False, default=1)
    
    # Risk assessment
    risk_score = Column(String(20), nullable=True)  # Low, Medium, High
    risk_rationale = Column(Text, nullable=True)
    kyc_summary = Column(Text, nullable=True)
    
    # Compliance flags
    pep_flag = Column(Boolean, default=False)
    sanctions_flag = Column(Boolean, default=False)
    
    # CDD/EDD conclusions
    cdd_conclusion = Column(String(50), nullable=True)  # Standard CDD, Enhanced CDD
    edd_required = Column(Boolean, default=False)
    
    # Review scheduling
    review_date = Column(Date, nullable=True)  # Date of this review
    next_review_date = Column(Date, nullable=True)  # When next review is due
    
    # Original input data
    raw_kyc_notes = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    created_by = Column(String(255), nullable=True)  # User who created this record
    
    # Relationships
    client = relationship("Client", back_populates="kyc_records")
    
    def __repr__(self):
        return f"<KYCRecord(id={self.id}, client_id={self.client_id}, version={self.version}, risk={self.risk_score})>"
