"""Pydantic schemas for API request/response validation."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ExpenseBase(BaseModel):
    """Base expense schema."""
    category: str = Field(..., description="Expense category (software, salary, commission, advertising, agency, other)")
    amount: float = Field(..., gt=0, description="Expense amount (must be positive)")
    description: Optional[str] = Field(None, description="Description of the expense")
    date: datetime = Field(..., description="Date of the expense")


class ExpenseCreate(ExpenseBase):
    """Schema for creating an expense."""
    pass


class ExpenseUpdate(BaseModel):
    """Schema for updating an expense."""
    category: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    date: Optional[datetime] = None


class ExpenseResponse(ExpenseBase):
    """Schema for expense response."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DealBase(BaseModel):
    """Base deal schema."""
    count: int = Field(..., gt=0, description="Number of deals/customers acquired")
    source: Optional[str] = Field(None, description="Source of the deals")
    date: datetime = Field(..., description="Date of the deals")


class DealCreate(DealBase):
    """Schema for creating a deal."""
    pass


class DealUpdate(BaseModel):
    """Schema for updating a deal."""
    count: Optional[int] = Field(None, gt=0)
    source: Optional[str] = None
    date: Optional[datetime] = None


class DealResponse(DealBase):
    """Schema for deal response."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CACMetricResponse(BaseModel):
    """Schema for CAC metric response."""
    id: int
    period_start: datetime
    period_end: datetime
    total_expenses: float
    total_deals: int
    cac: float
    period_type: str
    created_at: datetime

    class Config:
        from_attributes = True


class CACDashboardSummary(BaseModel):
    """Schema for dashboard summary."""
    current_period_cac: Optional[float] = None
    total_expenses_current_period: float
    total_deals_current_period: int
    previous_period_cac: Optional[float] = None
    cac_change_percentage: Optional[float] = None
    period_type: str


class DateRangeQuery(BaseModel):
    """Schema for date range queries."""
    start_date: datetime
    end_date: datetime
