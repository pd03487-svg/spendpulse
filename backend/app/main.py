import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import tasks_router, templates_router, settings_router
from app.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="BrowserMind: Autonomous AI Browser Agent for Intelligent Web Navigation, Research & Task Execution"
)

# CORS middleware for seamless frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(tasks_router)
app.include_router(templates_router)
app.include_router(settings_router)


@app.get("/")
async def root():
    return {
        "app": "BrowserMind",
        "version": settings.app_version,
        "status": "online",
        "docs": "/docs",
        "description": "Autonomous AI Browser Agent for Web Navigation, Multi-Source Research & Verification"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
