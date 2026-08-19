from app.routers.tasks import router as tasks_router
from app.routers.templates import router as templates_router
from app.routers.settings import router as settings_router

__all__ = ["tasks_router", "templates_router", "settings_router"]
