from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from ..database import get_db
from ..models import CategoryModel
from ..schemas import CategoryCreate, CategoryResponse

router = APIRouter(prefix="/api/categories", tags=["Categories"])

DEFAULT_INITIAL_CATEGORIES = [
    {"id": "cat_salary", "name": "Salary", "type": "income", "icon": "Briefcase", "color": "#10b981", "budget": 0.0},
    {"id": "cat_freelance", "name": "Freelance & Consulting", "type": "income", "icon": "Laptop", "color": "#06b6d4", "budget": 0.0},
    {"id": "cat_investments", "name": "Investments & Dividends", "type": "income", "icon": "TrendingUp", "color": "#8b5cf6", "budget": 0.0},
    {"id": "cat_housing", "name": "Housing & Rent", "type": "expense", "icon": "Home", "color": "#f43f5e", "budget": 1500.0},
    {"id": "cat_groceries", "name": "Groceries & Food", "type": "expense", "icon": "ShoppingCart", "color": "#f97316", "budget": 500.0},
    {"id": "cat_dining", "name": "Dining Out", "type": "expense", "icon": "Utensils", "color": "#fb923c", "budget": 300.0},
    {"id": "cat_transport", "name": "Transportation", "type": "expense", "icon": "Car", "color": "#eab308", "budget": 200.0},
    {"id": "cat_utilities", "name": "Utilities & Bills", "type": "expense", "icon": "Zap", "color": "#84cc16", "budget": 180.0},
    {"id": "cat_entertainment", "name": "Entertainment", "type": "expense", "icon": "Film", "color": "#a855f7", "budget": 150.0},
    {"id": "cat_health", "name": "Healthcare & Fitness", "type": "expense", "icon": "HeartPulse", "color": "#06b6d4", "budget": 120.0},
    {"id": "cat_shopping", "name": "Shopping", "type": "expense", "icon": "ShoppingBag", "color": "#ec4899", "budget": 250.0},
    {"id": "cat_subscriptions", "name": "Subscriptions", "type": "expense", "icon": "Repeat", "color": "#d946ef", "budget": 75.0},
]

def seed_default_categories_if_empty(db: Session):
    if db.query(CategoryModel).count() == 0:
        for c in DEFAULT_INITIAL_CATEGORIES:
            db.add(CategoryModel(**c))
        db.commit()

@router.get("", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    seed_default_categories_if_empty(db)
    return db.query(CategoryModel).all()

@router.post("", response_model=CategoryResponse)
def create_category(cat_in: CategoryCreate, db: Session = Depends(get_db)):
    cat_id = cat_in.id or f"cat_{uuid.uuid4().hex[:8]}"
    model = CategoryModel(
        id=cat_id,
        name=cat_in.name,
        type=cat_in.type,
        icon=cat_in.icon or "Tag",
        color=cat_in.color or "#6366f1",
        budget=float(cat_in.budget or 0.0),
    )
    db.add(model)
    db.commit()
    db.refresh(model)
    return model

@router.put("/{cat_id}", response_model=CategoryResponse)
def update_category(cat_id: str, cat_in: CategoryCreate, db: Session = Depends(get_db)):
    model = db.query(CategoryModel).filter(CategoryModel.id == cat_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Category not found")

    model.name = cat_in.name
    model.type = cat_in.type
    if cat_in.icon:
        model.icon = cat_in.icon
    if cat_in.color:
        model.color = cat_in.color
    if cat_in.budget is not None:
        model.budget = float(cat_in.budget)

    db.commit()
    db.refresh(model)
    return model

@router.delete("/{cat_id}")
def delete_category(cat_id: str, db: Session = Depends(get_db)):
    model = db.query(CategoryModel).filter(CategoryModel.id == cat_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(model)
    db.commit()
    return {"message": "Category deleted", "id": cat_id}
