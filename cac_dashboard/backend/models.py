"""Database models for CAC Dashboard."""
from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, Enum
import enum
from database import Base


class ExpenseCategory(str, enum.Enum):
    """Expense category types."""
    SOFTWARE = "software"
    SALARY = "salary"
    COMMISSION = "commission"
    ADVERTISING = "advertising"
    AGENCY = "agency"
    OTHER = "other"


class Expense(Base):
    """Model for tracking marketing and sales expenses."""
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Deal(Base):
    """Model for tracking deals/customers acquired."""
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    count = Column(Integer, nullable=False)
    source = Column(String, nullable=True)
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CACMetric(Base):
    """Model for storing calculated CAC metrics."""
    __tablename__ = "cac_metrics"

    id = Column(Integer, primary_key=True, index=True)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    total_expenses = Column(Float, nullable=False)
    total_deals = Column(Integer, nullable=False)
    cac = Column(Float, nullable=False)
    period_type = Column(String, nullable=False)  # weekly, monthly, quarterly, yearly
    created_at = Column(DateTime, default=datetime.utcnow)
