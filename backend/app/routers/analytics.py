from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from collections import defaultdict
from datetime import datetime

from ..database import get_db
from ..models import TransactionModel, CategoryModel
from ..schemas import MetricsSummary, MonthlyStatItem

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/summary", response_model=MetricsSummary)
def get_analytics_summary(db: Session = Depends(get_db)):
    txs = db.query(TransactionModel).all()
    total_income = sum(t.amount for t in txs if t.type == "income")
    total_expense = sum(t.amount for t in txs if t.type == "expense")
    net_balance = total_income - total_expense
    savings_rate = ((net_balance / total_income) * 100) if total_income > 0 else 0.0

    return MetricsSummary(
        total_income=total_income,
        total_expense=total_expense,
        net_balance=net_balance,
        savings_rate=max(0.0, savings_rate),
        transaction_count=len(txs)
    )

@router.get("/monthly")
def get_monthly_analytics(db: Session = Depends(get_db)):
    txs = db.query(TransactionModel).all()
    month_data = defaultdict(lambda: {"income": 0.0, "expense": 0.0, "count": 0})

    for t in txs:
        m_key = t.date[:7] # YYYY-MM
        if t.type == "income":
            month_data[m_key]["income"] += t.amount
        else:
            month_data[m_key]["expense"] += t.amount
        month_data[m_key]["count"] += 1

    sorted_keys = sorted(month_data.keys())
    results = []
    for k in sorted_keys:
        item = month_data[k]
        try:
            dt = datetime.strptime(k + "-01", "%Y-%m-%d")
            label = dt.strftime("%B %Y")
            short_label = dt.strftime("%b %y")
        except:
            label = k
            short_label = k

        savings = item["income"] - item["expense"]
        results.append({
            "month_key": k,
            "label": label,
            "short_label": short_label,
            "income": round(item["income"], 2),
            "expense": round(item["expense"], 2),
            "savings": round(savings, 2),
            "savings_rate": round((savings / item["income"] * 100), 1) if item["income"] > 0 else 0.0,
            "count": item["count"],
        })

    return results
