import re
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.fsm.context import FSMContext

from bot.database.db import db
from bot.handlers.start import calculate_bmi
from bot.keyboards.reply import main_menu_keyboard, cancel_keyboard
from bot.keyboards.inline import gender_keyboard
from bot.utils.states import ScheduleStates, ProfileStates

router = Router()


# ===================== PROFIL VA BMI =====================
@router.message(F.text == "👤 Profilim & BMI")
async def show_profile(message: Message, state: FSMContext):
    await state.clear()
    user = await db.get_user(message.from_user.id)

    if not user or user.get("start_weight", 0) == 0:
        await message.answer("⚠️ Profilingiz hali to'ldirilmagan. /start buyrug'ini bosing.", reply_markup=main_menu_keyboard())
        return

    height = user["height"]
    start_w = user["start_weight"]
    curr_w = user["current_weight"]
    target_w = user["target_weight"]
    water_goal = user.get("water_goal_ml", 2000)

    bmi, bmi_status = calculate_bmi(curr_w, height)
    diff = curr_w - target_w
    diff_text = f"Tashlanishi kerak: <b>{diff:.1f} kg</b>" if diff > 0 else "Siz o'z maqsadingizdasiz! 🎯"

    text = (
        f"👤 <b>Foydalanuvchi Profili: {user['full_name']}</b>\n\n"
        f"📏 <b>Bo'y:</b> {height:.0f} sm\n"
        f"🏁 <b>Boshlang'ich vazn:</b> {start_w:.1f} kg\n"
        f"📍 <b>Hozirgi vazn:</b> {curr_w:.1f} kg\n"
        f"🎯 <b>Maqsadli vazn:</b> {target_w:.1f} kg ({diff_text})\n\n"
        f"📊 <b>BMI (Tana vazni indeksi):</b> <b>{bmi:.1f}</b>\n"
        f"📌 <b>Holat:</b> <i>{bmi_status}</i>\n\n"
        f"💧 <b>Kunlik suv me'yori:</b> {water_goal} ml\n\n"
        "<i>Ma'lumotlarni qaytadan kiritish uchun quyidagi tugmani bosing:</i>"
    )

    btn = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔄 Profilni qayta to'ldirish", callback_data="re_profile")]
    ])
    await message.answer(text, parse_mode="HTML", reply_markup=btn)


@router.callback_query(F.data == "re_profile")
async def restart_profile(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    text = "Jinsingizni tanlang:"
    await callback.message.delete()
    await callback.message.answer(text, reply_markup=gender_keyboard())
    await state.set_state(ProfileStates.entering_gender)
    await callback.answer()


# ===================== KUNLIK REJIM SOZLAMALARI =====================
@router.message(F.text == "⚙️ Rejim & Sozlamalar")
async def show_schedule_settings(message: Message, state: FSMContext):
    await state.clear()
    user = await db.get_user(message.from_user.id)
    morning = user.get("morning_time", "07:30") if user else "07:30"
    lunch = user.get("lunch_time", "13:00") if user else "13:00"
    evening = user.get("evening_time", "19:00") if user else "19:00"

    text = (
        "⚙️ <b>Kunlik Rejim va Eslatma Vaqtlari</b>\n\n"
        "Bot har kuni sizga mashq va ovqatlanish tartibini eslatib turadi:\n\n"
        f"🌅 <b>Ertalabki badantarbiya:</b> {morning}\n"
        f"☀️ <b>Tushlik faolligi:</b> {lunch}\n"
        f"🌆 <b>Kechqurungi yog' yoqish mashqi:</b> {evening}\n\n"
        "<i>Ushbu vaqtlarni o'zingizning ish jadvalingizga moslab o'zgartirishingiz mumkin.</i>"
    )

    btn = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="⏰ Vaqtlarni o'zgartirish", callback_data="change_schedule")]
    ])
    await message.answer(text, parse_mode="HTML", reply_markup=btn)


@router.callback_query(F.data == "change_schedule")
async def start_change_schedule(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    text = (
        "🌅 <b>Ertalabki badantarbiya vaqti</b>ni kiriting:\n"
        "<i>(Format: <code>07:00</code> yoki <code>07:30</code>)</i>"
    )
    await callback.message.delete()
    await callback.message.answer(text, parse_mode="HTML", reply_markup=cancel_keyboard())
    await state.set_state(ScheduleStates.entering_morning_time)
    await callback.answer()


@router.message(ScheduleStates.entering_morning_time)
async def morning_time_entered(message: Message, state: FSMContext):
    time_text = message.text.strip()
    if not re.match(r"^([01]?\d|2[0-3]):[0-5]\d$", time_text):
        await message.answer("❌ Noto'g'ri format! Masalan: <code>07:30</code> deb yozing:", parse_mode="HTML")
        return

    await state.update_data(morning_time=time_text)
    await message.answer(
        "☀️ <b>Tushlikdagi faollik eslatmasi vaqti</b>ni kiriting:\n"
        "<i>(Format: <code>13:00</code> yoki <code>13:30</code>)</i>",
        parse_mode="HTML",
        reply_markup=cancel_keyboard()
    )
    await state.set_state(ScheduleStates.entering_lunch_time)


@router.message(ScheduleStates.entering_lunch_time)
async def lunch_time_entered(message: Message, state: FSMContext):
    time_text = message.text.strip()
    if not re.match(r"^([01]?\d|2[0-3]):[0-5]\d$", time_text):
        await message.answer("❌ Noto'g'ri format! Masalan: <code>13:00</code> deb yozing:", parse_mode="HTML")
        return

    await state.update_data(lunch_time=time_text)
    await message.answer(
        "🌆 <b>Kechqurungi yog' yoqish mashqi vaqti</b>ni kiriting:\n"
        "<i>(Format: <code>19:00</code> yoki <code>20:00</code>)</i>",
        parse_mode="HTML",
        reply_markup=cancel_keyboard()
    )
    await state.set_state(ScheduleStates.entering_evening_time)


@router.message(ScheduleStates.entering_evening_time)
async def evening_time_entered(message: Message, state: FSMContext):
    time_text = message.text.strip()
    if not re.match(r"^([01]?\d|2[0-3]):[0-5]\d$", time_text):
        await message.answer("❌ Noto'g'ri format! Masalan: <code>19:00</code> deb yozing:", parse_mode="HTML")
        return

    data = await state.get_data()
    morning = data["morning_time"]
    lunch = data["lunch_time"]
    evening = time_text

    await db.update_schedule(
        user_id=message.from_user.id,
        morning_time=morning,
        lunch_time=lunch,
        evening_time=evening
    )

    text = (
        "✅ <b>Kunlik rejim muvaffaqiyatli saqlandi!</b>\n\n"
        f"🌅 Ertalab: <b>{morning}</b>\n"
        f"☀️ Tushlikda: <b>{lunch}</b>\n"
        f"🌆 Kechqurun: <b>{evening}</b>\n\n"
        "<i>Bot shu vaqtlarda sizga muntazam eslatib turadi!</i>"
    )
    await state.clear()
    await message.answer(text, parse_mode="HTML", reply_markup=main_menu_keyboard())
