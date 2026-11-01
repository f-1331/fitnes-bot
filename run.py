import asyncio
import logging
import sys
from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties

from bot.config import BOT_TOKEN
from bot.database.db import db
from bot.handlers import register_all_handlers
from bot.services.scheduler import setup_scheduler

# Logging sozlamalari
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("QomatBot")


async def main():
    if not BOT_TOKEN or BOT_TOKEN == "YOUR_BOT_TOKEN_HERE":
        logger.error(
            "\n" + "=" * 60 + "\n"
            "❌ DIQQAT: BOT TOKENI TOPILMADI YOKI O'ZGARTIRILMAGAN!\n"
            "Iltimos, .env faylini oching va Telegram @BotFather dan olingan\n"
            "tokendan nusxa ko'chirib, BOT_TOKEN= qatoriga yozing.\n"
            "=" * 60
        )
        return

    logger.info("Ma'lumotlar bazasi ishga tushirilmoqda...")
    await db.init()
    logger.info("Ma'lumotlar bazasi tayyor.")

    # Bot va Dispatcher yaratish
    bot = Bot(
        token=BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML)
    )
    dp = Dispatcher(storage=MemoryStorage())

    # Routerni ulash
    dp.include_router(register_all_handlers())

    # Schedulerni ishga tushirish (avtomatik 1 kun oldin va o'sha kuni eslatish)
    scheduler = setup_scheduler(bot)

    logger.info("🤖 Bot muvaffaqiyatli ishga tushdi va xabarlarni kutmoqda...")

    try:
        # Eski o'qilmagan webhook/polling xabarlarni tozalash
        await bot.delete_webhook(drop_pending_updates=True)
        await dp.start_polling(bot)
    finally:
        logger.info("Bot to'xtatilmoqda...")
        scheduler.shutdown(wait=False)
        await bot.session.close()
        logger.info("Bot to'xtatildi.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot o'chirildi.")
