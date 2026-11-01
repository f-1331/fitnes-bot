"""
Avtomatik Eslatmalar Xizmati (Cron Scheduler)
Har kuni ertalab soat 05:00 da va kechqurun soat 21:00 da
foydalanuvchilarga o'lchanish eslatmasini yuboradi.
"""

import asyncio
import logging
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("Scheduler")

PROJECT_DIR = Path(__file__).resolve().parent / "fitnesuzb_bot"
LOCAL_TZ = ZoneInfo("Asia/Tashkent")


def trigger_reminder(reminder_type: str):
    """TGCloud orqali eslatmani yuborish"""
    npx_bin = "npx.cmd" if sys.platform == "win32" else "npx"
    cmd = f'{npx_bin} tgcloud run endpoints/sendDailyReminders "{{\\"type\\":\\"{reminder_type}\\"}}"'
    logger.info(f"Eslatma yuborilmoqda: {reminder_type}")
    try:
        res = subprocess.run(
            cmd,
            shell=True,
            cwd=str(PROJECT_DIR),
            capture_output=True,
            text=True
        )
        logger.info(f"Natija: {res.stdout.strip()}")
        if res.stderr:
            logger.warning(f"Chiqish: {res.stderr.strip()}")
    except Exception as e:
        logger.error(f"Xatolik: {e}")


async def main():
    logger.info("05:00 va 21:00 Eslatmalar xizmati ishga tushirildi (Asia/Tashkent)...")

    # Qaysi sanalarda yuborilganini eslab qolish
    sent_morning_date = None
    sent_evening_date = None

    while True:
        now = datetime.now(LOCAL_TZ)
        today_str = now.strftime("%Y-%m-%d")
        current_time = now.strftime("%H:%M")

        # 05:00 Ertalabki eslatma
        if current_time == "05:00" and sent_morning_date != today_str:
            trigger_reminder("morning")
            sent_morning_date = today_str

        # 21:00 Kechqurungi eslatma
        if current_time == "21:00" and sent_evening_date != today_str:
            trigger_reminder("evening")
            sent_evening_date = today_str

        await asyncio.sleep(25)  # Har 25 sekundda tekshiradi


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test-morning":
        trigger_reminder("morning")
    elif len(sys.argv) > 1 and sys.argv[1] == "--test-evening":
        trigger_reminder("evening")
    else:
        asyncio.run(main())
