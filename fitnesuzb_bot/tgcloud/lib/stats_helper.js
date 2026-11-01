import { eq } from 'sdk/db';
import { users, weightLogs, waterLogs, workoutLogs, stepLogs, calorieLogs, measurementLogs, challengeLogs } from '../schema.js';

export function getTashkentDateStr() {
  const now = new Date();
  const tashkentTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
  return tashkentTime.toISOString().split('T')[0];
}

export async function generateGlobalStatsText(db, today) {
  const allUsers = await db.select().from(users).all();
  const allWater = await db.select().from(waterLogs).all();
  const allSteps = await db.select().from(stepLogs).all();
  const allWorkouts = await db.select().from(workoutLogs).all();
  const allChallenges = await db.select().from(challengeLogs).all();
  const allWeight = await db.select().from(weightLogs).all();

  const totalUsers = allUsers.length;
  const activeToday = allUsers.filter(u => u.lastActiveDate === today).length;
  const menCount = allUsers.filter(u => u.gender === 'erkak').length;
  const womenCount = allUsers.filter(u => u.gender === 'ayol').length;
  const completedOnboarding = allUsers.filter(u => u.height > 0 && u.currentWeight > 0).length;

  const totalWaterLiters = (allWater.reduce((sum, w) => sum + (w.amountMl || 0), 0) / 1000).toFixed(1);
  const totalStepsCount = allSteps.reduce((sum, s) => sum + (s.steps || 0), 0);
  const totalKm = (totalStepsCount * 0.00075).toFixed(1);

  // Barcha foydalanuvchilar birgalikda tashlagan jami vazn
  const totalKgLost = allUsers.reduce((sum, u) => {
    if (u.startWeight > 0 && u.currentWeight > 0) {
      const lost = u.startWeight - u.currentWeight;
      return sum + (lost > 0 ? lost : 0);
    }
    return sum;
  }, 0).toFixed(1);

  return (
    `📊 <b>FitnesBot Asosiy Statistikasi (Owner Dashboard):</b>\n\n` +
    `👥 <b>Foydalanuvchilar Tahlili:</b>\n` +
    `• Jami ro'yxatdan o'tganlar: <b>${totalUsers} ta</b>\n` +
    `• To'liq profili bor faollar: <b>${completedOnboarding} ta</b> (${Math.round((completedOnboarding / (totalUsers || 1)) * 100)}%)\n` +
    `• Bugun botga kirganlar: <b>${activeToday} ta</b>\n` +
    `• Erkaklar: <b>${menCount} ta</b> | Ayollar: <b>${womenCount} ta</b>\n\n` +
    `🔥 <b>Jamoaviy Natija:</b>\n` +
    `• 🏆 Foydalanuvchilarimiz jami <b>${totalKgLost} kg</b> vazn tashlashdi!\n` +
    `• Bajarilgan mashqlar: <b>${allWorkouts.length} ta</b>\n` +
    `• Ichilgan suv: <b>${totalWaterLiters} litr</b>\n` +
    `• Bosib o'tilgan masofa: <b>${totalStepsCount.toLocaleString()} qadam (~${totalKm} km)</b>\n` +
    `• Yozilgan vazn o'lchovlari: <b>${allWeight.length} marta</b>\n` +
    `• Bajarilgan marafon vazifalari: <b>${allChallenges.length} ta</b>\n\n` +
    `🛡 <b>Tizim & Server Holati:</b>\n` +
    `• Infratuzilma: <b>Telegram Serverless (TGCloud)</b>\n` +
    `• Webhook: <b>100% Faol (24/7 uzluksiz)</b>\n` +
    `• Rejalashtiruvchi (Cron): <b>05:00 & 21:00 faol</b>`
  );
}

export async function generatePersonalStatsText(user, db, today) {
  const tgId = user.tgId;

  const wLogs = await db.select().from(weightLogs).where(eq(weightLogs.tgId, tgId)).all();
  const mLogs = await db.select().from(measurementLogs).where(eq(measurementLogs.tgId, tgId)).all();
  const waterRows = await db.select().from(waterLogs).where(eq(waterLogs.tgId, tgId)).all();
  const stepRows = await db.select().from(stepLogs).where(eq(stepLogs.tgId, tgId)).all();
  const woRows = await db.select().from(workoutLogs).where(eq(workoutLogs.tgId, tgId)).all();
  const calRows = await db.select().from(calorieLogs).where(eq(calorieLogs.tgId, tgId)).all();
  const chRows = await db.select().from(challengeLogs).where(eq(challengeLogs.tgId, tgId)).all();

  const startW = user.startWeight || user.currentWeight || 0;
  const curW = user.currentWeight || 0;
  const targetW = user.targetWeight || 0;
  const weightDiff = (curW - startW).toFixed(1);
  const toGoal = (curW - targetW).toFixed(1);

  // Ideal vazn hisoblash (Broca)
  let idealWeightText = "kiritilmagan";
  if (user.height > 100) {
    const ideal = user.gender === 'ayol'
      ? Math.round((user.height - 100) * 0.85)
      : Math.round((user.height - 100) * 0.90);
    idealWeightText = `~${ideal} kg`;
  }

  let weightTrend = "";
  if (weightDiff < 0) {
    weightTrend = `🔻 <b>${Math.abs(weightDiff)} kg ozdingiz!</b> (Ajoyib natija! 🔥)`;
  } else if (weightDiff > 0) {
    weightTrend = `🔺 <b>+${weightDiff} kg ortgan</b>`;
  } else {
    weightTrend = `➖ O'zgarishsiz (Boshlang'ich vaznda)`;
  }

  const todayWaterMl = waterRows.filter(r => r.logDate === today).reduce((s, r) => s + (r.amountMl || 0), 0);
  const totalWaterLiters = (waterRows.reduce((s, r) => s + (r.amountMl || 0), 0) / 1000).toFixed(1);
  const waterGoal = user.waterGoalMl || 2000;
  const waterPercent = Math.min(100, Math.round((todayWaterMl / waterGoal) * 100));

  const todaySteps = stepRows.filter(r => r.logDate === today).reduce((s, r) => s + (r.steps || 0), 0);
  const totalSteps = stepRows.reduce((s, r) => s + (r.steps || 0), 0);
  const totalKm = (totalSteps * 0.00075).toFixed(1);
  const stepsGoal = user.stepsGoal || 10000;
  const stepsPercent = Math.min(100, Math.round((todaySteps / stepsGoal) * 100));

  const todayCal = calRows.filter(r => r.logDate === today).reduce((s, r) => s + (r.calories || 0), 0);
  const calGoal = user.calorieGoal || 1800;

  const lastMeasure = mLogs.length > 0 ? mLogs[mLogs.length - 1] : null;
  const waistStr = lastMeasure && lastMeasure.waist > 0 ? `${lastMeasure.waist} sm` : "kiritilmagan";

  function makeProgressBar(percent) {
    const filled = Math.min(10, Math.max(0, Math.round(percent / 10)));
    return "█".repeat(filled) + "░".repeat(10 - filled);
  }

  return (
    `📊 <b>${user.name} — Shaxsiy Fitnes Statistikangiz:</b>\n\n` +
    `⚖️ <b>Vazn Natijalari:</b>\n` +
    `• Boshlang'ich: <b>${startW} kg</b> ➔ Hozirgi: <b>${curW} kg</b>\n` +
    `• O'zgarish: ${weightTrend}\n` +
    `• Maqsad: <b>${targetW} kg</b> (Qoldi: <b>${toGoal > 0 ? toGoal : 0} kg</b>)\n` +
    `• Siz uchun tavsiya ideal vazn: <b>${idealWeightText}</b>\n` +
    `• Bel aylanmasi: <b>${waistStr}</b>\n\n` +
    `💧 <b>Suv Balansi:</b>\n` +
    `• Bugun: <b>${todayWaterMl} / ${waterGoal} ml</b> (${waterPercent}%)\n` +
    `  <code>[${makeProgressBar(waterPercent)}]</code>\n` +
    `• Jami ichilgan suv: <b>${totalWaterLiters} litr</b>\n\n` +
    `👟 <b>Qadamlar & Harakat:</b>\n` +
    `• Bugun: <b>${todaySteps.toLocaleString()} / ${stepsGoal.toLocaleString()}</b> (${stepsPercent}%)\n` +
    `  <code>[${makeProgressBar(stepsPercent)}]</code>\n` +
    `• Jami yurilgan: <b>${totalSteps.toLocaleString()} qadam (~${totalKm} km)</b>\n\n` +
    `🍽 <b>Kaloriya Balansi:</b>\n` +
    `• Bugun: <b>${todayCal} / ${calGoal} kkal</b>\n\n` +
    `🏋️ <b>Faollik va Marafon:</b>\n` +
    `• Bajarilgan mashqlar: <b>${woRows.length} ta</b>\n` +
    `• 21 Kunlik Marafon: <b>${chRows.length} / 21 kun</b>\n` +
    `• Faol intizom (Streak): <b>${user.streak} kun 🔥</b>\n` +
    `• Jami to'plangan: <b>${user.xp} XP</b>`
  );
}

export function generateWeightChart(wLogs, targetWeight = 0) {
  if (!wLogs || wLogs.length === 0) {
    return "📈 <b>Vazn Dinamikasi Grafigi:</b>\n\n<i>Hali vazn kiritilmagan. Vazningizni bir necha kun o'lchab kiritsangiz, bu yerda chiroyli grafik aks etadi!</i>";
  }

  const recent = wLogs.slice(-7);
  const weights = recent.map(w => w.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);

  let chartText = "📈 <b>So'nggi O'lchovlar Dinamikasi Grafigi:</b>\n\n<code>";

  recent.forEach((w) => {
    const range = (maxW - minW) || 1;
    const barLen = Math.max(1, Math.round(((w.weight - minW) / range) * 8));
    const bar = "█".repeat(barLen) + "░".repeat(8 - barLen);
    const dateShort = w.logDate.slice(5); // MM-DD
    chartText += `${dateShort} │ ${bar} ${w.weight} kg\n`;
  });

  chartText += "</code>\n";
  const start = recent[0].weight;
  const current = recent[recent.length - 1].weight;
  const change = (current - start).toFixed(1);

  if (change < 0) {
    chartText += `📉 Davr mobaynida: <b>${Math.abs(change)} kg ozdingiz! 🎉</b>\n`;
  } else if (change > 0) {
    chartText += `📈 Davr mobaynida: <b>+${change} kg</b>\n`;
  } else {
    chartText += `⚖️ Barqaror vazn (0.0 kg o'zgarish)\n`;
  }

  if (targetWeight > 0) {
    const qoldi = (current - targetWeight).toFixed(1);
    chartText += `🎯 Maqsadgacha: <b>${qoldi > 0 ? qoldi : 0} kg</b> qoldi.`;
  }

  return chartText;
}

export function calculateBurnPlan(calories, title = "ovqat") {
  const runMin = Math.round(calories / 10);
  const ropeMin = Math.round(calories / 11);
  const walkMin = Math.round(calories / 5);
  const steps = Math.round((calories / 4) * 100);
  const cycleMin = Math.round(calories / 8);

  return (
    `🔥 <b>Kaloriya Yoqish Kalkulyatori</b>\n\n` +
    `Tanlangan: <b>${title} (${calories} kkal)</b>\n\n` +
    `Ushbu kaloriyani to'liq eritish uchun quyidagilardan birini bajarishingiz kerak:\n\n` +
    `🏃 <b>Yugurish:</b> <b>${runMin} daqiqa</b> (o'rtacha sur'atda)\n` +
    `👟 <b>Piyoda yurish:</b> <b>${walkMin} daqiqa</b> (~${steps.toLocaleString()} qadam)\n` +
    `🪢 <b>Arqonda sakrash:</b> <b>${ropeMin} daqiqa</b>\n` +
    `🚴 <b>Velosiped haydash:</b> <b>${cycleMin} daqiqa</b>\n\n` +
    `💡 <i>Esda tuting: eng oson yo'li — ortiqcha taom yemaslik yoki ovqatdan so'ng darhol faol piyoda sayr qilishdir!</i>`
  );
}

export async function generateLeaderboardText(db, currentTgId) {
  const allUsers = await db.select().from(users).all();
  const sorted = allUsers.sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

  let text = `🏆 <b>FitnesBot Liderlar Reytingi (Top-10):</b>\n\n`;

  const top10 = sorted.slice(0, 10);
  top10.forEach((u, i) => {
    const isMe = u.tgId === currentTgId;
    const medal = medals[i] || `${i + 1}.`;
    const tag = isMe ? " <b>(Siz) 👈</b>" : "";
    text += `${medal} <b>${u.name}</b> — <b>${u.xp || 0} XP</b> (🔥 ${u.streak || 0} kun)${tag}\n`;
  });

  const myRank = sorted.findIndex(u => u.tgId === currentTgId) + 1;
  if (myRank > 0) {
    text += `\n👤 <b>Sizning o'rningiz:</b> <b>${myRank}-o'rin</b> (${sorted.find(u => u.tgId === currentTgId)?.xp || 0} XP)`;
  }

  text += `\n\n💡 <i>Har bir mashq (+20 XP), marafon vazifasi (+50 XP) va suv me'yori uchun XP beriladi!</i>`;
  return text;
}

export function getRandomMotivation() {
  const quotes = [
    {
      q: "Qorin zalda emas, oshxonada yo'qoladi! Natijaning 80%i to'g'ri ovqatlanishga bog'liq.",
      author: "Fitnes haqiqati"
    },
    {
      q: "Agar bugun biror narsani o'zgartirmasangiz, 1 oydan keyin bugungi holatingizni orzu qilib qolasiz.",
      author: "Motivatsiya"
    },
    {
      q: "Suv ichish — ochlik hissini 40% ga kamaytiradi. Ovqatdan 20 daqiqa oldin 1 stakan suv iching!",
      author: "Sog'lom odat"
    },
    {
      q: "Charchadingizmi? To'xtamang. Faqat yakunlaganingizdan keyingina dam oling!",
      author: "Chempionlar qoidasi"
    },
    {
      q: "Kechki soat 19:00 dan keyin uglevodlardan voz kechish — tunda 2 barobar ko'proq yog' yoqilishini ta'minlaydi.",
      author: "Biologik fakt"
    },
    {
      q: "Sizning tanangiz — siz yashaydigan yagona uy. Unga eng toza va sifatli narsalarni ravo ko'ring!",
      author: "Hayotiy haqiqat"
    }
  ];

  const item = quotes[Math.floor(Math.random() * quotes.length)];
  return (
    `💡 <b>KUNLIK FITNES MOTIVATSIYASI:</b>\n\n` +
    `<i>«${item.q}»</i>\n\n` +
    `— <b>${item.author}</b>\n\n` +
    `🔥 Bugungi maqsadingiz sari intiling!`
  );
}
