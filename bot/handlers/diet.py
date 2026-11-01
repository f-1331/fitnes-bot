from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext

from bot.keyboards.inline import diet_menu_keyboard
from bot.keyboards.reply import main_menu_keyboard

router = Router()

DIET_TOPICS = {
    "breakfast": (
        "🍳 <b>Ozdiruvchi Foydali Nonushta</b>\n\n"
        "Nonushta — kunlik metabolizmni ishga tushiruvchi eng asosiy taomdir. Uni o'tkazib yubormang!\n\n"
        "✅ <b>Tavsiya etiladigan taomlar:</b>\n"
        "• <b>2 dona qaynatilgan tuxum</b> + bodring va ko'katlar.\n"
        "• <b>Suli bo'tqasi (Ovsyanka)</b> suvda yoki kam yog'li sutda pishirilgan + bir nechta yong'oq yoki reza mevalar.\n"
        "• <b>Tvorog (kam yog'li)</b> + 1 choy qoshiq asal.\n"
        "• <b>Ichimlik:</b> Yashil choy yoki shakarsiz qora qahva.\n\n"
        "❌ <i>Shakarli shirinliklar, oq non va kolbasa mahsulotlaridan tiyiling.</i>"
    ),

    "lunch": (
        "🍲 <b>Sog'lom va Qoniqarli Tushlik</b>\n\n"
        "Tushlikda tana o'z quvvatini tiklaydi. Bu yerda «Likopcha qoidasi»ga amal qiling:\n\n"
        "🥗 <b>Likopcha qoidasi:</b>\n"
        "• <b>50% (Yarmi):</b> Yangi sabzavotlar (karam, bodring, pomidor, ko'katlar, sabzi).\n"
        "• <b>25% (Choragi):</b> Oqsil (qaynatilgan tovuq filesi, mol go'shti, baliq yoki no'xat/mosh).\n"
        "• <b>25% (Choragi):</b> Murakkab uglevod (grechka, jigarrang guruch, bug'doy yormasi).\n\n"
        "💡 <i>Ovqatdan 20 daqiqa oldin 1 stakan suv iching. Ovqat ustidan sovuq choy yoki suv ichmang!</i>"
    ),

    "dinner": (
        "🥗 <b>Yengil Kechki Ovqat (Yog' yoqish uchun)</b>\n\n"
        "Kechasi oshqozon dam olishi va tana to'plangan yog'larni yoqishi kerak.\n\n"
        "✅ <b>Eng yaxshi kechki variantlar:</b>\n"
        "• Qaynatilgan baliq yoki tovuq go'shti + sabzavotli salat (zaytun moyi bilan).\n"
        "• 1 stakan kefir yoki tabiiy qatiq + ko'katlar.\n"
        "• Bug'da pishgan sabzavotlar (brokkoli, gulkaram, qovoqcha).\n\n"
        "⚠️ <b>Oltin qoida:</b> Uyquga yotishdan <b>kamida 3 soat oldin</b> ovqatlanishni to'xtating!"
    ),

    "forbidden": (
        "🚫 <b>Ozish davrida qat'iyan cheklanishi kerak bo'lganlar:</b>\n\n"
        "1. 🥤 <b>Gazli va shirin ichimliklar</b> (Cola, Fanta, sharbatlar) — 1 stakanida 6-7 qoshiq shakar bor!\n"
        "2. 🥐 <b>Oq un va xamir ovqatlar</b> (Somsa, manti, patir, oq non, pishiriqlar).\n"
        "3. 🍟 <b>Fastfud va qovurilgan taomlar</b> (Haddan tashqari ko'p zararli trans-yog'lar).\n"
        "4. 🍬 <b>Shakarlamalar va konfetlar</b> (Metabolizmni to'xtatadi).\n"
        "5. 🧂 <b>Ortiqcha tuz</b> (Tanada suv to'planishiga va shishlarga sabab bo'ladi)."
    )
}


@router.message(F.text == "🥗 Ozish taomnomasi")
async def show_diet_menu(message: Message, state: FSMContext):
    await state.clear()
    text = (
        "🥗 <b>Ozish Taomnomasi va To'g'ri Ovqatlanish Sirlari</b>\n\n"
        "Sport natijasi — <b>70% oshxonada</b> hal bo'ladi! Qancha ko'p mashq qilmang, agar noto'g'ri ovqatlansangiz, yog' ketmaydi.\n\n"
        "Qaysi bo'lim bo'yicha maslahat olmoqchisiz? Tanlang: 👇"
    )
    await message.answer(text, parse_mode="HTML", reply_markup=diet_menu_keyboard())


@router.callback_query(F.data.startswith("diet_"))
async def show_diet_topic(callback: CallbackQuery):
    topic = callback.data.replace("diet_", "")
    text = DIET_TOPICS.get(topic, "Ma'lumot topilmadi.")

    await callback.message.edit_text(text, parse_mode="HTML", reply_markup=diet_menu_keyboard())
    await callback.answer()
