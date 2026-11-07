import { api, db } from 'sdk';
import { eq } from 'sdk/db';
import { users, waterLogs, workoutLogs, stepLogs, calorieLogs, measurementLogs, challengeLogs, weightLogs } from '../schema.js';
import { WORKOUTS, DIET_TOPICS, formatExerciseDetail } from '../lib/workouts.js';
import { FOOD_DATABASE, FOOD_MAP } from '../lib/calories_db.js';
import { DETOX_DRINKS } from '../lib/drinks.js';
import { CHALLENGE_DAYS } from '../lib/challenge.js';
import { weeklyDietPlan } from '../lib/diet_plans.js';
import {
  generateGlobalStatsText,
  generatePersonalStatsText,
  generateWeightChart,
  calculateBurnPlan,
  generateLeaderboardText,
  getRandomMotivation,
  getTashkentDateStr
} from '../lib/stats_helper.js';
import {
  workoutsInline,
  workoutDoneInline,
  exerciseStepInline,
  singleExerciseInline,
  waterInline,
  dietInline,
  caloriesMenuInline,
  foodCategoriesInline,
  stepsInline,
  detoxInline,
  reminderMeasureInline,
  genderInline,
  mainKeyboard,
  burnCalorieInline,
  fitnessTimerInline,
  leaderboardInline,
  statsOwnerChoiceInline,
  personalStatsInline,
  weeklyDietMenuInline,
  idealWeightInline,
  achievementsInline,
  shareBotInline,
  quickTimerInline
} from '../lib/keyboards.js';

export default async function (query, ctx) {
  const queryId = query.id;
  const fromUser = query.from;
  const data = query.data || '';
  const message = query.message;
  const chatId = message?.chat?.id;
  const messageId = message?.message_id;
  const today = getTashkentDateStr();

  if (!chatId || !messageId) {
    try { await api.answerCallbackQuery({ callback_query_id: queryId }); } catch (e) {}
    return;
  }

  const user = await db.select().from(users).where(eq(users.tgId, fromUser.id)).get();

  // 1. JINSNI TANLASH
  if (data.startsWith('gender_')) {
    const gender = data.replace('gender_', '');
    await db.update(users).set({ gender, step: 'height' }).where(eq(users.tgId, fromUser.id)).run();

    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: `Jinsingiz: <b>${gender === 'erkak' ? '👨 Erkak' : '👩 Ayol'}</b> tanlandi.\n\n📏 <b>Bo'yingiz necha sm?</b>\n<i>(Masalan: <code>175</code>)</i>`,
      parse_mode: 'HTML'
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  // 2. MASHG'ULOTLAR — BOSQICHMA-BOSQICH RASMLI QO'LLANMA
  if (data.startsWith('wo_step_')) {
    const parts = data.replace('wo_step_', '').split('_');
    const index = parseInt(parts.pop(), 10) || 0;
    const workoutKey = parts.join('_');
    const workout = WORKOUTS[workoutKey];

    if (workout && workout.exercises && workout.exercises[index]) {
      const exKey = workout.exercises[index];
      const detailText = formatExerciseDetail(exKey);

      if (detailText) {
        const header = (
          `📍 <b>${workout.title}</b>\n` +
          `🔹 Mashq: <b>${index + 1} / ${workout.exercises.length}</b>\n\n`
        );

        await api.editMessageText({
          chat_id: chatId,
          message_id: messageId,
          text: header + detailText,
          parse_mode: 'HTML',
          reply_markup: exerciseStepInline(workoutKey, workout.exercises, index)
        });
        await api.answerCallbackQuery({ callback_query_id: queryId });
        return;
      }
    }
  }

  // ALOHIDA MASHQNI KO'RISH
  if (data.startsWith('ex_view_')) {
    const parts = data.replace('ex_view_', '').split('_');
    const exKey = parts.pop();
    const workoutKey = parts.join('_');
    const detailText = formatExerciseDetail(exKey);

    if (detailText) {
      await api.editMessageText({
        chat_id: chatId,
        message_id: messageId,
        text: detailText,
        parse_mode: 'HTML',
        reply_markup: singleExerciseInline(workoutKey)
      });
      await api.answerCallbackQuery({ callback_query_id: queryId });
      return;
    }
  }

  // TEZKOR MASHQ TAYMERI (30s / 45s / 60s)
  if (data.startsWith('timer_quick_')) {
    const sec = parseInt(data.replace('timer_quick_', ''), 10) || 30;
    const timerText = (
      `⏱ <b>${sec} Sekundlik Mashq Taymeri</b>\n\n` +
      `Tayyormisiz? 3.. 2.. 1.. <b>BOSHLANG!</b> 🔔\n\n` +
      `Mashqni to'g'ri texnika bilan bajaring.\n` +
      `Tugatgach, dam oling va keyingi mashqqa o'ting! 💪`
    );
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: timerText,
      parse_mode: 'HTML',
      reply_markup: quickTimerInline(sec)
    });
    await api.answerCallbackQuery({ callback_query_id: queryId, text: `${sec} sekundlik taymer!` });
    return;
  }

  // MASHG'ULOT UMUMIY RO'YXATI
  if (data.startsWith('wo_') && !data.startsWith('wo_back')) {
    const key = data.replace('wo_', '');
    const workout = WORKOUTS[key];

    if (workout) {
      const exList = (workout.steps || []).join('\n\n');
      const text = (
        `🏋️ <b>${workout.title}</b>\n\n` +
        `⏱ Davomiyligi: <b>${workout.duration}</b>\n` +
        `🔥 Sarflanadigan energiya: <b>${workout.calories}</b>\n\n` +
        `📝 <i>${workout.description}</i>\n\n` +
        `📋 <b>Mashqlar tartibi:</b>\n\n${exList}\n\n` +
        `💡 <i>Pastdagi tugmalar orqali har bir mashqning qanday qilinishini rasmlar bilan, yosh bolaga ham tushunarli uslubda o'rganishingiz mumkin:</i>\n\n` +
        `${workout.tip}`
      );

      await api.editMessageText({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        reply_markup: workoutDoneInline(key, workout.exercises || [])
      });
      await api.answerCallbackQuery({ callback_query_id: queryId });
      return;
    }
  }

  if (data === 'wo_back') {
    const text = (
      "🏃 <b>To'liq Fitnes va Mashqlar Bo'limi</b>\n\n" +
      "Kerakli mashg'ulotni tanlang: 👇"
    );
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: workoutsInline()
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  if (data.startsWith('done_wo_') || data.startsWith('done_')) {
    const key = data.replace('done_wo_', '').replace('done_', '');
    if (key !== 'plank_timer' && !key.startsWith('plank_timer_') && key !== 'tabata' && key !== 'vacuum' && !key.startsWith('fit_level_')) {
      await db.insert(workoutLogs).values({
        tgId: fromUser.id,
        workoutType: key,
        logDate: today
      }).run();

      if (user) {
        await db.update(users).set({ xp: user.xp + 20 }).where(eq(users.tgId, fromUser.id)).run();
      }

      await api.editMessageText({
        chat_id: chatId,
        message_id: messageId,
        text: (
          `🎉 <b>Barakalla! Mashg'ulot muvaffaqiyatli yakunlandi! (+20 XP)</b> 🔥\n\n` +
          `Bugungi quvvatingiz ajoyib bo'ldi. Har kuni davom ettirsangiz, orzu qilgan qomatingizga tez erishasiz!`
        ),
        parse_mode: 'HTML',
        reply_markup: workoutsInline()
      });
      await api.answerCallbackQuery({ callback_query_id: queryId, text: "+20 XP qo'shildi!" });
      return;
    }
  }

  // FITNES TAYYORGARLIK TESTI
  if (data === 'fitness_level_test') {
    const testText = (
      `⚡ <b>Tezkor Jismoniy Tayyorgarlik Testi:</b>\n\n` +
      `Sizning hozirgi sport formangizni aniqlash uchun oddiy sinov:\n` +
      `<b>1 daqiqada to'xtamasdan nechta o'tirib-tura olasiz (Squats)?</b>`
    );
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: testText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔴 15 tagacha (Boshlovchi)", callback_data: "fit_level_beg" }],
          [{ text: "🟡 16-30 ta (O'rta daraja)", callback_data: "fit_level_mid" }],
          [{ text: "🟢 30 tadan ortiq (Sportchi)", callback_data: "fit_level_pro" }],
          [{ text: "◀️ Orqaga", callback_data: "wo_back" }]
        ]
      }
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  if (data.startsWith('fit_level_')) {
    const lvl = data.replace('fit_level_', '');
    let res = "";
    if (lvl === 'beg') {
      res = "🥉 <b>Boshlovchi daraja:</b> Tanangiz ko'nikishi uchun har kuni ertalab 10 daqiqalik yengil mashqlar va 6 000 qadamdan boshlang.";
    } else if (lvl === 'mid') {
      res = "🥈 <b>O'rta daraja:</b> Quvvatingiz yaxshi! HIIT kardio va qorin pressi mashqlariga urg'u bering.";
    } else {
      res = "🥇 <b>Yuqori sport darajasi:</b> Ajoyib natija! Tabata va intensiv yog' eritish mashg'ulotlarida maksimal natija ko'rsata olasiz.";
    }

    if (user) {
      await db.update(users).set({ xp: user.xp + 25 }).where(eq(users.tgId, fromUser.id)).run();
    }

    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: `✅ <b>Test Natijangiz (+25 XP):</b>\n\n${res}\n\n<i>Mashqlarni muntazam bajarsangiz, chidamliligingiz 2 barobar ortadi!</i>`,
      parse_mode: 'HTML',
      reply_markup: workoutsInline()
    });
    await api.answerCallbackQuery({ callback_query_id: queryId, text: "+25 XP berildi!" });
    return;
  }

  // 3. SUV HISOBI VA ESLATMALAR
  if (data.startsWith('water_add_')) {
    const amount = parseInt(data.replace('water_add_', ''), 10);

    await db.insert(waterLogs).values({
      tgId: fromUser.id,
      amountMl: amount,
      logDate: today
    }).run();

    if (user) {
      await db.update(users).set({ xp: user.xp + 5 }).where(eq(users.tgId, fromUser.id)).run();
    }

    const rows = await db.select().from(waterLogs).where(eq(waterLogs.tgId, fromUser.id)).all();
    const todayTotal = rows.filter(r => r.logDate === today).reduce((sum, r) => sum + r.amountMl, 0);
    const goal = user?.waterGoalMl || 2000;
    const percent = Math.min(100, Math.round((todayTotal / goal) * 100));

    const filledCount = Math.floor(percent / 10);
    const progressBar = "💧".repeat(filledCount) + "⚪".repeat(10 - filledCount);

    const text = (
      `✅ <b>+${amount} ml suv qo'shildi! (+5 XP)</b>\n\n` +
      `Bugungi jami: <b>${todayTotal} ml</b> / <b>${goal} ml</b> (${percent}%)\n` +
      `<code>${progressBar}</code>\n\n` +
      "Yana suv ichganingizda bosing: 👇"
    );

    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: waterInline()
    });
    await api.answerCallbackQuery({ callback_query_id: queryId, text: `+${amount} ml saqlandi!` });
    return;
  }

  if (data === 'water_schedule_info') {
    const schText = (
      `⏰ <b>Kunlik Ideal Suv Ichish Jadvali:</b>\n\n` +
      `🌅 <b>07:00 (Uyg'onganda):</b> 1-2 stakan iliq suv (Oshqozon va metabolizmni ishga tushiradi)\n` +
      `☀️ <b>10:30 (Oraliqda):</b> 1 stakan suv (Hujayralarni to'yintiradi)\n` +
      `🍽 <b>12:40 (Tushlikdan 20 daqiqa oldin):</b> 1 stakan (Ishtahani jilovlaydi)\n` +
      `🌆 <b>16:00 (Poldnik vaqti):</b> 1 stakan suv\n` +
      `🏋️ <b>18:30 (Mashg'ulotda):</b> Qultumlab 1-2 stakan\n` +
      `🌙 <b>21:00 (Uxlashdan oldin):</b> 1 stakan (Tunda tromblar hosil bo'lishini oldini oladi)\n\n` +
      `💡 <i>Esda tuting: ovqatlanish paytida ko'p suv ichish oshqozon shirasini suyultiradi, ovqatdan 20 daqiqa oldin yoki 40 daqiqa keyin ichish eng to'g'risidir!</i>`
    );
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: schText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: "💧 +250 ml suv kiritish", callback_data: "water_add_250" }],
          [{ text: "◀️ Orqaga", callback_data: "water_menu_back" }]
        ]
      }
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  if (data === 'water_menu_back') {
    const rows = await db.select().from(waterLogs).where(eq(waterLogs.tgId, fromUser.id)).all();
    const todayTotal = rows.filter(r => r.logDate === today).reduce((sum, r) => sum + r.amountMl, 0);
    const goal = user?.waterGoalMl || 2000;
    const percent = Math.min(100, Math.round((todayTotal / goal) * 100));
    const filledCount = Math.floor(percent / 10);
    const progressBar = "💧".repeat(filledCount) + "⚪".repeat(10 - filledCount);

    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: `💧 <b>Kunlik Suv Hisobi</b>\n\nBugungi natija: <b>${todayTotal} ml</b> / <b>${goal} ml</b> (${percent}%)\n<code>${progressBar}</code>\n\nSuv ichganingizda pastdagi tugmalardan birini bosing: 👇`,
      parse_mode: 'HTML',
      reply_markup: waterInline()
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  // 4. TAOMNOMA VA KALORIYALAR (BUGLAR TUZATILDI: FOOD_MAP orqali to'g'ri olinadi)
  if (data === 'cal_food_list') {
    const text = (
      "🍽 <b>O'zbek Milliy Taomlari Kaloriyasi:</b>\n\n" +
      "Biror taomni tanlasangiz, uning to'liq BJU tarkibi va qancha kaloriya ekanligini ko'rishingiz mumkin: 👇"
    );
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: foodCategoriesInline()
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  if (data === 'food_search_prompt') {
    await db.update(users).set({ step: 'food_search' }).where(eq(users.tgId, fromUser.id)).run();
    await api.sendMessage({
      chat_id: chatId,
      text: "🔍 <b>Qidirayotgan taomingiz nomini yozib yuboring:</b>\n<i>(Masalan: <code>somsa</code>, <code>osh</code>, <code>tuxum</code>, <code>lavash</code>, <code>olma</code>)</i>",
      parse_mode: 'HTML'
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  if (data.startsWith('food_')) {
    const foodKey = data.replace('food_', '');
    const food = FOOD_MAP[foodKey] || FOOD_DATABASE.find(f => f.id === foodKey);

    if (food) {
      const text = (
        `🍛 <b>${food.name}</b>\n\n` +
        `• Porsiya miqdori: <b>${food.serving}</b>\n` +
        `• Kaloriya: <b>${food.calories} kkal</b>\n` +
        `• Oqsillar: <b>${food.protein}</b> | Yog'lar: <b>${food.fat}</b> | Uglevodlar: <b>${food.carbs}</b>\n\n` +
        `💡 <i>Fitnes maslahati: ${food.note}</i>`
      );

      await api.editMessageText({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: `➕ Ratsionga qo'shish (+${food.calories} kkal)`, callback_data: `cal_eat_${food.id}` }],
            [{ text: "◀️ Orqaga", callback_data: "cal_food_list" }]
          ]
        }
      });
      await api.answerCallbackQuery({ callback_query_id: queryId });
      return;
    }
  }

  if (data.startsWith('cal_eat_')) {
    const foodKey = data.replace('cal_eat_', '');
    const food = FOOD_MAP[foodKey] || FOOD_DATABASE.find(f => f.id === foodKey);

    if (food) {
      await db.insert(calorieLogs).values({
        tgId: fromUser.id,
        foodName: food.name,
        calories: food.calories,
        logDate: today
      }).run();

      if (user) {
        await db.update(users).set({ xp: user.xp + 10 }).where(eq(users.tgId, fromUser.id)).run();
      }

      await api.editMessageText({
        chat_id: chatId,
        message_id: messageId,
        text: `✅ <b>${food.name} (+${food.calories} kkal) bugungi ratsioningizga saqlandi! (+10 XP)</b>`,
        parse_mode: 'HTML',
        reply_markup: caloriesMenuInline()
      });
      await api.answerCallbackQuery({ callback_query_id: queryId, text: "Taom saqlandi!" });
      return;
    }
  }

  if (data === 'cal_add_prompt') {
    await db.update(users).set({ step: 'custom_cal' }).where(eq(users.tgId, fromUser.id)).run();
    await api.sendMessage({
      chat_id: chatId,
      text: "✏️ <b>Yegan taomingizning taxminiy kaloriyasini raqamda yuboring:</b>\n<i>(Masalan: <code>450</code>)</i>",
      parse_mode: 'HTML'
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  if (data === 'cal_today_stats') {
    const rows = await db.select().from(calorieLogs).where(eq(calorieLogs.tgId, fromUser.id)).all();
    const todayRows = rows.filter(r => r.logDate === today);
    const totalCal = todayRows.reduce((sum, r) => sum + r.calories, 0);
    const goal = user?.calorieGoal || 1800;
    const diff = goal - totalCal;

    let itemsList = "Bugun hali taom kiritilmagan.";
    if (todayRows.length > 0) {
      itemsList = todayRows.map((r, i) => `${i + 1}. ${r.foodName} — <b>${r.calories} kkal</b>`).join('\n');
    }

    const text = (
      `📊 <b>Bugungi Kaloriya Tahlili:</b>\n\n` +
      `${itemsList}\n\n` +
      `🔥 <b>Jami iste'mol qilindi:</b> <b>${totalCal} kkal</b>\n` +
      `🎯 <b>Kunlik limit:</b> <b>${goal} kkal</b>\n` +
      `⚖️ <b>Qoldiq:</b> <b>${diff > 0 ? diff : 0} kkal</b>\n\n` +
      (diff >= 0 ? "✅ <i>Siz me'yordasiz! Ozish jarayoni muvaffaqiyatli kechmoqda.</i>" : "⚠️ <i>Limitdan oshib ketdi! Kechki mashqlarga ko'proq e'tibor bering.</i>")
    );

    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: caloriesMenuInline()
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  if (data === 'cal_back') {
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: "🥗 <b>Taomnoma & Kaloriya Bo'limi:</b>",
      parse_mode: 'HTML',
      reply_markup: caloriesMenuInline()
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  if (data === 'diet_menu_show') {
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: "📖 <b>Sog'lom Ozish Taomnomasi Qoidalari:</b>\n\nQuyidagi bo'limlardan birini tanlang: 👇",
      parse_mode: 'HTML',
      reply_markup: dietInline()
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  if (data.startsWith('diet_day_')) {
    const dayNum = parseInt(data.replace('diet_day_', ''), 10) || 1;
    const plan = weeklyDietPlan[dayNum] || weeklyDietPlan[1];
    const textOut = (
      `📋 <b>7 Kunlik Fitnes Ratsioni — ${plan.dayName}</b>\n\n` +
      `🍳 <b>Nonushta:</b> ${plan.breakfast}\n\n` +
      `🍲 <b>Tushlik:</b> ${plan.lunch}\n\n` +
      `🍏 <b>Poldnik:</b> ${plan.snack}\n\n` +
      `🥗 <b>Kechki ovqat:</b> ${plan.dinner}\n\n` +
      `${plan.tip}`
    );
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: textOut,
      parse_mode: 'HTML',
      reply_markup: weeklyDietMenuInline(dayNum)
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  if (data.startsWith('diet_')) {
    const topicKey = data.replace('diet_', '');
    const topic = DIET_TOPICS[topicKey];

    if (topic) {
      let rList = topic.rules.map((r, i) => `<b>${i + 1}.</b> ${r}`).join('\n\n');
      const text = `🥗 <b>${topic.title}</b>\n\n${rList}`;

      await api.editMessageText({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{ text: "◀️ Orqaga", callback_data: "diet_menu_show" }]]
        }
      });
      await api.answerCallbackQuery({ callback_query_id: queryId });
      return;
    }
  }

  // 5. QADAMLAR
  if (data.startsWith('step_add_')) {
    const addSteps = parseInt(data.replace('step_add_', ''), 10);
    const caloriesBurned = Math.round(addSteps * 0.04);
    const distanceKm = (addSteps * 0.00075).toFixed(2);

    await db.insert(stepLogs).values({
      tgId: fromUser.id,
      steps: addSteps,
      caloriesBurned,
      distanceKm: parseFloat(distanceKm),
      logDate: today
    }).run();

    if (user) {
      await db.update(users).set({ xp: user.xp + 15 }).where(eq(users.tgId, fromUser.id)).run();
    }

    const rows = await db.select().from(stepLogs).where(eq(stepLogs.tgId, fromUser.id)).all();
    const todaySteps = rows.filter(r => r.logDate === today).reduce((sum, r) => sum + r.steps, 0);
    const goal = user?.stepsGoal || 10000;
    const percent = Math.min(100, Math.round((todaySteps / goal) * 100));

    const text = (
      `✅ <b>+${addSteps.toLocaleString()} qadam saqlandi! (+15 XP)</b>\n\n` +
      `Bugungi umumiy qadam: <b>${todaySteps.toLocaleString()}</b> / <b>${goal.toLocaleString()}</b> (${percent}%)\n` +
      `🔥 Sarflangan energiya: ~<b>${Math.round(todaySteps * 0.04)} kkal</b>\n\n` +
      "Yana qadam qo'shish uchun: 👇"
    );

    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: stepsInline()
    });
    await api.answerCallbackQuery({ callback_query_id: queryId, text: `+${addSteps} qadam qo'shildi!` });
    return;
  }

  if (data === 'step_prompt') {
    await db.update(users).set({ step: 'step_input' }).where(eq(users.tgId, fromUser.id)).run();
    await api.sendMessage({
      chat_id: chatId,
      text: "👟 <b>Bugun bosgan qadamlaringiz sonini raqamda yuboring:</b>\n<i>(Masalan: <code>8500</code>)</i>",
      parse_mode: 'HTML'
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  // 6. VAZN VA BO'Y PROMPTLARI
  if (data === 'weight_prompt') {
    await db.update(users).set({ step: 'weight_input' }).where(eq(users.tgId, fromUser.id)).run();
    await api.sendMessage({
      chat_id: chatId,
      text: "⚖️ <b>Yangi vazningizni kiriting (kg):</b>\n<i>(Masalan: <code>82.5</code> yoki <code>83</code>)</i>\n\nBot oldingi vazningiz bilan solishtirib, qanchaga o'zgarganini aytadi!",
      parse_mode: 'HTML'
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  if (data === 'height_prompt') {
    await db.update(users).set({ step: 'height_input' }).where(eq(users.tgId, fromUser.id)).run();
    await api.sendMessage({
      chat_id: chatId,
      text: "📏 <b>Yangi bo'yingizni kiriting (sm):</b>\n<i>(Masalan: <code>176</code>)</i>",
      parse_mode: 'HTML'
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  if (data === 'measure_prompt') {
    await db.update(users).set({ step: 'measure_waist' }).where(eq(users.tgId, fromUser.id)).run();
    await api.sendMessage({
      chat_id: chatId,
      text: "📐 <b>Bel aylanmangizni santimetrda kiriting:</b>\n<i>(Masalan: <code>82</code>)</i>",
      parse_mode: 'HTML'
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  if (data === 'measure_history') {
    const wLogs = await db.select().from(weightLogs).where(eq(weightLogs.tgId, fromUser.id)).all();
    const mLogs = await db.select().from(measurementLogs).where(eq(measurementLogs.tgId, fromUser.id)).all();

    let histText = "📋 <b>O'zgarishlar Tarixi:</b>\n\n<b>⚖️ Vazn o'zgarishlari:</b>\n";
    if (wLogs.length > 0) {
      histText += wLogs.slice(-6).map(w => `• ${w.logDate}: <b>${w.weight} kg</b>`).join('\n');
    } else {
      histText += "Vazn o'lchovlari yo'q.\n";
    }

    histText += "\n\n<b>📏 Tana o'lchovlari (Bel / Bo'y):</b>\n";
    if (mLogs.length > 0) {
      histText += mLogs.slice(-6).map(m => {
        let parts = [];
        if (m.waist > 0) parts.push(`Bel: ${m.waist} sm`);
        if (m.height > 0) parts.push(`Bo'y: ${m.height} sm`);
        return `• ${m.logDate}: <b>${parts.join(', ')}</b>`;
      }).join('\n');
    } else {
      histText += "O'lchovlar yo'q.";
    }

    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: histText,
      parse_mode: 'HTML',
      reply_markup: reminderMeasureInline("Yangi")
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  // 7. STATISTIKA VA GRAFIK
  if (data === 'stat_bot_global') {
    const text = await generateGlobalStatsText(db, today);
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: statsOwnerChoiceInline()
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  if (data === 'stat_personal' || data === 'stat_personal_refresh') {
    const text = await generatePersonalStatsText(user, db, today);
    const markup = (user?.role === 'owner') ? statsOwnerChoiceInline() : personalStatsInline();
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: markup
    });
    await api.answerCallbackQuery({ callback_query_id: queryId, text: "Statistika yangilandi! 📊" });
    return;
  }

  if (data === 'stat_weight_chart') {
    const wLogs = await db.select().from(weightLogs).where(eq(weightLogs.tgId, fromUser.id)).all();
    const chartText = generateWeightChart(wLogs, user?.targetWeight || 0);
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: chartText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: "⚖️ Yangi vazn kiritish", callback_data: "weight_prompt" }],
          [{ text: "◀️ Statistika menyusi", callback_data: "stat_personal" }]
        ]
      }
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  // MOTIVATSIYA YANGILASH
  if (data === 'motivation_refresh') {
    const mText = getRandomMotivation();
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: mText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔄 Boshqa motivatsiya", callback_data: "motivation_refresh" }]
        ]
      }
    });
    await api.answerCallbackQuery({ callback_query_id: queryId, text: "Yangi motivatsiya! 🔥" });
    return;
  }

  // 8. KALORIYA YOQISH CALLBACKLARI
  if (data.startsWith('burn_')) {
    const burnMap = {
      burn_osh: { title: "1 porsiya Osh (Palov)", cal: 650 },
      burn_somsa: { title: "1 dona Go'shtli Somsa", cal: 320 },
      burn_chocolate: { title: "1 ta Shokolad / Snickers", cal: 250 },
      burn_soda: { title: "0.5 litr Gazli ichimlik (Kola)", cal: 210 },
      burn_burger: { title: "1 dona Fastfud burger", cal: 550 },
      burn_manti: { title: "4 dona Go'shtli Manti", cal: 640 },
    };

    if (data === 'burn_custom_prompt') {
      await db.update(users).set({ step: 'burn_custom_prompt' }).where(eq(users.tgId, fromUser.id)).run();
      await api.sendMessage({
        chat_id: chatId,
        text: "✏️ <b>Yoqmoqchi bo'lgan kaloriya miqdoringizni yuboring:</b>\n<i>(Masalan: <code>450</code> yoki <code>700</code>)</i>",
        parse_mode: 'HTML'
      });
      await api.answerCallbackQuery({ callback_query_id: queryId });
      return;
    }

    const item = burnMap[data];
    if (item) {
      const burnPlanText = calculateBurnPlan(item.cal, item.title);
      await api.editMessageText({
        chat_id: chatId,
        message_id: messageId,
        text: burnPlanText,
        parse_mode: 'HTML',
        reply_markup: burnCalorieInline()
      });
      await api.answerCallbackQuery({ callback_query_id: queryId });
      return;
    }
  }

  // IDEAL VAZN KALKULYATORI CALLBACK
  if (data === 'calc_ideal_weight') {
    const h = user?.height || 170;
    const w = user?.currentWeight || 70;
    const isMale = (user?.gender || 'erkak').toLowerCase().includes('erkak');
    const idealW = isMale ? Math.round((h - 100) * 0.9) : Math.round((h - 100) * 0.85);
    const minHealthy = Math.round(18.5 * Math.pow(h / 100, 2));
    const maxHealthy = Math.round(24.9 * Math.pow(h / 100, 2));
    const diff = parseFloat((w - idealW).toFixed(1));
    const { bmi, status } = calculateBmi(w, h);

    let analysisBadge = "";
    if (diff > 0) {
      analysisBadge = `⚠️ Ideal vaznga tushish uchun <b>${diff} kg</b> vazn yo'qotish tavsiya etiladi.`;
    } else if (diff < 0) {
      analysisBadge = `ℹ️ Ideal vaznga chiqish uchun <b>${Math.abs(diff)} kg</b> vazn olish tavsiya etiladi.`;
    } else {
      analysisBadge = `🎯 <b>Tabriklaymiz! Siz aynan o'zingizning ideal vazningizdasiz!</b>`;
    }

    const report = (
      `⚖️ <b>SHAXSIY IDEAL VAZN TAHLILI</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 Jinsingiz: <b>${user?.gender || 'Erkak'}</b>\n` +
      `📏 Bo'yingiz: <b>${h} sm</b> | Hozirgi vazn: <b>${w} kg</b>\n\n` +
      `🎯 <b>Siz uchun eng mukammal ideal vazn:</b> <b>${idealW} kg</b>\n` +
      `🟢 <b>Sog'lom vazn oralig'i:</b> <b>${minHealthy} kg — ${maxHealthy} kg</b>\n` +
      `📊 <b>Tana massasi indeksi (BMI):</b> <b>${bmi}</b> (${status})\n\n` +
      `${analysisBadge}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `💡 <i>Bu ko'rsatkich Jahon Sog'liqni Saqlash Tashkiloti (JSST) va Broca formulasi bo'yicha aniqlangan.</i>`
    );

    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: report,
      parse_mode: 'HTML',
      reply_markup: idealWeightInline()
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  // TAOMLAR VA MASHQ MUTANOSIBLIGI
  if (data === 'cal_burn_guide') {
    const guideText = (
      `🔥 <b>Mashhur Taomlar va Ularni Yoqish Formulasi:</b>\n\n` +
      `🥟 <b>1 ta Somsa (320 kkal):</b>\n` +
      `• 🚶‍♂️ 45 daqiqa tez yurish YOKI\n` +
      `• 🏃‍♂️ 25 daqiqa yugurish YOKI\n` +
      `• 🦵 300 ta o'tirib-turish (Squats)\n\n` +
      `🍚 <b>1 porsiya Osh (650 kkal):</b>\n` +
      `• 🚶‍♂️ 1.5 soat faol yurish YOKI\n` +
      `• 🚴‍♂️ 50 daqiqa velosiped haydash YOKI\n` +
      `• 🧗 40 daqiqa HIIT mashg'ulot\n\n` +
      `🍫 <b>1 ta Shokolad / Snickers (250 kkal):</b>\n` +
      `• 🚶‍♂️ 35 daqiqa yurish YOKI\n` +
      `• 🧱 5 daqiqa plank (oraliqlar bilan)\n\n` +
      `🥤 <b>0.5L Gazli shirin ichimlik (210 kkal):</b>\n` +
      `• 🚶‍♂️ 30 daqiqa tez qadam\n\n` +
      `💡 <i>Xulosa: 5 daqiqada yeb qo'yilgan ortiqcha shirinlikni yoqish uchun kamida 40 daqiqa ter to'kish kerak!</i>`
    );
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: guideText,
      parse_mode: 'HTML',
      reply_markup: idealWeightInline()
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  // REFERRAL HAVOLA NUSXALASH
  if (data === 'copy_ref_link') {
    const botUser = 'fitnesuzb_bot';
    const link = `https://t.me/${botUser}?start=ref_${fromUser.id}`;
    await api.answerCallbackQuery({
      callback_query_id: queryId,
      text: `Havolangiz:\n${link}\nDo'stlaringizga yuboring!`,
      show_alert: true
    });
    return;
  }

  // 9. FITNES TAYMER VA PLANK
  if (data.startsWith('timer_run_')) {
    const sec = parseInt(data.replace('timer_run_', ''), 10);
    const xpBonus = Math.round(sec / 2);
    const textOut = (
      `⏱️ <b>${sec} SONIYALIK PLANK TAYMERI BOSHLANDI!</b> 🔥\n\n` +
      `📌 <b>Ko'rsatmalar:</b>\n` +
      `1️⃣ Tirsaklarga tayanib yoting, belni aslo bukmang.\n` +
      `2️⃣ Qorin muskullarini qattiq ichkariga torting.\n` +
      `3️⃣ Nafasni erkin va bir maromda oling.\n\n` +
      `⏳ <b>Tayyor bo'lsangiz boshlang! Vaqt tugagach pastdagi tugmani bosing:</b>`
    );

    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: textOut,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: `✅ ${sec}s bajardim (+${xpBonus} XP)`, callback_data: `done_plank_timer_${sec}` }],
          [{ text: "◀️ Taymerlar menyusi", callback_data: "timer_menu_back" }]
        ]
      }
    });
    await api.answerCallbackQuery({ callback_query_id: queryId, text: `${sec} soniyalik Plank boshlandi!` });
    return;
  }

  if (data.startsWith('done_plank_timer_')) {
    const sec = parseInt(data.replace('done_plank_timer_', ''), 10);
    const xpBonus = Math.round(sec / 2);
    await db.update(users).set({ xp: (user?.xp || 0) + xpBonus }).where(eq(users.tgId, fromUser.id)).run();
    await db.insert(workoutLogs).values({
      tgId: fromUser.id,
      workoutType: `Plank ${sec}s`,
      logDate: today
    }).run();

    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: `🎉 <b>Qoyilmaqom natija! ${sec} soniyalik Plank yakunlandi (+${xpBonus} XP)</b>\n\nQorin muskullaringiz toshdek qotmoqda va faol yog' yoqilmoqda! 🔥`,
      parse_mode: 'HTML',
      reply_markup: fitnessTimerInline()
    });
    await api.answerCallbackQuery({ callback_query_id: queryId, text: `+${xpBonus} XP berildi!` });
    return;
  }

  if (data === 'timer_tabata_info') {
    const tabataText = (
      `🔥 <b>4 Daqiqalik Tabata Protokoli (Ekstremal Yog' Yoqish)</b>\n\n` +
      `Tabata — 4 daqiqa ichida 1 soatlik yugurishdan ko'proq yog' yoqadigan jahon darajasidagi uslubdir!\n\n` +
      `📋 <b>Qoida:</b>\n` +
      `• 20 soniya maksimal tezlikda mashq (sakrab o'tirib-turish yoki joyida baland yugurish)\n` +
      `• 10 soniya dam olish\n` +
      `• Jami: <b>8 ta raund (4 daqiqa)</b>\n\n` +
      `💡 <i>Bu uslub mashg'ulot tugaganidan keyin ham 24 soat davomida organizmni yog' yoqish rejimida ushlab turadi!</i>`
    );
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: tabataText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: "✅ Tabata bajardim (+30 XP)", callback_data: "done_tabata" }],
          [{ text: "◀️ Orqaga", callback_data: "timer_menu_back" }]
        ]
      }
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  if (data === 'done_tabata') {
    await db.update(users).set({ xp: (user?.xp || 0) + 30 }).where(eq(users.tgId, fromUser.id)).run();
    await db.insert(workoutLogs).values({
      tgId: fromUser.id,
      workoutType: "Tabata 4 daq",
      logDate: today
    }).run();

    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: "🏆 <b>Tabata mashg'uloti muvaffaqiyatli yakunlandi! (+30 XP)</b>\n\nSiz haqiqiy temir iroda egasisiz! Bugungi quvvat sarfi a'lo darajada bo'ldi! ⚡",
      parse_mode: 'HTML',
      reply_markup: fitnessTimerInline()
    });
    await api.answerCallbackQuery({ callback_query_id: queryId, text: "+30 XP berildi!" });
    return;
  }

  if (data === 'timer_vacuum_info') {
    const vacText = (
      `🧘 <b>Oshqozon Vakuumi (Qorinni Ingichka Qilish Mashqi)</b>\n\n` +
      `Arnold Shvartsenegger va eng yaxshi fitnes modellarining sevimli uslubi!\n\n` +
      `📋 <b>Qanday bajariladi?</b>\n` +
      `1️⃣ Ertalab och qoringa, tik turib yoki biroz egilib turing.\n` +
      `2️⃣ O'pkadagi butun havoni og'izdan to'liq chiqarib yuboring.\n` +
      `3️⃣ Nafas olmasdan, qorinni qovurg'alar ostiga (umurtqa sari) maksimal torting.\n` +
      `4️⃣ Shu holatda <b>15-20 soniya</b> ushlab turing.\n` +
      `5️⃣ Nafasni sekin bo'shating. Buni 4-5 marta takrorlang.\n\n` +
      `💡 <i>Bu mashq ichki ko'ndalang muskullarni tortadi va hatto ozmasdan ham belni 3-5 sm ingichka qilib ko'rsatadi!</i>`
    );
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: vacText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: "✅ Vakuum bajardim (+20 XP)", callback_data: "done_vacuum" }],
          [{ text: "◀️ Orqaga", callback_data: "timer_menu_back" }]
        ]
      }
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  if (data === 'done_vacuum') {
    await db.update(users).set({ xp: (user?.xp || 0) + 20 }).where(eq(users.tgId, fromUser.id)).run();
    await db.insert(workoutLogs).values({
      tgId: fromUser.id,
      workoutType: "Vakuum mashqi",
      logDate: today
    }).run();

    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: "🌟 <b>Vakuum mashqi bajarildi! (+20 XP)</b>\n\nHar kuni ertalab bajarsangiz, natijasini 1 haftada sezasiz!",
      parse_mode: 'HTML',
      reply_markup: fitnessTimerInline()
    });
    await api.answerCallbackQuery({ callback_query_id: queryId, text: "+20 XP berildi!" });
    return;
  }

  if (data === 'timer_menu_back') {
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: "⏱️ <b>Fitnes va Mashq Taymeri:</b>\n\nKerakli rejim yoki vaqtni tanlang: 👇",
      parse_mode: 'HTML',
      reply_markup: fitnessTimerInline()
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  // 10. LIDERLAR REYTINGI
  if (data === 'leaderboard_refresh') {
    const lbText = await generateLeaderboardText(db, fromUser.id);
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: lbText,
      parse_mode: 'HTML',
      reply_markup: leaderboardInline()
    });
    await api.answerCallbackQuery({ callback_query_id: queryId, text: "Reyting yangilandi! 🏆" });
    return;
  }

  // 11. 21 KUNLIK MARAFON
  if (data.startsWith('challenge_done_')) {
    const day = parseInt(data.replace('challenge_done_', ''), 10);

    await db.insert(challengeLogs).values({
      tgId: fromUser.id,
      dayNumber: day,
      logDate: today
    }).run();

    if (user) {
      await db.update(users).set({ xp: user.xp + 50 }).where(eq(users.tgId, fromUser.id)).run();
    }

    const congrats = (
      `🎉 <b>${day}-KUN TOPSHIRIG'I MUVAFFAQIYATLI BAJARILDI! (+50 XP)</b> 🏆🔥\n\n` +
      `Siz bugun o'z maqsadingiz sari ulkan qadam tashladingiz. Har kuni kichik odatlar katta o'zgarishlarga olib keladi!\n\n` +
      `Ertaga yangi vazifa ochiladi.`
    );

    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: congrats,
      parse_mode: 'HTML'
    });
    await api.answerCallbackQuery({ callback_query_id: queryId, text: "+50 XP qo'shildi!" });
    return;
  }

  if (data === 'challenge_already') {
    await api.answerCallbackQuery({ callback_query_id: queryId, text: "Bugungi topshiriq allaqachon bajarilgan! Ertaga yangisi ochiladi.", show_alert: true });
    return;
  }

  if (data === 'challenge_all') {
    const list = CHALLENGE_DAYS.slice(0, 10).map(c => `• <b>${c.day}-kun:</b> ${c.title}`).join('\n');
    const text = (
      `📋 <b>21 Kunlik Rejaning Birinchi Qismi:</b>\n\n${list}\n\n` +
      `<i>Har kuni yangi topshiriqni bot sizga bosqichma-bosqich taqdim etadi.</i>`
    );
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML'
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  // 12. DETOKS ICHIMLIKLAR
  if (data.startsWith('drink_')) {
    const drinkKey = data.replace('drink_', '');
    const drink = DETOX_DRINKS[drinkKey];

    if (drink) {
      let ingList = drink.ingredients.map((ing, i) => `<b>${i + 1}.</b> ${ing}`).join('\n');
      const text = (
        `🍹 <b>${drink.name}</b>\n\n` +
        `⏱ Tayyorlash vaqti: <b>${drink.time}</b>\n` +
        `🎯 Foydasi: <b>${drink.benefit}</b>\n\n` +
        `🧂 <b>Kerakli mahsulotlar:</b>\n${ingList}\n\n` +
        `🥣 <b>Tayyorlash usuli:</b>\n${drink.prep}\n\n` +
        `💡 <i>Iste'mol tartibi: ${drink.howToDrink}</i>`
      );

      await api.editMessageText({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{ text: "◀️ Boshqa ichimliklar", callback_data: "drinks_menu" }]]
        }
      });
      await api.answerCallbackQuery({ callback_query_id: queryId });
      return;
    }
  }

  if (data === 'drinks_menu') {
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: "🍹 <b>Yog' Erituvchi va Detoks Ichimliklar Retseptlari:</b>\n\nTanlang: 👇",
      parse_mode: 'HTML',
      reply_markup: detoxInline()
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  // 13. OWNER TESTLAR VA BOSHQARUV
  if (data === 'owner_test_05') {
    const text05 = (
      `🌅 <b>[TEST] Soat 05:00 — Ertalabki o'lchanish vaqti!</b>\n\n` +
      `Ertalab och qoringa taroziga chiqish eng aniq natijani ko'rsatadi.\n` +
      `Bugungi vazningiz yoki bo'yingiz o'zgargan bo'lsa, kiriting — bot farqni aniqlab beradi! 👇`
    );
    await api.sendMessage({
      chat_id: chatId,
      text: text05,
      parse_mode: 'HTML',
      reply_markup: reminderMeasureInline("Ertalabki")
    });
    await api.answerCallbackQuery({ callback_query_id: queryId, text: "05:00 eslatmasi sinov tariqasida yuborildi!" });
    return;
  }

  if (data === 'owner_test_21') {
    const text21 = (
      `🌙 <b>[TEST] Soat 21:00 — Kechki o'lchanish vaqti!</b>\n\n` +
      `Kun yakunlandi! Bugungi vazningiz, bo'yingiz yoki belingiz o'zgargan bo'lsa, kiriting — bot farqni aniqlab beradi! 👇`
    );
    await api.sendMessage({
      chat_id: chatId,
      text: text21,
      parse_mode: 'HTML',
      reply_markup: reminderMeasureInline("Kechki")
    });
    await api.answerCallbackQuery({ callback_query_id: queryId, text: "21:00 eslatmasi sinov tariqasida yuborildi!" });
    return;
  }

  if (data === 'owner_test_all') {
    const allUsers = await db.select().from(users).all();
    let sent = 0;
    for (const u of allUsers) {
      try {
        await api.sendMessage({
          chat_id: u.tgId,
          text: `🔔 <b>FitnesBot Eslatma Tizimi Sinovi:</b>\n\nBot har kuni soat 05:00 va 21:00 da sizga vazn o'lchashni eslatib turadi! 🏃`,
          parse_mode: 'HTML',
          reply_markup: reminderMeasureInline("Sinov")
        });
        sent++;
      } catch (e) {}
    }
    await api.answerCallbackQuery({ callback_query_id: queryId, text: `Barchaga (${sent} kishiga) yuborildi!` });
    return;
  }

  if (data === 'owner_reset_confirm') {
    await db.update(users).set({
      height: 0,
      currentWeight: 0,
      startWeight: 0,
      targetWeight: 0,
      step: 'gender'
    }).where(eq(users.tgId, fromUser.id)).run();

    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: "🧪 <b>Profilingiz tozalandi!</b>\n\nEndi botni yangi mijozdek sinab ko'rishingiz mumkin. Jinsingizni tanlang:",
      parse_mode: 'HTML',
      reply_markup: genderInline()
    });
    await api.answerCallbackQuery({ callback_query_id: queryId, text: "Profil reset qilindi!" });
    return;
  }

  if (data === 'owner_reset_cancel') {
    await api.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: "❌ Reset bekor qilindi.",
      parse_mode: 'HTML'
    });
    await api.answerCallbackQuery({ callback_query_id: queryId });
    return;
  }

  // ADMIN BONUS XP
  if (data.startsWith('admin_give_xp_')) {
    const parts = data.replace('admin_give_xp_', '').split('_');
    const targetTgId = parseInt(parts[0], 10);
    const amount = parseInt(parts[1], 10) || 50;

    const targetUser = await db.select().from(users).where(eq(users.tgId, targetTgId)).get();
    if (targetUser) {
      await db.update(users).set({ xp: (targetUser.xp || 0) + amount }).where(eq(users.tgId, targetTgId)).run();
      try {
        await api.sendMessage({
          chat_id: targetTgId,
          text: `🎁 <b>Tabriklaymiz! Administrator (@fayzbek1331) sizga faolligingiz uchun +${amount} XP taqdim etdi!</b> 🌟\n\nJami XP: <b>${(targetUser.xp || 0) + amount} XP</b>`,
          parse_mode: 'HTML'
        });
      } catch (e) {}
      await api.answerCallbackQuery({ callback_query_id: queryId, text: `+${amount} XP muvaffaqiyatli berildi!` });
    }
    return;
  }

  await api.answerCallbackQuery({ callback_query_id: queryId });
}
