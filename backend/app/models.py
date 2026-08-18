from sqlalchemy import Column, String, Float, Boolean, Text, DateTime
from datetime import datetime
from .database import Base

class CategoryModel(Base):
    __tablename__ = "categories"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False) # 'income' or 'expense'
    icon = Column(String(50), default="Tag")
    color = Column(String(20), default="#6366f1")
    budget = Column(Float, default=0.0)

class TransactionModel(Base):
    __tablename__ = "transactions"

    id = Column(String(100), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String(20), nullable=False) # 'income' or 'expense'
    category_id = Column(String(50), nullable=False, index=True)
    date = Column(String(20), nullable=False, index=True) # YYYY-MM-DD
    payment_method = Column(String(50), default="Credit Card")
    tags = Column(Text, default="") # Comma-separated
    notes = Column(Text, default="")
    recurring = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserSettingsModel(Base):
    __tablename__ = "user_settings"

    key = Column(String(50), primary_key=True)
    value = Column(Text, nullable=False)
