from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    type: str # 'income' or 'expense'
    icon: Optional[str] = "Tag"
    color: Optional[str] = "#6366f1"
    budget: Optional[float] = 0.0

class CategoryCreate(CategoryBase):
    id: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: str

    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    title: str
    amount: float
    type: str # 'income' or 'expense'
    category_id: str
    date: str # YYYY-MM-DD
    payment_method: Optional[str] = "Credit Card"
    tags: Optional[List[str]] = []
    notes: Optional[str] = ""
    recurring: Optional[bool] = False

class TransactionCreate(TransactionBase):
    id: Optional[str] = None

class TransactionUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    category_id: Optional[str] = None
    date: Optional[str] = None
    payment_method: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    recurring: Optional[bool] = None

class TransactionResponse(BaseModel):
    id: str
    title: str
    amount: float
    type: str
    category_id: str
    date: str
    payment_method: Optional[str]
    tags: List[str]
    notes: Optional[str]
    recurring: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

class MetricsSummary(BaseModel):
    total_income: float
    total_expense: float
    net_balance: float
    savings_rate: float
    transaction_count: int

class MonthlyStatItem(BaseModel):
    month_key: str
    label: str
    short_label: str
    income: float
    expense: float
    savings: float
    count: int

class BackupData(BaseModel):
    version: str = "1.0.0"
    exported_at: str
    categories: List[CategoryResponse]
    transactions: List[TransactionResponse]
