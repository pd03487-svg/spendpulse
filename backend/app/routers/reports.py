from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from datetime import datetime
import json
import csv
import io

from ..database import get_db
from ..models import TransactionModel, CategoryModel
from ..schemas import BackupData

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/csv")
def export_csv_report(db: Session = Depends(get_db)):
    txs = db.query(TransactionModel).order_by(TransactionModel.date.desc()).all()
    categories = {c.id: c.name for c in db.query(CategoryModel).all()}

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Date", "Type", "Title", "Amount", "Category", "Payment Method", "Tags", "Notes", "Recurring"])

    for t in txs:
        cat_name = categories.get(t.category_id, "Uncategorized")
        writer.writerow([
            t.id,
            t.date,
            t.type.upper(),
            t.title,
            f"{t.amount:.2f}",
            cat_name,
            t.payment_method or "",
            t.tags or "",
            t.notes or "",
            "Yes" if t.recurring else "No"
        ])

    csv_content = output.getvalue()
    filename = f"SpendPulse_Export_{datetime.utcnow().strftime('%Y%m%d')}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/backup")
def export_json_backup(db: Session = Depends(get_db)):
    cats = db.query(CategoryModel).all()
    txs = db.query(TransactionModel).all()

    cats_list = [
        {"id": c.id, "name": c.name, "type": c.type, "icon": c.icon, "color": c.color, "budget": c.budget}
        for c in cats
    ]
    txs_list = [
        {
            "id": t.id,
            "title": t.title,
            "amount": t.amount,
            "type": t.type,
            "category_id": t.category_id,
            "date": t.date,
            "payment_method": t.payment_method,
            "tags": [tag.strip() for tag in t.tags.split(",") if tag.strip()] if t.tags else [],
            "notes": t.notes,
            "recurring": t.recurring,
        }
        for t in txs
    ]

    return {
        "version": "1.0.0",
        "exported_at": datetime.utcnow().isoformat(),
        "categories": cats_list,
        "transactions": txs_list,
    }
