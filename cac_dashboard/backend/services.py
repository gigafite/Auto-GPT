"""Business logic for CAC calculations and data processing."""
from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Expense, Deal, CACMetric


class CACService:
    """Service for CAC calculations and analytics."""

    @staticmethod
    def calculate_cac(total_expenses: float, total_deals: int) -> Optional[float]:
        """
        Calculate Customer Acquisition Cost.

        Args:
            total_expenses: Total expenses in the period
            total_deals: Total deals/customers acquired in the period

        Returns:
            CAC value or None if no deals
        """
        if total_deals == 0:
            return None
        return round(total_expenses / total_deals, 2)

    @staticmethod
    def get_period_bounds(period_type: str, reference_date: datetime = None) -> Tuple[datetime, datetime]:
        """
        Get start and end dates for a given period type.

        Args:
            period_type: Type of period (weekly, monthly, quarterly, yearly)
            reference_date: Reference date (defaults to now)

        Returns:
            Tuple of (start_date, end_date)
        """
        if reference_date is None:
            reference_date = datetime.utcnow()

        if period_type == "weekly":
            # Start from Monday of current week
            start = reference_date - timedelta(days=reference_date.weekday())
            start = start.replace(hour=0, minute=0, second=0, microsecond=0)
            end = start + timedelta(days=7)
        elif period_type == "monthly":
            # Start from first day of current month
            start = reference_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            # End is first day of next month
            if start.month == 12:
                end = start.replace(year=start.year + 1, month=1)
            else:
                end = start.replace(month=start.month + 1)
        elif period_type == "quarterly":
            # Determine which quarter
            quarter = (reference_date.month - 1) // 3
            start_month = quarter * 3 + 1
            start = reference_date.replace(month=start_month, day=1, hour=0, minute=0, second=0, microsecond=0)
            # End is start of next quarter
            end_month = start_month + 3
            if end_month > 12:
                end = start.replace(year=start.year + 1, month=end_month - 12)
            else:
                end = start.replace(month=end_month)
        elif period_type == "yearly":
            # Start from first day of current year
            start = reference_date.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            end = start.replace(year=start.year + 1)
        else:
            raise ValueError(f"Invalid period type: {period_type}")

        return start, end

    @staticmethod
    def get_expenses_for_period(
        db: Session,
        start_date: datetime,
        end_date: datetime
    ) -> List[Expense]:
        """Get all expenses for a given period."""
        return db.query(Expense).filter(
            Expense.date >= start_date,
            Expense.date < end_date
        ).all()

    @staticmethod
    def get_deals_for_period(
        db: Session,
        start_date: datetime,
        end_date: datetime
    ) -> List[Deal]:
        """Get all deals for a given period."""
        return db.query(Deal).filter(
            Deal.date >= start_date,
            Deal.date < end_date
        ).all()

    @staticmethod
    def calculate_period_metrics(
        db: Session,
        period_type: str,
        reference_date: datetime = None
    ) -> dict:
        """
        Calculate metrics for a specific period.

        Returns:
            Dictionary with total_expenses, total_deals, and cac
        """
        start_date, end_date = CACService.get_period_bounds(period_type, reference_date)

        # Get expenses
        expenses = CACService.get_expenses_for_period(db, start_date, end_date)
        total_expenses = sum(exp.amount for exp in expenses)

        # Get deals
        deals = CACService.get_deals_for_period(db, start_date, end_date)
        total_deals = sum(deal.count for deal in deals)

        # Calculate CAC
        cac = CACService.calculate_cac(total_expenses, total_deals)

        return {
            "period_start": start_date,
            "period_end": end_date,
            "total_expenses": total_expenses,
            "total_deals": total_deals,
            "cac": cac,
            "period_type": period_type
        }

    @staticmethod
    def save_cac_metric(db: Session, metrics: dict) -> CACMetric:
        """Save calculated CAC metric to database."""
        cac_metric = CACMetric(**metrics)
        db.add(cac_metric)
        db.commit()
        db.refresh(cac_metric)
        return cac_metric

    @staticmethod
    def get_historical_metrics(
        db: Session,
        period_type: str,
        num_periods: int = 12
    ) -> List[CACMetric]:
        """
        Get historical CAC metrics for trending.

        Args:
            db: Database session
            period_type: Type of period (weekly, monthly, quarterly, yearly)
            num_periods: Number of periods to retrieve

        Returns:
            List of CACMetric objects
        """
        return db.query(CACMetric).filter(
            CACMetric.period_type == period_type
        ).order_by(
            CACMetric.period_start.desc()
        ).limit(num_periods).all()

    @staticmethod
    def get_expense_breakdown(
        db: Session,
        start_date: datetime,
        end_date: datetime
    ) -> dict:
        """Get expense breakdown by category for a period."""
        breakdown = db.query(
            Expense.category,
            func.sum(Expense.amount).label('total')
        ).filter(
            Expense.date >= start_date,
            Expense.date < end_date
        ).group_by(Expense.category).all()

        return {cat: float(total) for cat, total in breakdown}

    @staticmethod
    def calculate_cac_change_percentage(current_cac: Optional[float], previous_cac: Optional[float]) -> Optional[float]:
        """Calculate percentage change in CAC."""
        if current_cac is None or previous_cac is None or previous_cac == 0:
            return None

        change = ((current_cac - previous_cac) / previous_cac) * 100
        return round(change, 2)
