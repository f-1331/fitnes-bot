from aiogram.fsm.state import State, StatesGroup


class ProfileStates(StatesGroup):
    entering_gender = State()
    entering_height = State()
    entering_current_weight = State()
    entering_target_weight = State()


class WeightStates(StatesGroup):
    entering_new_weight = State()


class WaterStates(StatesGroup):
    entering_custom_water = State()


class ScheduleStates(StatesGroup):
    entering_morning_time = State()
    entering_lunch_time = State()
    entering_evening_time = State()
