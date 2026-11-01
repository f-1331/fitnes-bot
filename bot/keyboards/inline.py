from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton


def gender_keyboard() -> InlineKeyboardMarkup:
    buttons = [
        [
            InlineKeyboardButton(text="👨 Erkak", callback_data="gender_erkak"),
            InlineKeyboardButton(text="👩 Ayol", callback_data="gender_ayol"),
        ]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)


def workouts_menu_keyboard() -> InlineKeyboardMarkup:
    buttons = [
        [InlineKeyboardButton(text="🌅 Ertalabki badantarbiya (10 daq)", callback_data="wo_morning")],
        [InlineKeyboardButton(text="☀️ Tushlikdagi faollik (10 daq)", callback_data="wo_lunch")],
        [InlineKeyboardButton(text="🌆 Kechqurungi yog' yoqish (20 daq)", callback_data="wo_evening")],
        [InlineKeyboardButton(text="🔥 Qorin yog'larini eritish (Press)", callback_data="wo_abs")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)


def workout_done_keyboard(workout_key: str) -> InlineKeyboardMarkup:
    buttons = [
        [InlineKeyboardButton(text="✅ Mashqni bajardim (+1)", callback_data=f"done_{workout_key}")],
        [InlineKeyboardButton(text="◀️ Orqaga", callback_data="wo_menu_back")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)


def water_buttons_keyboard() -> InlineKeyboardMarkup:
    buttons = [
        [
            InlineKeyboardButton(text="💧 +250 ml (1 stakan)", callback_data="water_add_250"),
            InlineKeyboardButton(text="💧 +500 ml (0.5 l)", callback_data="water_add_500"),
        ],
        [
            InlineKeyboardButton(text="✏️ Boshqa miqdor", callback_data="water_add_custom"),
        ]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)


def diet_menu_keyboard() -> InlineKeyboardMarkup:
    buttons = [
        [InlineKeyboardButton(text="🍳 Foydali Nonushta", callback_data="diet_breakfast")],
        [InlineKeyboardButton(text="🍲 To'g'ri Tushlik", callback_data="diet_lunch")],
        [InlineKeyboardButton(text="🥗 Yengil Kechki Ovqat", callback_data="diet_dinner")],
        [InlineKeyboardButton(text="🚫 Nimalardan tiyilish kerak?", callback_data="diet_forbidden")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)
