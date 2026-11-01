import re
from datetime import datetime
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext

from bot.config import LOCAL_TZ
from bot.database.db import db
from bot.keyboards.inline import water_buttons_keyboard
from bot.keyboards.reply import main_menu_keyboard, cancel_keyboard
from bot.utils.states import WaterStates

router = Router()


def render_water_text(current_ml: int, goal_ml: int) -> str:
    pct = min(100, int((current_ml / goal_ml) * 100)) if goal_ml > 0 else 0
    bars = int(round(pct / 10))
    progress = "🟦" * bars + "⬜" * (10 - bars)

    remaining = max(0, goal_ml - current_ml)
    rem_text = f"Qolgan miqdor: <b>{remaining} ml</b> (~{remaining // 250} stakan)" if remaining > 0 else "🎉 <b>Kunlik norma to'liq bajarildi!</b>"

    text = (
        "💧 <b>Kunlik Suv Hisoblagichi</b>\n\n"
        "<i>Ozish siri — yetarli miqdorda suv ichishda! Suv metabolizmni 30% ga tezlashtiradi va ochlik hissini yo'qotadi.</i>\n\n"
        f"🎯 Kunlik me'yor: <b>{goal_ml} ml</b>\n"
        f"🥤 Ichilgan suv: <b>{current_ml} ml</b> ({pct}%)\n"
        f"<code>[{progress}]</code>\n\n"
        f"{rem_text}\n\n"
        "Suv ichganingizda quyidagi tugmalarni bosib hisoblab boring: 👇"
    )
    return text


@router.message(F.text == "💧 Suv hisoblagichi")
async def show_water_tracker(message: Message, state: FSMContext):
    await state.clear()
    user_id = message.from_user.id
    user = await db.get_user(user_id)
    goal_ml = user.get("water_goal_ml", 2000) if user else 2000

    today_str = datetime.now(LOCAL_TZ).strftime("%Y-%m-%d")
    current_ml = await db.get_today_water(user_id, today_str)

    text = render_water_text(current_ml, goal_ml)
    await message.answer(text, parse_mode="HTML", reply_markup=water_buttons_keyboard())


@router.callback_query(F.data.startswith("water_add_"))
async def add_water_callback(callback: CallbackQuery, state: FSMContext):
    val_str = callback.data.replace("water_add_", "")

    if val_str == "custom":
        await callback.message.delete()
        await callback.message.answer(
            "✏️ Ichilgan suv miqdorini <b>ml</b> da yozing (masalan: <code>300</code>):",
            parse_mode="HTML",
            reply_markup=cancel_keyboard()
        )
        await state.set_state(WaterStates.entering_custom_water)
        await callback.answer()
        return

    amount = int(val_str)
    user_id = callback.from_user.id
    today_str = datetime.now(LOCAL_TZ).strftime("%Y-%m-%d")

    await db.add_water(user_id, amount, today_str)

    user = await db.get_user(user_id)
    goal_ml = user.get("water_goal_ml", 2000) if user else 2000
    new_total = await db.get_today_water(user_id, today_str)

    text = render_water_text(new_total, goal_ml)
    await callback.message.edit_text(text, parse_mode="HTML", reply_markup=water_buttons_keyboard())
    await callback.answer(f"+{amount} ml qo'shildi! 💧")


@router.message(WaterStates.entering_custom_water)
async def custom_water_entered(message: Message, state: FSMContext):
    cleaned = re.sub(r"[^\d]", "", message.text)
    try:
        amount = int(cleaned)
        if amount <= 0 or amount > 2000:
            raise ValueError()
    except Exception:
        await message.answer("❌ Iltimos, to'g'ri miqdor kiriting (masalan: <code>350</code> ml):", parse_mode="HTML")
        return

    user_id = message.from_user.id
    today_str = datetime.now(LOCAL_TZ).strftime("%Y-%m-%d")

    await db.add_water(user_id, amount, today_str)

    user = await db.get_user(user_id)
    goal_ml = user.get("water_goal_ml", 2000) if user else 2000
    new_total = await db.get_today_water(user_id, today_str)

    await state.clear()
    text = render_water_text(new_total, goal_ml)
    await message.answer(f"✅ +{amount} ml suv muvaffaqiyatli qo'shildi!", reply_markup=main_menu_keyboard())
    await message.answer(text, parse_mode="HTML", reply_markup=water_buttons_keyboard())
