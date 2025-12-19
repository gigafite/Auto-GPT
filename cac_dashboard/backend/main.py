"""FastAPI application for CAC Dashboard."""
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import Expense, Deal, CACMetric
from schemas import (
    ExpenseCreate, ExpenseUpdate, ExpenseResponse,
    DealCreate, DealUpdate, DealResponse,
    CACMetricResponse, CACDashboardSummary
)
from services import CACService

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="CAC Dashboard API",
    description="API for tracking Customer Acquisition Cost metrics",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.utcnow()}


# Expense endpoints
@app.post("/api/expenses", response_model=ExpenseResponse, status_code=201)
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    """Create a new expense entry."""
    db_expense = Expense(**expense.dict())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


@app.get("/api/expenses", response_model=List[ExpenseResponse])
def get_expenses(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Get all expenses with optional filters."""
    query = db.query(Expense)

    if category:
        query = query.filter(Expense.category == category)
    if start_date:
        query = query.filter(Expense.date >= start_date)
    if end_date:
        query = query.filter(Expense.date < end_date)

    expenses = query.offset(skip).limit(limit).all()
    return expenses


@app.get("/api/expenses/{expense_id}", response_model=ExpenseResponse)
def get_expense(expense_id: int, db: Session = Depends(get_db)):
    """Get a specific expense by ID."""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@app.put("/api/expenses/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_update: ExpenseUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing expense."""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    update_data = expense_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(expense, key, value)

    expense.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(expense)
    return expense


@app.delete("/api/expenses/{expense_id}", status_code=204)
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    """Delete an expense."""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(expense)
    db.commit()
    return None


# Deal endpoints
@app.post("/api/deals", response_model=DealResponse, status_code=201)
def create_deal(deal: DealCreate, db: Session = Depends(get_db)):
    """Create a new deal entry."""
    db_deal = Deal(**deal.dict())
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return db_deal


@app.get("/api/deals", response_model=List[DealResponse])
def get_deals(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Get all deals with optional filters."""
    query = db.query(Deal)

    if start_date:
        query = query.filter(Deal.date >= start_date)
    if end_date:
        query = query.filter(Deal.date < end_date)

    deals = query.offset(skip).limit(limit).all()
    return deals


@app.get("/api/deals/{deal_id}", response_model=DealResponse)
def get_deal(deal_id: int, db: Session = Depends(get_db)):
    """Get a specific deal by ID."""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal


@app.put("/api/deals/{deal_id}", response_model=DealResponse)
def update_deal(
    deal_id: int,
    deal_update: DealUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing deal."""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    update_data = deal_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(deal, key, value)

    deal.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(deal)
    return deal


@app.delete("/api/deals/{deal_id}", status_code=204)
def delete_deal(deal_id: int, db: Session = Depends(get_db)):
    """Delete a deal."""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    db.delete(deal)
    db.commit()
    return None


# Analytics endpoints
@app.get("/api/analytics/cac/current")
def get_current_cac(
    period_type: str = Query("monthly", regex="^(weekly|monthly|quarterly|yearly)$"),
    db: Session = Depends(get_db)
):
    """Get current period CAC metrics."""
    metrics = CACService.calculate_period_metrics(db, period_type)
    return metrics


@app.get("/api/analytics/cac/dashboard")
def get_dashboard_summary(
    period_type: str = Query("monthly", regex="^(weekly|monthly|quarterly|yearly)$"),
    db: Session = Depends(get_db)
):
    """Get dashboard summary with current and previous period comparison."""
    # Current period
    current_metrics = CACService.calculate_period_metrics(db, period_type)

    # Previous period
    if period_type == "weekly":
        from datetime import timedelta
        prev_ref_date = current_metrics["period_start"] - timedelta(days=7)
    elif period_type == "monthly":
        prev_ref_date = current_metrics["period_start"] - timedelta(days=30)
    elif period_type == "quarterly":
        prev_ref_date = current_metrics["period_start"] - timedelta(days=90)
    else:  # yearly
        prev_ref_date = current_metrics["period_start"] - timedelta(days=365)

    previous_metrics = CACService.calculate_period_metrics(db, period_type, prev_ref_date)

    # Calculate change
    cac_change = CACService.calculate_cac_change_percentage(
        current_metrics["cac"],
        previous_metrics["cac"]
    )

    return {
        "current_period_cac": current_metrics["cac"],
        "total_expenses_current_period": current_metrics["total_expenses"],
        "total_deals_current_period": current_metrics["total_deals"],
        "previous_period_cac": previous_metrics["cac"],
        "cac_change_percentage": cac_change,
        "period_type": period_type,
        "period_start": current_metrics["period_start"],
        "period_end": current_metrics["period_end"]
    }


@app.get("/api/analytics/cac/history", response_model=List[CACMetricResponse])
def get_cac_history(
    period_type: str = Query("monthly", regex="^(weekly|monthly|quarterly|yearly)$"),
    num_periods: int = Query(12, ge=1, le=52),
    db: Session = Depends(get_db)
):
    """Get historical CAC metrics."""
    metrics = CACService.get_historical_metrics(db, period_type, num_periods)
    return metrics


@app.post("/api/analytics/cac/calculate", response_model=CACMetricResponse)
def calculate_and_save_cac(
    period_type: str = Query("monthly", regex="^(weekly|monthly|quarterly|yearly)$"),
    reference_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Calculate CAC for a period and save it."""
    metrics = CACService.calculate_period_metrics(db, period_type, reference_date)
    saved_metric = CACService.save_cac_metric(db, metrics)
    return saved_metric


@app.get("/api/analytics/expenses/breakdown")
def get_expense_breakdown(
    period_type: str = Query("monthly", regex="^(weekly|monthly|quarterly|yearly)$"),
    db: Session = Depends(get_db)
):
    """Get expense breakdown by category for current period."""
    start_date, end_date = CACService.get_period_bounds(period_type)
    breakdown = CACService.get_expense_breakdown(db, start_date, end_date)
    return {
        "period_start": start_date,
        "period_end": end_date,
        "breakdown": breakdown
    }


@app.get("/api/analytics/trends")
def get_trends(
    period_type: str = Query("monthly", regex="^(weekly|monthly|quarterly|yearly)$"),
    num_periods: int = Query(12, ge=1, le=52),
    db: Session = Depends(get_db)
):
    """Get trend data for CAC, expenses, and deals over time."""
    trends = []

    for i in range(num_periods):
        # Calculate reference date for each period
        if period_type == "weekly":
            from datetime import timedelta
            ref_date = datetime.utcnow() - timedelta(weeks=i)
        elif period_type == "monthly":
            from datetime import timedelta
            ref_date = datetime.utcnow() - timedelta(days=30 * i)
        elif period_type == "quarterly":
            from datetime import timedelta
            ref_date = datetime.utcnow() - timedelta(days=90 * i)
        else:  # yearly
            from datetime import timedelta
            ref_date = datetime.utcnow() - timedelta(days=365 * i)

        metrics = CACService.calculate_period_metrics(db, period_type, ref_date)
        trends.append(metrics)

    # Reverse to show oldest to newest
    trends.reverse()
    return trends


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
