import logging
from datetime import datetime
from aiogram import Bot
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from bot.config import LOCAL_TZ
from bot.database.db import db

logger = logging.getLogger(__name__)


async def check_daily_routines(bot: Bot):
    """
    Har daqiqada foydalanuvchilarning ertalabki, tushlikdagi va kechqurungi
    eslatma vaqtlarini tekshiradi va mashqlarni eslatadi.
    """
    now = datetime.now(LOCAL_TZ)
    current_time_str = now.strftime("%H:%M")

    try:
        users = await db.get_all_active_users()
        for user in users:
            uid = user["user_id"]
            name = user.get("full_name") or "Do'stim"

            # 1. Ertalabki eslatma
            if user.get("morning_time") == current_time_str:
                text = (
                    f"🌅 <b>Xayrli tong, {name}!</b>\n\n"
                    f"Yangi kun — orzuingizdagi qomat sari yangi qadam! 🌟\n\n"
                    f"💧 <b>1-qoida:</b> 1 stakan iliq suv iching (metabolizmni uyg'otadi).\n"
                    f"🏃 <b>2-qoida:</b> Ertalabki 10 daqiqalik uyg'otuvchi badantarbiya vaqti keldi!\n\n"
                    f"Tanangizni uyg'otib, kunni tetik boshlashga tayyormisiz?"
                )
                btn = InlineKeyboardMarkup(inline_keyboard=[
                    [InlineKeyboardButton(text="🏃 Badantarbiyani ko'rish", callback_data="wo_morning")],
                    [InlineKeyboardButton(text="💧 1 stakan suv ichdim", callback_data="water_add_250")]
                ])
                try:
                    await bot.send_message(chat_id=uid, text=text, parse_mode="HTML", reply_markup=btn)
                    logger.info(f"Morning reminder sent to {uid}")
                except Exception as e:
                    logger.warning(f"Failed to send morning reminder to {uid}: {e}")

            # 2. Tushlikdagi eslatma
            elif user.get("lunch_time") == current_time_str:
                text = (
                    f"☀️ <b>Tushlik vaqti bo'ldi, {name}!</b>\n\n"
                    f"🥗 <b>Oqilona ovqatlaning:</b> Likopchaning yarmi sabzavotlar, qolgani oqsil (go'sht/tuxum) bo'lsin.\n"
                    f"⚠️ <b>Muhim eslatma:</b> Tushlikdan keyin darhol yotib olmang — bu qorinda yog' to'planishining asosiy sababi!\n\n"
                    f"10 daqiqa yengil harakat qiling yoki quyidagi ofis/uy mashqini bajaring:"
                )
                btn = InlineKeyboardMarkup(inline_keyboard=[
                    [InlineKeyboardButton(text="☀️ Tushlik faolligi mashqi", callback_data="wo_lunch")],
                    [InlineKeyboardButton(text="💧 Suv ichdim", callback_data="water_add_250")]
                ])
                try:
                    await bot.send_message(chat_id=uid, text=text, parse_mode="HTML", reply_markup=btn)
                    logger.info(f"Lunch reminder sent to {uid}")
                except Exception as e:
                    logger.warning(f"Failed to send lunch reminder to {uid}: {e}")

            # 3. Kechqurungi mashq eslatmasi
            elif user.get("evening_time") == current_time_str:
                text = (
                    f"🌆 <b>Kechqurungi yog' yoqish mashqi vaqti, {name}!</b>\n\n"
                    f"🔥 Kun davomida qabul qilingan ortiqcha kaloriyalarni eritish vaqti keldi!\n"
                    f"15-20 daqiqalik qizg'in mashg'ulot tun bo'yi yog' yoqilishiga turtki bo'ladi.\n\n"
                    f"Mashqni boshlaymizmi? 💪"
                )
                btn = InlineKeyboardMarkup(inline_keyboard=[
                    [InlineKeyboardButton(text="🔥 Kechki mashg'ulotni boshlash", callback_data="wo_evening")],
                    [InlineKeyboardButton(text="⚖️ Bugungi vaznimni kiritish", callback_data="weight_prompt")]
                ])
                try:
                    await bot.send_message(chat_id=uid, text=text, parse_mode="HTML", reply_markup=btn)
                    logger.info(f"Evening reminder sent to {uid}")
                except Exception as e:
                    logger.warning(f"Failed to send evening reminder to {uid}: {e}")

    except Exception as e:
        logger.error(f"Error in scheduler check: {e}")


def setup_scheduler(bot: Bot) -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler(timezone=LOCAL_TZ)
    scheduler.add_job(
        check_daily_routines,
        "interval",
        minutes=1,
        args=[bot],
        id="check_fitness_routines",
        replace_existing=True
    )
    scheduler.start()
    logger.info("Fitness scheduler muvaffaqiyatli ishga tushirildi.")
    return scheduler
