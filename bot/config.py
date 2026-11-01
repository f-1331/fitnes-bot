import os
from zoneinfo import ZoneInfo
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")

BOT_TOKEN = os.getenv("BOT_TOKEN", "").strip()
TIMEZONE_NAME = os.getenv("TIMEZONE", "Asia/Tashkent")
DATABASE_PATH = BASE_DIR / os.getenv("DATABASE_PATH", "fitness_data.db")

try:
    LOCAL_TZ = ZoneInfo(TIMEZONE_NAME)
except Exception:
    LOCAL_TZ = ZoneInfo("Asia/Tashkent")

# Standart eslatma vaqtlari
DEFAULT_MORNING_TIME = "07:30"
DEFAULT_LUNCH_TIME = "13:00"
DEFAULT_EVENING_TIME = "19:00"
DEFAULT_WATER_GOAL_ML = 2000
