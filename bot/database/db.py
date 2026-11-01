import aiosqlite
from datetime import datetime
from typing import List, Optional, Dict, Any
from bot.config import (
    DATABASE_PATH,
    DEFAULT_MORNING_TIME,
    DEFAULT_LUNCH_TIME,
    DEFAULT_EVENING_TIME,
    DEFAULT_WATER_GOAL_ML,
)


class Database:
    def __init__(self, db_path=DATABASE_PATH):
        self.db_path = str(db_path)

    async def init(self):
        """Ma'lumotlar bazasini va barcha jadvallarni yaratish"""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("PRAGMA foreign_keys = ON;")

            # 1. Foydalanuvchilar jadvali
            await db.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    user_id INTEGER PRIMARY KEY,
                    username TEXT,
                    full_name TEXT,
                    gender TEXT DEFAULT 'none',
                    height REAL DEFAULT 0,
                    start_weight REAL DEFAULT 0,
                    current_weight REAL DEFAULT 0,
                    target_weight REAL DEFAULT 0,
                    water_goal_ml INTEGER DEFAULT 2000,
                    morning_time TEXT DEFAULT '07:30',
                    lunch_time TEXT DEFAULT '13:00',
                    evening_time TEXT DEFAULT '19:00',
                    is_active INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            # 2. Vazn o'zgarishlari tarixi (Weight logs)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS weight_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    weight REAL NOT NULL,
                    log_date TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
                );
            """)

            # 3. Kunlik suv hisobi (Water logs)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS water_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    amount_ml INTEGER NOT NULL,
                    log_date TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
                );
            """)

            # 4. Mashqlar hisobi (Workout logs)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS workout_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    workout_type TEXT NOT NULL,
                    log_date TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
                );
            """)

            await db.commit()

    # ========================== USERS ==========================
    async def get_or_create_user(self, user_id: int, username: Optional[str], full_name: Optional[str]) -> Dict[str, Any]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM users WHERE user_id = ?", (user_id,)) as cursor:
                row = await cursor.fetchone()
                if row:
                    return dict(row)

            # Yangi foydalanuvchi yaratish
            await db.execute("""
                INSERT INTO users (
                    user_id, username, full_name, 
                    morning_time, lunch_time, evening_time, water_goal_ml
                ) VALUES (?, ?, ?, ?, ?, ?, ?);
            """, (
                user_id, username, full_name,
                DEFAULT_MORNING_TIME, DEFAULT_LUNCH_TIME, DEFAULT_EVENING_TIME, DEFAULT_WATER_GOAL_ML
            ))
            await db.commit()

            async with db.execute("SELECT * FROM users WHERE user_id = ?", (user_id,)) as cursor:
                new_row = await cursor.fetchone()
                return dict(new_row)

    async def get_user(self, user_id: int) -> Optional[Dict[str, Any]]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM users WHERE user_id = ?", (user_id,)) as cursor:
                row = await cursor.fetchone()
                return dict(row) if row else None

    async def get_all_active_users(self) -> List[Dict[str, Any]]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM users WHERE is_active = 1") as cursor:
                rows = await cursor.fetchall()
                return [dict(r) for r in rows]

    async def update_profile(
        self,
        user_id: int,
        gender: str,
        height: float,
        start_weight: float,
        target_weight: float,
        water_goal_ml: int
    ):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                UPDATE users
                SET gender = ?,
                    height = ?,
                    start_weight = ?,
                    current_weight = ?,
                    target_weight = ?,
                    water_goal_ml = ?
                WHERE user_id = ?;
            """, (gender, height, start_weight, start_weight, target_weight, water_goal_ml, user_id))

            # Dastlabki vaznni tarixga ham kiritamiz
            today_str = datetime.now().strftime("%Y-%m-%d")
            await db.execute("""
                INSERT INTO weight_logs (user_id, weight, log_date)
                VALUES (?, ?, ?);
            """, (user_id, start_weight, today_str))

            await db.commit()

    async def update_schedule(self, user_id: int, morning_time: str, lunch_time: str, evening_time: str):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                UPDATE users
                SET morning_time = ?, lunch_time = ?, evening_time = ?
                WHERE user_id = ?;
            """, (morning_time, lunch_time, evening_time, user_id))
            await db.commit()

    # ========================== WEIGHT LOGS ==========================
    async def add_weight_log(self, user_id: int, weight: float, log_date: str):
        async with aiosqlite.connect(self.db_path) as db:
            # Bugungi kunga oldin kiritilgan bo'lsa yangilaymiz yoki yangi qo'shamiz
            await db.execute("""
                INSERT INTO weight_logs (user_id, weight, log_date)
                VALUES (?, ?, ?);
            """, (user_id, weight, log_date))

            # users jadvalidagi hozirgi vaznni yangilaymiz
            await db.execute("""
                UPDATE users SET current_weight = ? WHERE user_id = ?;
            """, (weight, user_id))

            await db.commit()

    async def get_weight_history(self, user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("""
                SELECT * FROM weight_logs
                WHERE user_id = ?
                ORDER BY log_date DESC, id DESC
                LIMIT ?;
            """, (user_id, limit)) as cursor:
                rows = await cursor.fetchall()
                return [dict(r) for r in rows]

    # ========================== WATER LOGS ==========================
    async def add_water(self, user_id: int, amount_ml: int, log_date: str):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT INTO water_logs (user_id, amount_ml, log_date)
                VALUES (?, ?, ?);
            """, (user_id, amount_ml, log_date))
            await db.commit()

    async def get_today_water(self, user_id: int, log_date: str) -> int:
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute("""
                SELECT SUM(amount_ml) FROM water_logs
                WHERE user_id = ? AND log_date = ?;
            """, (user_id, log_date)) as cursor:
                row = await cursor.fetchone()
                return row[0] if row and row[0] else 0

    # ========================== WORKOUT LOGS ==========================
    async def record_workout(self, user_id: int, workout_type: str, log_date: str):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                INSERT INTO workout_logs (user_id, workout_type, log_date)
                VALUES (?, ?, ?);
            """, (user_id, workout_type, log_date))
            await db.commit()

    async def get_today_workouts(self, user_id: int, log_date: str) -> List[str]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("""
                SELECT DISTINCT workout_type FROM workout_logs
                WHERE user_id = ? AND log_date = ?;
            """, (user_id, log_date)) as cursor:
                rows = await cursor.fetchall()
                return [r["workout_type"] for r in rows]


# Global instance
db = Database()
