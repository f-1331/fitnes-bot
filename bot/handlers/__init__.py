from aiogram import Router
from .start import router as start_router
from .workouts import router as workouts_router
from .water import router as water_router
from .weight import router as weight_router
from .diet import router as diet_router
from .settings import router as settings_router


def register_all_handlers() -> Router:
    main_router = Router()
    main_router.include_router(start_router)
    main_router.include_router(workouts_router)
    main_router.include_router(water_router)
    main_router.include_router(weight_router)
    main_router.include_router(diet_router)
    main_router.include_router(settings_router)
    return main_router
