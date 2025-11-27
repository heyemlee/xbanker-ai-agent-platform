from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Client(Base):
    """Client model for storing KYC information and risk assessments"""
    
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False, index=True)
    date_of_birth = Column(Date, nullable=True)
    nationality = Column(String(100), nullable=True)
    residency_country = Column(String(100), nullable=True)
    source_of_wealth = Column(Text, nullable=True)
    business_activity = Column(Text, nullable=True)
    
    # Risk flags
    pep_flag = Column(Boolean, default=False)
    sanctions_flag = Column(Boolean, default=False)
    
    # Risk assessment (populated by AI) - Current/Latest
    risk_score = Column(String(20), nullable=True)  # Low, Medium, High
    risk_rationale = Column(Text, nullable=True)
    kyc_summary = Column(Text, nullable=True)
    
    # Original input data
    raw_kyc_notes = Column(Text, nullable=True)
    
    # Client lifecycle management (NEW)
    status = Column(String(20), nullable=False, default="Active")  # Active, Onboarding, Under Review
    next_review_date = Column(Date, nullable=True)  # When next KYC review is due
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    risk_alerts = relationship("RiskAlert", back_populates="client", cascade="all, delete-orphan")
    kyc_records = relationship("KYCRecord", back_populates="client", cascade="all, delete-orphan")
    cases = relationship("Case", back_populates="client", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Client(id={self.id}, name={self.full_name}, risk={self.risk_score}, status={self.status})>"
