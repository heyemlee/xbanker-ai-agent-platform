from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Case(Base):
    """Case model for compliance investigations and SAR tracking"""
    
    __tablename__ = "cases"
    
    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("risk_alerts.id"), nullable=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True, index=True)
    
    # Case details
    case_type = Column(String(50), nullable=False)  # AML, Sanctions, Fraud, etc.
    status = Column(String(20), nullable=False, default="Open", index=True)  # Open, Under Investigation, Closed
    priority = Column(String(20), nullable=False, default="Medium")  # Low, Medium, High, Critical
    assigned_to = Column(String(255), nullable=True)  # User/analyst name
    
    # Investigation
    investigation_notes = Column(Text, nullable=True)
    conclusion = Column(Text, nullable=True)
    
    # SAR (Suspicious Activity Report) tracking
    sar_status = Column(String(50), nullable=True)  # Not Required, Pending, Filed, Rejected
    sar_filed_date = Column(Date, nullable=True)
    sar_reference = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)
    
    # Relationships
    alert = relationship("RiskAlert", back_populates="cases")
    client = relationship("Client", back_populates="cases")
    
    def __repr__(self):
        return f"<Case(id={self.id}, type={self.case_type}, status={self.status}, client_id={self.client_id})>"
