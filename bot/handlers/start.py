import re
from aiogram import Router, F
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.fsm.context import FSMContext

from bot.database.db import db
from bot.keyboards.reply import main_menu_keyboard, cancel_keyboard
from bot.keyboards.inline import gender_keyboard
from bot.utils.states import ProfileStates

router = Router()


def calculate_bmi(weight: float, height_cm: float) -> (float, str):
    """BMI (Tana vazni indeksi) hisoblash"""
    height_m = height_cm / 100.0
    bmi = weight / (height_m * height_m)

    if bmi < 18.5:
        status = "Vazn yetishmasligi (Kam vazn)"
    elif 18.5 <= bmi < 25.0:
        status = "Normal va ideal vazn 🌟"
    elif 25.0 <= bmi < 30.0:
        status = "Ortiqcha vazn (Ozish tavsiya etiladi) ⚠️"
    else:
        status = "Semizlik darajasi (Faol ozish zarur) 🚨"

    return bmi, status


@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext):
    await state.clear()
    user = message.from_user
    db_user = await db.get_or_create_user(
        user_id=user.id,
        username=user.username,
        full_name=user.full_name,
    )

    # Agar foydalanuvchi allaqachon profilini to'ldirgan bo'lsa
    if db_user.get("height", 0) > 0 and db_user.get("current_weight", 0) > 0:
        bmi, status = calculate_bmi(db_user["current_weight"], db_user["height"])
        to_lose = db_user["current_weight"] - db_user["target_weight"]
        lose_text = f"Tashlashingiz kerak bo'lgan vazn: <b>{to_lose:.1f} kg</b>" if to_lose > 0 else "Siz o'z maqsadingizdasiz!"

        text = (
            f"Salom, <b>{user.first_name}</b>! 👋\n\n"
            f"🏃 <b>QomatBot — Sizning shaxsiy fitnes va ozish murabbiyingiz!</b>\n\n"
            f"📊 <b>Sizning holatingiz:</b>\n"
            f"• Hozirgi vazn: <b>{db_user['current_weight']} kg</b>\n"
            f"• Maqsad: <b>{db_user['target_weight']} kg</b> ({lose_text})\n"
            f"• BMI ko'rsatkichi: <b>{bmi:.1f}</b> ({status})\n\n"
            f"🔔 <b>Kunlik rejimingiz:</b>\n"
            f"🌅 Ertalab ({db_user['morning_time']}): Badantarbiya va tetiklik\n"
            f"☀️ Tushlikda ({db_user['lunch_time']}): Faollik va to'g'ri taom\n"
            f"🌆 Kechqurun ({db_user['evening_time']}): Yog' yoqish mashqlari\n\n"
            f"Quyidagi menyudan kerakli bo'limni tanlang: 👇"
        )
        await message.answer(text, parse_mode="HTML", reply_markup=main_menu_keyboard())
        return

    # Yangi foydalanuvchi uchun so'rovnoma
    welcome = (
        f"Assalomu alaykum, <b>{user.first_name}</b>! 👋\n\n"
        f"🏃 <b>QomatBot</b> — Sog'lom va chiroyli qomatga erishishda sizning shaxsiy yordamchingiz bo'ladi!\n\n"
        f"Biz har kuni:\n"
        f"🌅 <b>Ertalab:</b> Uyg'otuvchi badantarbiya va suv eslatmasi\n"
        f"☀️ <b>Tushlikda:</b> Qorinda yog' to'planmasligi uchun yengil harakatlar\n"
        f"🌆 <b>Kechqurun:</b> Yog' yoqish va kaloriyalarni eritish mashg'ulotlarini birga bajaramiz!\n\n"
        f"Sizga mos reja va kaloriya normasini tuzishimiz uchun jinsingizni tanlang:"
    )
    await message.answer(welcome, parse_mode="HTML", reply_markup=gender_keyboard())
    await state.set_state(ProfileStates.entering_gender)


@router.callback_query(ProfileStates.entering_gender, F.data.startswith("gender_"))
async def gender_selected(callback: CallbackQuery, state: FSMContext):
    gender = callback.data.replace("gender_", "")
    await state.update_data(gender=gender)

    text = (
        "📏 <b>Bo'yingiz necha sm?</b>\n"
        "<i>(Faqat raqam kiriting, masalan: <code>175</code>)</i>"
    )
    await callback.message.delete()
    await callback.message.answer(text, parse_mode="HTML", reply_markup=cancel_keyboard())
    await state.set_state(ProfileStates.entering_height)
    await callback.answer()


@router.message(ProfileStates.entering_height)
async def height_entered(message: Message, state: FSMContext):
    cleaned = re.sub(r"[^\d.]", "", message.text.replace(",", "."))
    try:
        height = float(cleaned)
        if height < 100 or height > 250:
            raise ValueError()
    except Exception:
        await message.answer("❌ Iltimos, to'g'ri bo'y o'lchovini kiriting (masalan: <code>175</code>):", parse_mode="HTML")
        return

    await state.update_data(height=height)
    await message.answer(
        "⚖️ <b>Hozirgi vazningiz necha kg?</b>\n"
        "<i>(Masalan: <code>85</code> yoki <code>85.5</code>)</i>",
        parse_mode="HTML",
        reply_markup=cancel_keyboard()
    )
    await state.set_state(ProfileStates.entering_current_weight)


@router.message(ProfileStates.entering_current_weight)
async def current_weight_entered(message: Message, state: FSMContext):
    cleaned = re.sub(r"[^\d.]", "", message.text.replace(",", "."))
    try:
        weight = float(cleaned)
        if weight < 30 or weight > 250:
            raise ValueError()
    except Exception:
        await message.answer("❌ Iltimos, vazningizni to'g'ri kiriting (masalan: <code>85</code>):", parse_mode="HTML")
        return

    await state.update_data(current_weight=weight)
    await message.answer(
        "🎯 <b>Qanday vaznga tushmoqchisiz (Maqsadingiz necha kg)?</b>\n"
        "<i>(Masalan: <code>70</code>)</i>",
        parse_mode="HTML",
        reply_markup=cancel_keyboard()
    )
    await state.set_state(ProfileStates.entering_target_weight)


@router.message(ProfileStates.entering_target_weight)
async def target_weight_entered(message: Message, state: FSMContext):
    cleaned = re.sub(r"[^\d.]", "", message.text.replace(",", "."))
    try:
        target = float(cleaned)
        if target < 30 or target > 200:
            raise ValueError()
    except Exception:
        await message.answer("❌ Iltimos, maqsadli vaznni to'g'ri kiriting (masalan: <code>70</code>):", parse_mode="HTML")
        return

    data = await state.get_data()
    gender = data["gender"]
    height = data["height"]
    current_weight = data["current_weight"]

    # Kunlik suv normasi: vazn * 33 ml
    water_goal = int(current_weight * 33)

    # BMI hisoblash
    bmi, bmi_status = calculate_bmi(current_weight, height)

    await db.update_profile(
        user_id=message.from_user.id,
        gender=gender,
        height=height,
        start_weight=current_weight,
        target_weight=target,
        water_goal_ml=water_goal
    )

    diff = current_weight - target
    diff_text = f"Tashlanishi kerak bo'lgan vazn: <b>{diff:.1f} kg</b>" if diff > 0 else "Siz ajoyib formadasiz!"

    summary = (
        f"🎉 <b>Tabriklaymiz, profilingiz muvaffaqiyatli yaratildi!</b>\n\n"
        f"📊 <b>Sizning tahlilingiz:</b>\n"
        f"• Bo'y: <b>{height:.0f} sm</b> | Vazn: <b>{current_weight:.1f} kg</b>\n"
        f"• Maqsad: <b>{target:.1f} kg</b> ({diff_text})\n"
        f"• Tana vazni indeksi (BMI): <b>{bmi:.1f}</b> — <i>{bmi_status}</i>\n"
        f"💧 Kunlik suv normangiz: <b>{water_goal} ml</b> (~{water_goal // 250} stakan)\n\n"
        f"⏰ <b>Har kuni bot sizga eslatib turadi:</b>\n"
        f"• <b>07:30 da:</b> Ertalabki tetiklashtiruvchi badantarbiya\n"
        f"• <b>13:00 da:</b> Tushlikdagi harakat va ovqatlanish qoidasi\n"
        f"• <b>19:00 da:</b> Kechqurungi yog' yoqish mashqlari\n\n"
        f"Keling, hoziroq birinchi mashqni ko'rib chiqamiz! Pastdagi menyudan foydalaning: 👇"
    )

    await state.clear()
    await message.answer(summary, parse_mode="HTML", reply_markup=main_menu_keyboard())


@router.message(F.text == "❌ Bekor qilish")
async def cancel_action(message: Message, state: FSMContext):
    await state.clear()
    await message.answer("❌ Amal bekor qilindi.", reply_markup=main_menu_keyboard())
