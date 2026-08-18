from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import transactions, categories, analytics, reports

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SpendPulse API",
    description="REST API service for SpendPulse Smart Expense & Income Tracker",
    version="1.0.0",
)

# Enable CORS for local dev and frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(transactions.router)
app.include_router(categories.router)
app.include_router(analytics.router)
app.include_router(reports.router)

@app.get("/")
def root():
    return {
        "app": "SpendPulse API",
        "version": "1.0.0",
        "status": "healthy",
        "docs": "/docs",
    }
