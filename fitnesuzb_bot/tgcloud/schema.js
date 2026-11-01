import { table, integer, text, real, sql } from 'sdk/db';

export const users = table('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tgId: integer('tg_id').unique().notNull(),
  name: text('name').notNull(),
  username: text('username'),
  role: text('role').default('user'), // 'user' yoki 'owner'
  activeMode: text('active_mode').default('user'), // 'user' yoki 'owner'
  step: text('step').default('idle'),
  gender: text('gender').default('none'),
  height: real('height').default(0),
  startWeight: real('start_weight').default(0),
  currentWeight: real('current_weight').default(0),
  targetWeight: real('target_weight').default(0),
  waterGoalMl: integer('water_goal_ml').default(2000),
  calorieGoal: integer('calorie_goal').default(1800),
  stepsGoal: integer('steps_goal').default(10000),
  xp: integer('xp').default(0),
  streak: integer('streak').default(0),
  lastActiveDate: text('last_active_date'),
  created: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const weightLogs = table('weight_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tgId: integer('tg_id').notNull(),
  weight: real('weight').notNull(),
  logDate: text('log_date').notNull(),
  created: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const waterLogs = table('water_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tgId: integer('tg_id').notNull(),
  amountMl: integer('amount_ml').notNull(),
  logDate: text('log_date').notNull(),
  created: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const workoutLogs = table('workout_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tgId: integer('tg_id').notNull(),
  workoutType: text('workout_type').notNull(),
  logDate: text('log_date').notNull(),
  created: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const stepLogs = table('step_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tgId: integer('tg_id').notNull(),
  steps: integer('steps').notNull(),
  caloriesBurned: real('calories_burned').default(0),
  distanceKm: real('distance_km').default(0),
  logDate: text('log_date').notNull(),
  created: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const calorieLogs = table('calorie_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tgId: integer('tg_id').notNull(),
  foodName: text('food_name').notNull(),
  calories: integer('calories').notNull(),
  mealType: text('meal_type').default('other'),
  logDate: text('log_date').notNull(),
  created: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const measurementLogs = table('measurement_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tgId: integer('tg_id').notNull(),
  waist: real('waist').default(0),
  height: real('height').default(0),
  hips: real('hips').default(0),
  chest: real('chest').default(0),
  logDate: text('log_date').notNull(),
  created: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const challengeLogs = table('challenge_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tgId: integer('tg_id').notNull(),
  dayNumber: integer('day_number').notNull(),
  logDate: text('log_date').notNull(),
  created: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});
