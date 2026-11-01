import re
from datetime import datetime
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.fsm.context import FSMContext

from bot.config import LOCAL_TZ
from bot.database.db import db
from bot.keyboards.reply import main_menu_keyboard, cancel_keyboard
from bot.utils.states import WeightStates

router = Router()


@router.message(F.text == "⚖️ Vazn nazorati")
async def show_weight_control(message: Message, state: FSMContext):
    await state.clear()
    user_id = message.from_user.id
    user = await db.get_user(user_id)

    if not user or user.get("start_weight", 0) == 0:
        await message.answer(
            "⚠️ Avval o'z profilingizni to'ldiring. /start buyrug'ini yuboring.",
            reply_markup=main_menu_keyboard()
        )
        return

    start_w = user["start_weight"]
    curr_w = user["current_weight"]
    target_w = user["target_weight"]

    diff_start = curr_w - start_w
    diff_target = curr_w - target_w

    if diff_start < 0:
        progress_text = f"🔥 <b>Natija:</b> Siz <b>{abs(diff_start):.1f} kg</b> ozdingiz! 🎉"
    elif diff_start > 0:
        progress_text = f"📈 <b>Natija:</b> Boshlang'ichdan +{diff_start:.1f} kg (rejimni kuchaytirish zarur)"
    else:
        progress_text = "⚖️ <b>Natija:</b> Boshlang'ich vazn bilan bir xil"

    target_rem_text = f"Maqsadgacha qoldi: <b>{diff_target:.1f} kg</b>" if diff_target > 0 else "🎯 <b>Maqsadingizga erishgansiz!</b>"

    # Tarixni olish
    history = await db.get_weight_history(user_id, limit=5)
    hist_text = ""
    if history:
        hist_text = "\n\n📋 <b>Oxirgi o'lchovlar:</b>\n"
        for h in history:
            hist_text += f"• {h['log_date']}: <b>{h['weight']} kg</b>\n"

    text = (
        "⚖️ <b>Vazn Nazorati va Natijalar</b>\n\n"
        f"🏁 Boshlang'ich vazn: <b>{start_w:.1f} kg</b>\n"
        f"📍 Hozirgi vazn: <b>{curr_w:.1f} kg</b>\n"
        f"🎯 Maqsadingiz: <b>{target_w:.1f} kg</b>\n\n"
        f"{progress_text}\n"
        f"⏳ {target_rem_text}"
        f"{hist_text}\n\n"
        "Bugungi vazningizni kiritish uchun quyidagi tugmani bosing:"
    )

    btn = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="⚖️ Yangi vazn kiritish", callback_data="weight_prompt")]
    ])
    await message.answer(text, parse_mode="HTML", reply_markup=btn)


@router.callback_query(F.data == "weight_prompt")
async def prompt_new_weight(callback: CallbackQuery, state: FSMContext):
    text = (
        "⚖️ Bugungi vazningizni kiriting:\n"
        "<i>(Masalan: <code>83.5</code> yoki <code>83</code>)</i>"
    )
    await callback.message.delete()
    await callback.message.answer(text, parse_mode="HTML", reply_markup=cancel_keyboard())
    await state.set_state(WeightStates.entering_new_weight)
    await callback.answer()


@router.message(WeightStates.entering_new_weight)
async def new_weight_entered(message: Message, state: FSMContext):
    cleaned = re.sub(r"[^\d.]", "", message.text.replace(",", "."))
    try:
        new_w = float(cleaned)
        if new_w < 30 or new_w > 250:
            raise ValueError()
    except Exception:
        await message.answer("❌ Iltimos, to'g'ri vazn kiriting (masalan: <code>82.5</code>):", parse_mode="HTML")
        return

    user_id = message.from_user.id
    user = await db.get_user(user_id)
    prev_w = user.get("current_weight", new_w)
    today_str = datetime.now(LOCAL_TZ).strftime("%Y-%m-%d")

    await db.add_weight_log(user_id, new_w, today_str)

    diff = new_w - prev_w
    if diff < 0:
        comment = f"🎉 <b>Ajoyib! O'tgan safargidan {abs(diff):.1f} kg ozdingiz!</b> Shunday davom eting! 💪"
    elif diff > 0:
        comment = f"⚠️ O'tgan safargidan +{diff:.1f} kg. Tushkunlikka tushmang, suv va kechki mashqlarga ko'proq e'tibor bering!"
    else:
        comment = "⚖️ Vazningiz barqaror turibdi. Tana o'zgarishlarga moslashmoqda."

    target_rem = new_w - user["target_weight"]
    rem_text = f"Maqsadga yana <b>{target_rem:.1f} kg</b> qoldi." if target_rem > 0 else "Siz o'z maqsadingizga erishdingiz! 🎉"

    text = (
        f"✅ <b>Vazn muvaffaqiyatli saqlandi: {new_w:.1f} kg</b>\n\n"
        f"{comment}\n\n"
        f"🎯 {rem_text}"
    )

    await state.clear()
    await message.answer(text, parse_mode="HTML", reply_markup=main_menu_keyboard())
