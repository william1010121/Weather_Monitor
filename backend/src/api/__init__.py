from .auth import router as auth_router
from .observations import router as observations_router
from .users import router as users_router

__all__ = ["auth_router", "observations_router", "users_router"]