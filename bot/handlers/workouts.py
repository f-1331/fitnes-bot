from datetime import datetime
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext

from bot.config import LOCAL_TZ
from bot.database.db import db
from bot.services.workouts_data import WORKOUTS
from bot.keyboards.inline import workouts_menu_keyboard, workout_done_keyboard
from bot.keyboards.reply import main_menu_keyboard

router = Router()


@router.message(F.text == "🏃 Mashqlar (Kunlik reja)")
async def show_workouts_menu(message: Message, state: FSMContext):
    await state.clear()
    today_str = datetime.now(LOCAL_TZ).strftime("%Y-%m-%d")
    done_workouts = await db.get_today_workouts(message.from_user.id, today_str)

    done_text = ""
    if done_workouts:
        done_text = f"\n✅ <i>Bugun bajarilgan: {', '.join(done_workouts)}</i>\n"

    text = (
        "🏃 <b>Kunlik Ozish va Mashqlar Rejasi</b>\n\n"
        "Ortiqcha vazndan xalos bo'lish uchun kun davomida to'g'ri taqsimlangan mashqlar tizimi:\n\n"
        "🌅 <b>Ertalabki badantarbiya:</b> Tanani uyg'otish va metabolizmni tezlashtirish (10 daqiqa).\n"
        "☀️ <b>Tushlikdagi harakat:</b> Qorinda yog' to'planishining oldini olish (10 daqiqa).\n"
        "🌆 <b>Kechqurungi yog' yoqish:</b> Asosiy kaloriyalarni eritish kardio mashg'uloti (20 daqiqa).\n"
        "🔥 <b>Qorin press mashqlari:</b> Qorinni tortish va belni ingichkalashtirish.\n"
        f"{done_text}\n"
        "Qaysi mashqni boshlamoqchisiz? Tanlang: 👇"
    )
    await message.answer(text, parse_mode="HTML", reply_markup=workouts_menu_keyboard())


@router.callback_query(F.data == "wo_menu_back")
async def back_to_workouts(callback: CallbackQuery):
    await callback.message.edit_text(
        "🏃 Mashq turini tanlang:",
        reply_markup=workouts_menu_keyboard()
    )
    await callback.answer()


@router.callback_query(F.data.startswith("wo_"))
async def display_workout_detail(callback: CallbackQuery):
    wo_key = callback.data.replace("wo_", "")
    item = WORKOUTS.get(wo_key)

    if not item:
        await callback.answer("Mashq topilmadi.")
        return

    steps_text = "\n\n".join(item["steps"])

    text = (
        f"{item['title']}\n\n"
        f"⏱ <b>Davomiyligi:</b> {item['duration']}\n"
        f"🔥 <b>Yoqiladigan kaloriya:</b> {item['calories']}\n\n"
        f"📖 <i>{item['description']}</i>\n\n"
        f"📝 <b>Mashqlar ketma-ketligi:</b>\n\n"
        f"{steps_text}\n\n"
        f"{item['tip']}"
    )

    await callback.message.edit_text(
        text,
        parse_mode="HTML",
        reply_markup=workout_done_keyboard(wo_key)
    )
    await callback.answer()


@router.callback_query(F.data.startswith("done_"))
async def mark_workout_done(callback: CallbackQuery):
    wo_key = callback.data.replace("done_", "")
    user_id = callback.from_user.id
    today_str = datetime.now(LOCAL_TZ).strftime("%Y-%m-%d")

    wo_names = {
        "morning": "🌅 Ertalabki badantarbiya",
        "lunch": "☀️ Tushlik faolligi",
        "evening": "🌆 Kechqurungi yog' yoqish",
        "abs": "🔥 Qorin press mashqi"
    }
    name = wo_names.get(wo_key, "Mashg'ulot")

    await db.record_workout(user_id, name, today_str)

    congrats = (
        f"🎉 <b>Ajoyib natija! Barakalla!</b> 💪🔥\n\n"
        f"Siz <b>{name}</b>ni muvaffaqiyatli yakunladingiz!\n"
        f"Har bir bunday harakat tanangizdagi yog'larni eritishga va o'zingizni ancha yengil his qilishingizga xizmat qiladi.\n\n"
        f"💧 Endi 1 stakan toza suv ichib, nafasni rostlab oling!"
    )

    await callback.message.edit_text(congrats, parse_mode="HTML")
    await callback.answer("Mashq saqlandi! +1", show_alert=False)
