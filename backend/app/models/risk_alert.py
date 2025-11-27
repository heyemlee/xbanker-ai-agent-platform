from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class RiskAlert(Base):
    """Risk Alert model for storing surveillance findings"""
    
    __tablename__ = "risk_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True, index=True)
    
    # Alert details
    severity = Column(String(20), nullable=False, index=True)  # Low, Medium, High, Critical
    risk_tags = Column(JSON, nullable=True)  # Array of risk categories
    summary = Column(Text, nullable=False)
    next_steps = Column(Text, nullable=True)
    
    # Original input data
    raw_activity_log = Column(Text, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    client = relationship("Client", back_populates="risk_alerts")
    
    def __repr__(self):
        return f"<RiskAlert(id={self.id}, severity={self.severity}, client_id={self.client_id})>"
