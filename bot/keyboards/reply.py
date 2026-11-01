from aiogram.types import ReplyKeyboardMarkup, KeyboardButton


def main_menu_keyboard() -> ReplyKeyboardMarkup:
    """Asosiy menyu klaviaturasi"""
    keyboard = [
        [
            KeyboardButton(text="🏃 Mashqlar (Kunlik reja)"),
            KeyboardButton(text="💧 Suv hisoblagichi"),
        ],
        [
            KeyboardButton(text="⚖️ Vazn nazorati"),
            KeyboardButton(text="🥗 Ozish taomnomasi"),
        ],
        [
            KeyboardButton(text="👤 Profilim & BMI"),
            KeyboardButton(text="⚙️ Rejim & Sozlamalar"),
        ],
    ]
    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)


def cancel_keyboard() -> ReplyKeyboardMarkup:
    """Bekor qilish tugmasi"""
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="❌ Bekor qilish")]],
        resize_keyboard=True,
    )
