from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import json

from ..database import get_db
from ..models import TransactionModel
from ..schemas import TransactionCreate, TransactionUpdate, TransactionResponse

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

def serialize_tx(model: TransactionModel) -> dict:
    tags_list = [t.strip() for t in model.tags.split(",") if t.strip()] if model.tags else []
    return {
        "id": model.id,
        "title": model.title,
        "amount": model.amount,
        "type": model.type,
        "category_id": model.category_id,
        "date": model.date,
        "payment_method": model.payment_method,
        "tags": tags_list,
        "notes": model.notes,
        "recurring": model.recurring,
        "created_at": model.created_at,
    }

@router.get("", response_model=List[TransactionResponse])
def get_transactions(
    type: Optional[str] = Query(None, description="Filter by 'income' or 'expense'"),
    category_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(TransactionModel)

    if type:
        query = query.filter(TransactionModel.type == type)
    if category_id:
        query = query.filter(TransactionModel.category_id == category_id)
    if start_date:
        query = query.filter(TransactionModel.date >= start_date)
    if end_date:
        query = query.filter(TransactionModel.date <= end_date)
    if search:
        query = query.filter(
            (TransactionModel.title.ilike(f"%{search}%")) |
            (TransactionModel.notes.ilike(f"%{search}%")) |
            (TransactionModel.tags.ilike(f"%{search}%"))
        )

    records = query.order_by(TransactionModel.date.desc()).all()
    return [serialize_tx(r) for r in records]

@router.post("", response_model=TransactionResponse)
def create_transaction(tx_in: TransactionCreate, db: Session = Depends(get_db)):
    tx_id = tx_in.id or f"tx_{uuid.uuid4().hex[:12]}"
    tags_str = ",".join(tx_in.tags) if tx_in.tags else ""

    model = TransactionModel(
        id=tx_id,
        title=tx_in.title,
        amount=abs(tx_in.amount),
        type=tx_in.type,
        category_id=tx_in.category_id,
        date=tx_in.date,
        payment_method=tx_in.payment_method or "Credit Card",
        tags=tags_str,
        notes=tx_in.notes or "",
        recurring=bool(tx_in.recurring),
    )

    db.add(model)
    db.commit()
    db.refresh(model)
    return serialize_tx(model)

@router.get("/{tx_id}", response_model=TransactionResponse)
def get_transaction(tx_id: str, db: Session = Depends(get_db)):
    model = db.query(TransactionModel).filter(TransactionModel.id == tx_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return serialize_tx(model)

@router.put("/{tx_id}", response_model=TransactionResponse)
def update_transaction(tx_id: str, tx_update: TransactionUpdate, db: Session = Depends(get_db)):
    model = db.query(TransactionModel).filter(TransactionModel.id == tx_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Transaction not found")

    update_data = tx_update.dict(exclude_unset=True)
    if "tags" in update_data and update_data["tags"] is not None:
        model.tags = ",".join(update_data["tags"])
        del update_data["tags"]
    if "amount" in update_data and update_data["amount"] is not None:
        model.amount = abs(update_data["amount"])
        del update_data["amount"]

    for k, v in update_data.items():
        setattr(model, k, v)

    db.commit()
    db.refresh(model)
    return serialize_tx(model)

@router.delete("/{tx_id}")
def delete_transaction(tx_id: str, db: Session = Depends(get_db)):
    model = db.query(TransactionModel).filter(TransactionModel.id == tx_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(model)
    db.commit()
    return {"message": "Transaction deleted successfully", "id": tx_id}

@router.post("/batch-delete")
def batch_delete_transactions(ids: List[str], db: Session = Depends(get_db)):
    deleted_count = db.query(TransactionModel).filter(TransactionModel.id.in_(ids)).delete(synchronize_session=False)
    db.commit()
    return {"message": f"Deleted {deleted_count} transactions", "count": deleted_count}
