import { api, db } from 'sdk';
import { eq } from 'sdk/db';
import { users, weightLogs, waterLogs, workoutLogs, stepLogs, calorieLogs, measurementLogs, challengeLogs } from '../schema.js';
import {
  mainKeyboard,
  genderInline,
  workoutsInline,
  waterInline,
  caloriesMenuInline,
  foodCategoriesInline,
  stepsInline,
  weightAndMeasureInline,
  profileInline,
  challengeInline,
  detoxInline,
  ownerReminderTestInline,
  ownerResetConfirmInline,
  burnCalorieInline,
  fitnessTimerInline,
  leaderboardInline,
  statsOwnerChoiceInline,
  personalStatsInline,
  weeklyDietMenuInline,
  idealWeightInline,
  achievementsInline,
  shareBotInline
} from '../lib/keyboards.js';
import { CHALLENGE_DAYS } from '../lib/challenge.js';
import { FOOD_DATABASE, FOOD_MAP, searchFood, calculateDailyCalorieNeed } from '../lib/calories_db.js';
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

const OWNER_USERNAME = 'fayzbek1331';
const OWNER_TG_ID = 6707839718;

function calculateBmi(weight, heightCm) {
  if (!heightCm || heightCm <= 0 || !weight || weight <= 0) {
    return { bmi: "0.0", status: "Kiritilmagan" };
  }
  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);
  let status = "Normal va ideal vazn 🌟";
  if (bmi < 18.5) status = "Kam vazn (Vazn yetishmasligi)";
  else if (bmi >= 25.0 && bmi < 30.0) status = "Ortiqcha vazn (Ozish tavsiya etiladi) ⚠️";
  else if (bmi >= 30.0) status = "Semizlik darajasi (Faol ozish zarur) 🚨";
  return { bmi: bmi.toFixed(1), status };
}

function getUserRank(xp = 0) {
  if (xp < 100) return "🥉 Boshlovchi";
  if (xp < 300) return "🥈 Harakatdagi sportchi";
  if (xp < 700) return "🥇 Fitnes ustasi";
  if (xp < 1500) return "🏆 Chempion";
  return "👑 Afsonaviy Sportchi";
}

export default async function (message, ctx) {
  const chatId = message.chat.id;
  const fromUser = message.from;
  const text = (message.text || '').trim();
  const today = getTashkentDateStr();

  // Owner tekshiruvi: Telegram ID (6707839718) yoki @fayzbek1331 username
  const isOwner = (fromUser.id === OWNER_TG_ID || (fromUser.username && fromUser.username.toLowerCase() === OWNER_USERNAME.toLowerCase()));

  // Foydalanuvchini olish yoki yaratish
  let user = await db.select().from(users).where(eq(users.tgId, fromUser.id)).get();

  if (!user) {
    await db.insert(users).values({
      tgId: fromUser.id,
      name: fromUser.first_name || 'Foydalanuvchi',
      username: fromUser.username || null,
      role: isOwner ? 'owner' : 'user',
      activeMode: isOwner ? 'owner' : 'user',
      step: 'idle',
      lastActiveDate: today
    }).run();
    user = await db.select().from(users).where(eq(users.tgId, fromUser.id)).get();
  } else if (isOwner && user.role !== 'owner') {
    await db.update(users).set({ role: 'owner' }).where(eq(users.tgId, fromUser.id)).run();
    user.role = 'owner';
  }

  const activeMode = user.activeMode || 'user';

  // Streak yangilash
  if (user.lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak = (user.lastActiveDate === yesterday) ? (user.streak + 1) : 1;
    await db.update(users).set({ streak: newStreak, lastActiveDate: today }).where(eq(users.tgId, fromUser.id)).run();
    user.streak = newStreak;
  }

  // ===================== OWNER MAXSUS BUYRUQLARI =====================

  // Rejimni Ownerga o'tkazish
  if (text === '/owner' || text === '/admin' || text === '👑 Owner Paneliga O\'tish') {
    if (!isOwner) {
      await api.sendMessage({
        chat_id: chatId,
        text: "❌ <b>Kechirasiz, sizda ushbu bo'limga kirish huquqi yo'q!</b>\nFaqat @fayzbek1331 uchun ruxsat berilgan.",
        parse_mode: 'HTML',
        reply_markup: mainKeyboard(false, 'user')
      });
      return;
    }

    await db.update(users).set({ activeMode: 'owner', step: 'idle' }).where(eq(users.tgId, fromUser.id)).run();

    const ownerText = (
      `👑 <b>Xush kelibsiz, Asosiy Administrator (@${OWNER_USERNAME})!</b>\n\n` +
      `Siz <b>Owner (Boshqaruv) rejimidasiz</b>.\n\n` +
      `Ushbu rejimda siz:\n` +
      `• 📊 Barcha foydalanuvchilar va bot statistikasini ko'rishingiz\n` +
      `• 👥 Foydalanuvchilar ro'yxati va profillarini tekshirishingiz\n` +
      `• 🔍 Istalgan foydalanuvchini ID yoki @username orqali qidirishingiz\n` +
      `• 🎁 Faol foydalanuvchilarga Bonus XP ballari ulashishingiz\n` +
      `• 📢 Barcha foydalanuvchilarga xabar/e'lon tarqatishingiz\n` +
      `• ⏰ 05:00 va 21:00 eslatmalarini sinovdan o'tkazishingiz\n` +
      `• 👤 Shaxsiy fitness ko'rsatkichlaringizni kuzatishingiz\n` +
      `• 🧪 O'z profilingizni tozalab, yangi mijozdek test qilishingiz mumkin!\n\n` +
      `<i>Oddiy foydalanuvchi sifatida test qilish uchun «🔄 Mijoz rejimiga o'tish» tugmasini bosing.</i>`
    );

    await api.sendMessage({
      chat_id: chatId,
      text: ownerText,
      parse_mode: 'HTML',
      reply_markup: mainKeyboard(true, 'owner')
    });
    return;
  }

  // Rejimni Mijozga o'tkazish
  if (isOwner && text === '🔄 Mijoz rejimiga o\'tish') {
    await db.update(users).set({ activeMode: 'user', step: 'idle' }).where(eq(users.tgId, fromUser.id)).run();

    const userModeText = (
      `🔄 <b>Oddiy Mijoz rejimiga o'tdingiz!</b>\n\n` +
      `Endi bot sizga xuddi oddiy foydalanuvchilardek xizmat ko'rsatadi.\n` +
      `Barcha mashqlar, suv hisobi, vazn nazorati, kaloriyalar va menyularni bemalol sinab ko'rishingiz mumkin.\n\n` +
      `<i>Qaytadan Owner panelga qaytish uchun «👑 Owner Paneliga O'tish» tugmasini bosing.</i>`
    );

    await api.sendMessage({
      chat_id: chatId,
      text: userModeText,
      parse_mode: 'HTML',
      reply_markup: mainKeyboard(true, 'user')
    });
    return;
  }

  // ===================== OWNER PANEL FUNKSIYALARI =====================
  if (isOwner && activeMode === 'owner') {

    // 1. FOYDALANUVCHILAR RO'YXATI
    if (text === '👥 Foydalanuvchilar') {
      const allUsers = await db.select().from(users).all();
      const recentUsers = allUsers.slice(-10).reverse();

      let listText = `👥 <b>So'nggi foydalanuvchilar (Jami: ${allUsers.length} ta):</b>\n\n`;
      recentUsers.forEach((u, i) => {
        const usernameStr = u.username ? `@${u.username}` : "yo'q";
        listText += (
          `<b>${i + 1}. ${u.name}</b> (${usernameStr})\n` +
          `   • ID: <code>${u.tgId}</code> | Jins: ${u.gender}\n` +
          `   • Bo'y: ${u.height} sm | Vazn: ${u.currentWeight} kg -> Maqsad: ${u.targetWeight} kg\n` +
          `   • XP: ${u.xp} | Oxirgi faollik: ${u.lastActiveDate || 'noma\'lum'}\n\n`
        );
      });

      await api.sendMessage({
        chat_id: chatId,
        text: listText,
        parse_mode: 'HTML',
        reply_markup: mainKeyboard(true, 'owner')
      });
      return;
    }

    // 2. FOYDALANUVCHINI QIDIRISH
    if (text === '🔍 Foydalanuvchini Qidirish') {
      await db.update(users).set({ step: 'owner_search_user' }).where(eq(users.tgId, fromUser.id)).run();
      await api.sendMessage({
        chat_id: chatId,
        text: "🔍 <b>Qidirmoqchi bo'lgan foydalanuvchining Telegram ID yoki @username'ini kiriting:</b>\n<i>(Masalan: <code>997185613</code> yoki <code>FiruzbekFaybek</code>)</i>\n\n<i>Bekor qilish: <code>/cancel</code></i>",
        parse_mode: 'HTML'
      });
      return;
    }

    // 3. BONUS XP BERISH
    if (text === '🎁 Bonus XP Berish') {
      await db.update(users).set({ step: 'owner_give_xp' }).where(eq(users.tgId, fromUser.id)).run();
      await api.sendMessage({
        chat_id: chatId,
        text: "🎁 <b>XP bermoqchi bo'lgan foydalanuvchi ID va ball miqdorini yuboring:</b>\nFormat: <code>ID MIQDOR</code>\n<i>(Masalan: <code>997185613 100</code>)</i>\n\n<i>Bekor qilish: <code>/cancel</code></i>",
        parse_mode: 'HTML'
      });
      return;
    }

    // 4. BROADCAST (XABAR YUBORISH)
    if (text === '📢 Xabar Yuborish') {
      await db.update(users).set({ step: 'owner_broadcast' }).where(eq(users.tgId, fromUser.id)).run();

      const promptMsg = (
        `📢 <b>Barcha Foydalanuvchilarga Xabar Yuborish</b>\n\n` +
        `Yubormoqchi bo'lgan xabaringiz matnini kiriting.\n` +
        `<i>(Bekor qilish uchun <code>/cancel</code> deb yozing)</i>`
      );

      await api.sendMessage({
        chat_id: chatId,
        text: promptMsg,
        parse_mode: 'HTML'
      });
      return;
    }

    // 5. ESLATMALARNI SINASH
    if (text === '⏰ Eslatmalarni Sinash') {
      const textRem = (
        `⏰ <b>Eslatmalarni Zudlik Bilan Sinash</b>\n\n` +
        `Quyidagi tugmalar orqali soat 05:00 yoki 21:00 eslatmalarini sinab ko'rishingiz mumkin:`
      );

      await api.sendMessage({
        chat_id: chatId,
        text: textRem,
        parse_mode: 'HTML',
        reply_markup: ownerReminderTestInline()
      });
      return;
    }

    // 6. TEST RESET
    if (text === '🧪 Test Reset (Profilni tozalash)') {
      const resetWarn = (
        `⚠️ <b>Haqiqatan ham o'z profilingizni tozalamoqchimisiz?</b>\n\n` +
        `Bu orqali siz botni xuddi yangi o'rnatgan mijozdek eng boshidan (jins, bo'y, vazn kiritishdan) to'liq qayta sinab ko'rishingiz mumkin.`
      );

      await api.sendMessage({
        chat_id: chatId,
        text: resetWarn,
        parse_mode: 'HTML',
        reply_markup: ownerResetConfirmInline()
      });
      return;
    }
  }

  // OWNER MAXSUS BUYRUQLARI: /user, /givexp, /send
  if (isOwner && text.startsWith('/user ')) {
    const q = text.replace('/user ', '').trim().replace('@', '');
    const allU = await db.select().from(users).all();
    const target = allU.find(u => String(u.tgId) === q || (u.username && u.username.toLowerCase() === q.toLowerCase()));

    if (target) {
      const uCard = (
        `👤 <b>Foydalanuvchi Profili:</b>\n\n` +
        `• Ism: <b>${target.name}</b>\n` +
        `• Username: ${target.username ? `@${target.username}` : "yo'q"}\n` +
        `• Telegram ID: <code>${target.tgId}</code>\n` +
        `• Jins: <b>${target.gender}</b> | Bo'y: <b>${target.height} sm</b>\n` +
        `• Boshlang'ich: <b>${target.startWeight} kg</b> ➔ Hozirgi: <b>${target.currentWeight} kg</b>\n` +
        `• Maqsad: <b>${target.targetWeight} kg</b>\n` +
        `• To'plangan XP: <b>${target.xp} XP</b>\n` +
        `• Kunlik zanjir: <b>${target.streak} kun 🔥</b>\n` +
        `• Oxirgi faollik: <b>${target.lastActiveDate || 'noma\'lum'}</b>`
      );
      await api.sendMessage({
        chat_id: chatId,
        text: uCard,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: "🎁 +50 XP berish", callback_data: `admin_give_xp_${target.tgId}_50` }],
            [{ text: "🎁 +100 XP berish", callback_data: `admin_give_xp_${target.tgId}_100` }]
          ]
        }
      });
    } else {
      await api.sendMessage({ chat_id: chatId, text: "❌ Bunday foydalanuvchi topilmadi." });
    }
    return;
  }

  if (isOwner && text.startsWith('/givexp ')) {
    const parts = text.replace('/givexp ', '').trim().split(/\s+/);
    if (parts.length >= 2) {
      const targetId = parseInt(parts[0], 10);
      const amount = parseInt(parts[1], 10);
      const targetUser = await db.select().from(users).where(eq(users.tgId, targetId)).get();
      if (targetUser && !isNaN(amount)) {
        await db.update(users).set({ xp: (targetUser.xp || 0) + amount }).where(eq(users.tgId, targetId)).run();
        try {
          await api.sendMessage({
            chat_id: targetId,
            text: `🎁 <b>Tabriklaymiz! Administrator (@fayzbek1331) sizga +${amount} XP faollik bonusi taqdim etdi!</b> 🌟\n\nJami ballaringiz: <b>${(targetUser.xp || 0) + amount} XP</b>`,
            parse_mode: 'HTML'
          });
        } catch (e) {}
        await api.sendMessage({
          chat_id: chatId,
          text: `✅ <b>${targetUser.name} (ID: ${targetId}) ga +${amount} XP berildi!</b>`,
          parse_mode: 'HTML'
        });
        return;
      }
    }
  }

  if (isOwner && text.startsWith('/send ')) {
    const raw = text.replace('/send ', '').trim();
    const firstSpace = raw.indexOf(' ');
    if (firstSpace > 0) {
      const targetId = parseInt(raw.slice(0, firstSpace).trim(), 10);
      const msgContent = raw.slice(firstSpace).trim();
      try {
        await api.sendMessage({
          chat_id: targetId,
          text: `👑 <b>FitnesBot Administratoridan shaxsiy xabar:</b>\n\n${msgContent}`,
          parse_mode: 'HTML'
        });
        await api.sendMessage({ chat_id: chatId, text: `✅ Xabar ID <code>${targetId}</code> ga yuborildi!` });
      } catch (e) {
        await api.sendMessage({ chat_id: chatId, text: `❌ Xabar yuborishda xatolik: ${e.message}` });
      }
      return;
    }
  }

  // OWNER STEP: QIDIRUV
  if (isOwner && user.step === 'owner_search_user') {
    if (text === '/cancel') {
      await db.update(users).set({ step: 'idle' }).where(eq(users.tgId, fromUser.id)).run();
      await api.sendMessage({ chat_id: chatId, text: "❌ Qidiruv bekor qilindi.", reply_markup: mainKeyboard(true, 'owner') });
      return;
    }

    const q = text.trim().replace('@', '');
    const allU = await db.select().from(users).all();
    const target = allU.find(u => String(u.tgId) === q || (u.username && u.username.toLowerCase() === q.toLowerCase()));

    await db.update(users).set({ step: 'idle' }).where(eq(users.tgId, fromUser.id)).run();

    if (target) {
      const uCard = (
        `👤 <b>Foydalanuvchi Profili:</b>\n\n` +
        `• Ism: <b>${target.name}</b>\n` +
        `• Username: ${target.username ? `@${target.username}` : "yo'q"}\n` +
        `• Telegram ID: <code>${target.tgId}</code>\n` +
        `• Jins: <b>${target.gender}</b> | Bo'y: <b>${target.height} sm</b>\n` +
        `• Boshlang'ich: <b>${target.startWeight} kg</b> ➔ Hozirgi: <b>${target.currentWeight} kg</b>\n` +
        `• Maqsad: <b>${target.targetWeight} kg</b>\n` +
        `• To'plangan XP: <b>${target.xp} XP</b>\n` +
        `• Kunlik zanjir: <b>${target.streak} kun 🔥</b>\n` +
        `• Oxirgi faollik: <b>${target.lastActiveDate || 'noma\'lum'}</b>`
      );
      await api.sendMessage({
        chat_id: chatId,
        text: uCard,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: "🎁 +50 XP berish", callback_data: `admin_give_xp_${target.tgId}_50` }],
            [{ text: "🎁 +100 XP berish", callback_data: `admin_give_xp_${target.tgId}_100` }]
          ]
        }
      });
    } else {
      await api.sendMessage({
        chat_id: chatId,
        text: "❌ Bunday foydalanuvchi topilmadi.",
        reply_markup: mainKeyboard(true, 'owner')
      });
    }
    return;
  }

  // OWNER STEP: BONUS XP
  if (isOwner && user.step === 'owner_give_xp') {
    if (text === '/cancel') {
      await db.update(users).set({ step: 'idle' }).where(eq(users.tgId, fromUser.id)).run();
      await api.sendMessage({ chat_id: chatId, text: "❌ Bekor qilindi.", reply_markup: mainKeyboard(true, 'owner') });
      return;
    }

    const parts = text.trim().split(/\s+/);
    await db.update(users).set({ step: 'idle' }).where(eq(users.tgId, fromUser.id)).run();

    if (parts.length >= 2) {
      const targetId = parseInt(parts[0], 10);
      const amount = parseInt(parts[1], 10);
      const targetUser = await db.select().from(users).where(eq(users.tgId, targetId)).get();
      if (targetUser && !isNaN(amount)) {
        await db.update(users).set({ xp: (targetUser.xp || 0) + amount }).where(eq(users.tgId, targetId)).run();
        try {
          await api.sendMessage({
            chat_id: targetId,
            text: `🎁 <b>Tabriklaymiz! Administrator (@fayzbek1331) sizga +${amount} XP taqdim etdi!</b> 🌟\n\nJami ballaringiz: <b>${(targetUser.xp || 0) + amount} XP</b>`,
            parse_mode: 'HTML'
          });
        } catch (e) {}
        await api.sendMessage({
          chat_id: chatId,
          text: `✅ <b>${targetUser.name} (ID: ${targetId}) ga +${amount} XP berildi!</b>`,
          parse_mode: 'HTML',
          reply_markup: mainKeyboard(true, 'owner')
        });
        return;
      }
    }
    await api.sendMessage({ chat_id: chatId, text: "❌ Noto'g'ri format. Masalan: <code>997185613 50</code>", reply_markup: mainKeyboard(true, 'owner') });
    return;
  }

  // Broadcast matnini qabul qilish
  if (isOwner && user.step === 'owner_broadcast') {
    if (text === '/cancel') {
      await db.update(users).set({ step: 'idle' }).where(eq(users.tgId, fromUser.id)).run();
      await api.sendMessage({
        chat_id: chatId,
        text: "❌ Xabar yuborish bekor qilindi.",
        reply_markup: mainKeyboard(true, 'owner')
      });
      return;
    }

    const allUsers = await db.select().from(users).all();
    let sent = 0;

    for (const u of allUsers) {
      try {
        await api.sendMessage({
          chat_id: u.tgId,
          text: `📢 <b>FitnesBot yangiligi:</b>\n\n${text}`,
          parse_mode: 'HTML'
        });
        sent++;
      } catch (e) {}
    }

    await db.update(users).set({ step: 'idle' }).where(eq(users.tgId, fromUser.id)).run();

    await api.sendMessage({
      chat_id: chatId,
      text: `✅ <b>Xabar muvaffaqiyatli tarqatildi!</b>\nYetkazildi: <b>${sent} ta</b> foydalanuvchiga.`,
      parse_mode: 'HTML',
      reply_markup: mainKeyboard(true, 'owner')
    });
    return;
  }

  // ===================== STATISTIKA BUYRUQLARI =====================
  const isStatsCommand = (
    text === '📊 Natijalarim (Statistika)' ||
    text === '📊 Mening Natijalarim' ||
    text === '📊 Statistika' ||
    text === '📊 Bot Statistikasi' ||
    text === '👤 Shaxsiy Natijalarim' ||
    text.toLowerCase() === 'statistika' ||
    text.toLowerCase() === '/stats' ||
    text.toLowerCase() === '/statistika'
  );

  if (isStatsCommand) {
    if (text === '📊 Bot Statistikasi' && isOwner) {
      const statsMsg = await generateGlobalStatsText(db, today);
      await api.sendMessage({
        chat_id: chatId,
        text: statsMsg,
        parse_mode: 'HTML',
        reply_markup: mainKeyboard(true, activeMode)
      });
      return;
    }

    if (isOwner && activeMode === 'owner') {
      if (text === '👤 Shaxsiy Natijalarim') {
        const myStats = await generatePersonalStatsText(user, db, today);
        await api.sendMessage({
          chat_id: chatId,
          text: myStats,
          parse_mode: 'HTML',
          reply_markup: personalStatsInline()
        });
        return;
      }
      const statsMsg = await generateGlobalStatsText(db, today);
      await api.sendMessage({
        chat_id: chatId,
        text: statsMsg,
        parse_mode: 'HTML',
        reply_markup: mainKeyboard(true, 'owner')
      });
      return;
    }

    if (isOwner) {
      const myStats = await generatePersonalStatsText(user, db, today);
      await api.sendMessage({
        chat_id: chatId,
        text: myStats,
        parse_mode: 'HTML',
        reply_markup: statsOwnerChoiceInline()
      });
      return;
    }

    const myStats = await generatePersonalStatsText(user, db, today);
    await api.sendMessage({
      chat_id: chatId,
      text: myStats,
      parse_mode: 'HTML',
      reply_markup: personalStatsInline()
    });
    return;
  }

  // ===================== ODDIY MIJOZ TIZIMI (/START VA BOSQICHLAR) =====================

  // /start buyrug'i
  if (text.startsWith('/start')) {
    if (text.includes('ref_')) {
      const inviterId = parseInt(text.split('ref_')[1].trim(), 10);
      if (inviterId && inviterId !== fromUser.id) {
        const inviter = await db.select().from(users).where(eq(users.tgId, inviterId)).get();
        if (inviter) {
          await db.update(users).set({ xp: (inviter.xp || 0) + 50 }).where(eq(users.tgId, inviterId)).run();
          try {
            await api.sendMessage({
              chat_id: inviterId,
              text: `🎉 <b>Tabriklaymiz! Do'stingiz (${user.name}) sizning taklifingiz bilan FitnesBot'ga qo'shildi!</b>\nSizga <b>+50 XP Bonus</b> berildi! 🌟`,
              parse_mode: 'HTML'
            });
          } catch (e) {}
        }
      }
    }
    if (user.height > 0 && user.currentWeight > 0) {
      const { bmi, status } = calculateBmi(user.currentWeight, user.height);
      const toLose = (user.currentWeight - user.targetWeight).toFixed(1);
      const loseText = toLose > 0 ? `Tashlanishi kerak: <b>${toLose} kg</b>` : "Siz maqsadingizdasiz! 🎯";
      const rank = getUserRank(user.xp);

      const welcomeBack = (
        `Salom, <b>${user.name}</b>! 👋\n\n` +
        `🏃 <b>FitnesBot — Shaxsiy Ozish va Fitnes Murabbiyingiz!</b>\n\n` +
        `📊 <b>Holatingiz:</b>\n` +
        `• Hozirgi vazn: <b>${user.currentWeight} kg</b> | Bo'y: <b>${user.height} sm</b>\n` +
        `• Maqsad: <b>${user.targetWeight} kg</b> (${loseText})\n` +
        `• Tana vazni indeksi (BMI): <b>${bmi}</b> (${status})\n` +
        `• Darajangiz: <b>${rank}</b> (${user.xp} XP | 🔥 ${user.streak} kunlik zanjir)\n\n` +
        `🔔 <b>Eslatma tartibi:</b>\n` +
        `🌅 <b>05:00 da:</b> Ertalabki vaznni o'lchash eslatmasi\n` +
        `🌙 <b>21:00 da:</b> Kechki vazn va o'lchamlarni tekshirish eslatmasi\n\n` +
        `Barcha bo'limlar pastdagi qulay menyuda tayyor: 👇`
      );
      await api.sendMessage({
        chat_id: chatId,
        text: welcomeBack,
        parse_mode: 'HTML',
        reply_markup: mainKeyboard(isOwner, activeMode)
      });
      return;
    }

    // Yangi profil so'rovnomasi
    await db.update(users).set({ step: 'gender' }).where(eq(users.tgId, fromUser.id)).run();
    const askGender = (
      `Assalomu alaykum, <b>${user.name}</b>! 👋\n\n` +
      `🏃 <b>FitnesBot</b>ga xush kelibsiz!\n\n` +
      `Bu bot sizga har kuni ertalab soat 05:00 da va kechqurun soat 21:00 da o'lchanishni eslatib turadi, ` +
      `vazningiz yoki bo'yingiz o'zgarganda qanchaga o'zgarganini hisoblab beradi!\n\n` +
      `Sizga mos reja tuzishimiz uchun jinsingizni tanlang:`
    );
    await api.sendMessage({
      chat_id: chatId,
      text: askGender,
      parse_mode: 'HTML',
      reply_markup: genderInline()
    });
    return;
  }

  // Onboarding bosqichlari
  if (user.step === 'height') {
    const height = parseFloat(text.replace(',', '.'));
    if (isNaN(height) || height < 100 || height > 240) {
      await api.sendMessage({
        chat_id: chatId,
        text: "❌ Iltimos, bo'yingizni to'g'ri kiriting (masalan: <code>175</code>):",
        parse_mode: 'HTML'
      });
      return;
    }

    await db.update(users).set({ height, step: 'weight' }).where(eq(users.tgId, fromUser.id)).run();
    await api.sendMessage({
      chat_id: chatId,
      text: "⚖️ <b>Hozirgi vazningiz necha kg?</b>\n<i>(Masalan: <code>85</code> yoki <code>85.5</code>)</i>",
      parse_mode: 'HTML'
    });
    return;
  }

  if (user.step === 'weight') {
    const weight = parseFloat(text.replace(',', '.'));
    if (isNaN(weight) || weight < 30 || weight > 250) {
      await api.sendMessage({
        chat_id: chatId,
        text: "❌ Iltimos, vazningizni to'g'ri kiriting (masalan: <code>85</code>):",
        parse_mode: 'HTML'
      });
      return;
    }

    await db.update(users).set({
      startWeight: weight,
      currentWeight: weight,
      step: 'target'
    }).where(eq(users.tgId, fromUser.id)).run();

    await api.sendMessage({
      chat_id: chatId,
      text: "🎯 <b>Qanday vaznga tushmoqchisiz (Maqsadingiz necha kg)?</b>\n<i>(Masalan: <code>70</code>)</i>",
      parse_mode: 'HTML'
    });
    return;
  }

  if (user.step === 'target') {
    const target = parseFloat(text.replace(',', '.'));
    if (isNaN(target) || target < 30 || target > 200) {
      await api.sendMessage({
        chat_id: chatId,
        text: "❌ Iltimos, maqsadli vaznni to'g'ri kiriting (masalan: <code>70</code>):",
        parse_mode: 'HTML'
      });
      return;
    }

    const waterGoal = Math.round(user.currentWeight * 33);
    const { targetCal } = calculateDailyCalorieNeed(user.currentWeight, user.height, user.gender);
    const { bmi, status } = calculateBmi(user.currentWeight, user.height);
    const toLose = (user.currentWeight - target).toFixed(1);

    await db.update(users).set({
      targetWeight: target,
      waterGoalMl: waterGoal,
      calorieGoal: targetCal,
      xp: 50,
      step: 'idle'
    }).where(eq(users.tgId, fromUser.id)).run();

    await db.insert(weightLogs).values({
      tgId: fromUser.id,
      weight: user.currentWeight,
      logDate: today
    }).run();

    const summary = (
      `🎉 <b>Profilingiz muvaffaqiyatli yaratildi! (+50 XP)</b>\n\n` +
      `📊 <b>Shaxsiy tahlilingiz:</b>\n` +
      `• Bo'y: <b>${user.height} sm</b> | Vazn: <b>${user.currentWeight} kg</b>\n` +
      `• Maqsad: <b>${target} kg</b> (Tashlanishi kerak: <b>${toLose} kg</b>)\n` +
      `• Tana vazni indeksi (BMI): <b>${bmi}</b> — <i>${status}</i>\n` +
      `🔥 Kunlik kaloriya normangiz: <b>${targetCal} kkal</b>\n` +
      `💧 Kunlik suv me'yori: <b>${waterGoal} ml</b> (~${Math.round(waterGoal / 250)} stakan)\n` +
      `👟 Kunlik qadam maqsadi: <b>10 000 qadam</b>\n\n` +
      `🔔 <b>Har kuni bot sizga o'lchanishni eslatadi:</b>\n` +
      `• <b>Ertalab soat 05:00 da</b> (och qoringa aniq vazn)\n` +
      `• <b>Kechqurun soat 21:00 da</b> (kun yakunidagi tekshiruv)\n\n` +
      `Pastdagi menyudan foydalanib boshqarishingiz mumkin: 👇`
    );

    await api.sendMessage({
      chat_id: chatId,
      text: summary,
      parse_mode: 'HTML',
      reply_markup: mainKeyboard(isOwner, activeMode)
    });
    return;
  }

  // VAZN O'ZGARISHI
  if (user.step === 'weight_input') {
    const newWeight = parseFloat(text.replace(',', '.'));
    if (isNaN(newWeight) || newWeight < 30 || newWeight > 250) {
      await api.sendMessage({
        chat_id: chatId,
        text: "❌ Iltimos, to'g'ri vazn kiriting (masalan: <code>83.5</code>):",
        parse_mode: 'HTML'
      });
      return;
    }

    const prevWeight = user.currentWeight;
    const diff = parseFloat((newWeight - prevWeight).toFixed(1));

    await db.update(users).set({
      currentWeight: newWeight,
      xp: user.xp + 15,
      step: 'idle'
    }).where(eq(users.tgId, fromUser.id)).run();

    await db.insert(weightLogs).values({
      tgId: fromUser.id,
      weight: newWeight,
      logDate: today
    }).run();

    let diffBadge = "";
    if (diff < 0) {
      diffBadge = `📉 <b>${Math.abs(diff)} kg ozdingiz!</b> (🎉 Ajoyib g'alaba!)`;
    } else if (diff > 0) {
      diffBadge = `📈 <b>+${diff} kg ortgan.</b> (⚠️ Suv va kechki ovqatga e'tibor bering!)`;
    } else {
      diffBadge = `⚖️ <b>O'zgarmagan (0.0 kg).</b> (Barqaror holat)`;
    }

    const toTarget = (newWeight - user.targetWeight).toFixed(1);
    const targetText = toTarget > 0 ? `Maqsadga yana <b>${toTarget} kg</b> qoldi.` : "Siz o'z maqsadingizga erishdingiz! 🎯";
    const { bmi, status } = calculateBmi(newWeight, user.height);

    const resultMsg = (
      `✅ <b>Vazningiz muvaffaqiyatli yangilandi! (+15 XP)</b>\n\n` +
      `📊 <b>Vazn O'zgarishi Tahlili:</b>\n` +
      `• Oldingi vazn: <b>${prevWeight} kg</b>\n` +
      `• Yangi vazn: <b>${newWeight} kg</b>\n` +
      `• O'zgarish farqi: ${diffBadge}\n\n` +
      `🎯 <b>Maqsad sari:</b> ${targetText}\n` +
      `📈 <b>Yangi BMI:</b> <b>${bmi}</b> — <i>${status}</i>`
    );

    await api.sendMessage({
      chat_id: chatId,
      text: resultMsg,
      parse_mode: 'HTML',
      reply_markup: mainKeyboard(isOwner, activeMode)
    });
    return;
  }

  // BO'Y O'ZGARISHI
  if (user.step === 'height_input') {
    const newHeight = parseFloat(text.replace(',', '.'));
    if (isNaN(newHeight) || newHeight < 100 || newHeight > 240) {
      await api.sendMessage({
        chat_id: chatId,
        text: "❌ Iltimos, bo'yingizni to'g'ri kiriting (masalan: <code>176</code>):",
        parse_mode: 'HTML'
      });
      return;
    }

    const prevHeight = user.height;
    const diff = parseFloat((newHeight - prevHeight).toFixed(1));

    await db.update(users).set({
      height: newHeight,
      xp: user.xp + 15,
      step: 'idle'
    }).where(eq(users.tgId, fromUser.id)).run();

    await db.insert(measurementLogs).values({
      tgId: fromUser.id,
      height: newHeight,
      logDate: today
    }).run();

    let diffBadge = "";
    if (diff > 0) {
      diffBadge = `📏 <b>+${diff} sm o'sdingiz!</b> 🌟`;
    } else if (diff < 0) {
      diffBadge = `📏 <b>${diff} sm o'zgardi.</b>`;
    } else {
      diffBadge = `📏 <b>O'zgarmagan (0.0 sm).</b>`;
    }

    const { bmi, status } = calculateBmi(user.currentWeight, newHeight);

    const resultMsg = (
      `✅ <b>Bo'yingiz muvaffaqiyatli yangilandi! (+15 XP)</b>\n\n` +
      `📊 <b>Bo'y O'zgarishi Tahlili:</b>\n` +
      `• Oldingi bo'y: <b>${prevHeight} sm</b>\n` +
      `• Yangi bo'y: <b>${newHeight} sm</b>\n` +
      `• O'zgarish farqi: ${diffBadge}\n\n` +
      `📈 <b>Yangi bo'y bo'yicha qayta hisoblangan BMI:</b> <b>${bmi}</b> — <i>${status}</i>`
    );

    await api.sendMessage({
      chat_id: chatId,
      text: resultMsg,
      parse_mode: 'HTML',
      reply_markup: mainKeyboard(isOwner, activeMode)
    });
    return;
  }

  // Bel aylanasi kiritish
  if (user.step === 'measure_waist') {
    const waist = parseFloat(text.replace(',', '.'));
    if (isNaN(waist) || waist < 40 || waist > 200) {
      await api.sendMessage({
        chat_id: chatId,
        text: "❌ Iltimos, bel aylanmasini to'g'ri kiriting (masalan: <code>84</code>):",
        parse_mode: 'HTML'
      });
      return;
    }

    await db.insert(measurementLogs).values({
      tgId: fromUser.id,
      waist,
      logDate: today
    }).run();

    await db.update(users).set({ xp: user.xp + 15, step: 'idle' }).where(eq(users.tgId, fromUser.id)).run();

    await api.sendMessage({
      chat_id: chatId,
      text: `✅ <b>Bel aylanmasi saqlandi: ${waist} sm (+15 XP)</b>\n\n<i>Muntazam o'lchab tursangiz, belingiz qisqarayotganini aniq ko'rasiz!</i>`,
      parse_mode: 'HTML',
      reply_markup: mainKeyboard(isOwner, activeMode)
    });
    return;
  }

  // Qadamlar kiritish
  if (user.step === 'step_input') {
    const steps = parseInt(text.replace(/[^\d]/g, ''), 10);
    if (isNaN(steps) || steps <= 0 || steps > 100000) {
      await api.sendMessage({
        chat_id: chatId,
        text: "❌ Iltimos, to'g'ri qadam sonini kiriting (masalan: <code>7500</code>):",
        parse_mode: 'HTML'
      });
      return;
    }

    const caloriesBurned = Math.round(steps * 0.04);
    const distanceKm = (steps * 0.00075).toFixed(2);

    await db.insert(stepLogs).values({
      tgId: fromUser.id,
      steps,
      caloriesBurned,
      distanceKm: parseFloat(distanceKm),
      logDate: today
    }).run();

    await db.update(users).set({ xp: user.xp + 20, step: 'idle' }).where(eq(users.tgId, fromUser.id)).run();

    await api.sendMessage({
      chat_id: chatId,
      text: (
        `✅ <b>Qadamlar qayd etildi! (+20 XP)</b>\n\n` +
        `👟 Bosilgan qadam: <b>${steps.toLocaleString()} qadam</b>\n` +
        `📏 Masofa: ~<b>${distanceKm} km</b>\n` +
        `🔥 Yoqilgan kaloriya: ~<b>${caloriesBurned} kkal</b>\n\n` +
        `Ajoyib faollik! Shunday davom eting! 🏃`
      ),
      parse_mode: 'HTML',
      reply_markup: mainKeyboard(isOwner, activeMode)
    });
    return;
  }

  // Kaloriya kiritish
  if (user.step === 'custom_cal') {
    const cal = parseInt(text.replace(/[^\d]/g, ''), 10);
    if (isNaN(cal) || cal <= 0 || cal > 5000) {
      await api.sendMessage({
        chat_id: chatId,
        text: "❌ Iltimos, to'g'ri kaloriya miqdorini kiriting (masalan: <code>450</code>):",
        parse_mode: 'HTML'
      });
      return;
    }

    await db.insert(calorieLogs).values({
      tgId: fromUser.id,
      foodName: "Qo'lda kiritilgan taom",
      calories: cal,
      logDate: today
    }).run();

    await db.update(users).set({ xp: user.xp + 10, step: 'idle' }).where(eq(users.tgId, fromUser.id)).run();

    await api.sendMessage({
      chat_id: chatId,
      text: `✅ <b>+${cal} kkal muvaffaqiyatli saqlandi! (+10 XP)</b>`,
      parse_mode: 'HTML',
      reply_markup: mainKeyboard(isOwner, activeMode)
    });
    return;
  }

  // Kaloriya yoqish kalkulyatori
  if (user.step === 'burn_custom_prompt') {
    const cal = parseInt(text.replace(/[^\d]/g, ''), 10);
    if (isNaN(cal) || cal <= 0 || cal > 10000) {
      await api.sendMessage({
        chat_id: chatId,
        text: "❌ Iltimos, to'g'ri kaloriya miqdorini kiriting (masalan: <code>500</code>):",
        parse_mode: 'HTML'
      });
      return;
    }

    await db.update(users).set({ step: 'idle' }).where(eq(users.tgId, fromUser.id)).run();

    const planText = calculateBurnPlan(cal, `${cal} kkal`);
    await api.sendMessage({
      chat_id: chatId,
      text: planText,
      parse_mode: 'HTML',
      reply_markup: burnCalorieInline()
    });
    return;
  }

  // TAOM QIDIRISH
  if (user.step === 'food_search' || text.startsWith('/search ')) {
    const q = text.startsWith('/search ') ? text.replace('/search ', '').trim() : text;
    await db.update(users).set({ step: 'idle' }).where(eq(users.tgId, fromUser.id)).run();

    const results = searchFood(q);
    if (results.length > 0) {
      let cards = `🔍 <b>«${q}» bo'yicha topilgan taomlar:</b>\n\n`;
      const buttons = [];

      results.slice(0, 5).forEach((f) => {
        cards += (
          `🍽 <b>${f.name}</b> (${f.serving})\n` +
          `• Kaloriya: <b>${f.calories} kkal</b>\n` +
          `• Oqsillar: <b>${f.protein}</b> | Yog'lar: <b>${f.fat}</b> | Uglevodlar: <b>${f.carbs}</b>\n` +
          `• <i>${f.note}</i>\n\n`
        );
        buttons.push([{ text: `➕ ${f.name.slice(0, 22)} (+${f.calories} kkal)`, callback_data: `cal_eat_${f.id}` }]);
      });
      buttons.push([{ text: "◀️ Taomnoma menyusi", callback_data: "cal_back" }]);

      await api.sendMessage({
        chat_id: chatId,
        text: cards,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons }
      });
      return;
    } else {
      await api.sendMessage({
        chat_id: chatId,
        text: `🔍 «${q}» bo'yicha bazada aniq taom topilmadi.\nSiz uni taxminiy kaloriya bilan <b>«➕ Yegan ovqatingizni kiritish»</b> orqali kiritishingiz mumkin!`,
        parse_mode: 'HTML',
        reply_markup: caloriesMenuInline()
      });
      return;
    }
  }

  // ===================== MENYU TUGMALARI =====================

  if (text === "🏃 Mashqlar") {
    const workoutsText = (
      "🏃 <b>To'liq Fitnes va Mashqlar Bo'limi</b>\n\n" +
      "🌅 <b>Ertalabki badantarbiya</b> — tetiklik va metabolizm (10 daq)\n" +
      "☀️ <b>Tushlikdagi faollik</b> — qon aylanishi va energiya (10 daq)\n" +
      "🌆 <b>Kechqurungi yog' yoqish</b> — intensiv ozish (20 daq)\n" +
      "🔥 <b>Qorin pressi</b> — qorinni tortish va belni ingichka qilish\n" +
      "🍑 <b>Dumba va son</b> — ayollar uchun go'zal shakl\n" +
      "💪 <b>Ko'krak va qo'l</b> — erkaklar uchun relyef\n" +
      "⚡ <b>Fitnes testi</b> — jismoniy chidamliligingizni tekshirish\n" +
      "⏱ <b>Plank taymeri</b> — butun tanani toshday mustahkamlash\n\n" +
      "<i>Kerakli mashg'ulotni tanlang: 👇</i>"
    );
    await api.sendMessage({
      chat_id: chatId,
      text: workoutsText,
      parse_mode: 'HTML',
      reply_markup: workoutsInline()
    });
    return;
  }

  if (text === "🥗 Taomnoma & Kaloriya") {
    const calRows = await db.select().from(calorieLogs).where(eq(calorieLogs.tgId, fromUser.id)).all();
    const todayCal = calRows.filter(r => r.logDate === today).reduce((sum, r) => sum + r.calories, 0);
    const goal = user.calorieGoal || 1800;
    const diff = goal - todayCal;

    const calMenuText = (
      "🥗 <b>Taomnoma & Kaloriya Hisob-Kitobi</b>\n\n" +
      `🔥 <b>Bugun iste'mol qilindi:</b> <b>${todayCal} kkal</b>\n` +
      `🎯 <b>Kunlik limit:</b> <b>${goal} kkal</b> (Qoldiq: <b>${diff > 0 ? diff : 0} kkal</b>)\n\n` +
      "Quyidagi bo'limlardan foydalaning: 👇"
    );
    await api.sendMessage({
      chat_id: chatId,
      text: calMenuText,
      parse_mode: 'HTML',
      reply_markup: caloriesMenuInline()
    });
    return;
  }

  if (text === "💧 Suv hisobi") {
    const rows = await db.select().from(waterLogs).where(eq(waterLogs.tgId, fromUser.id)).all();
    const todayTotal = rows.filter(r => r.logDate === today).reduce((sum, r) => sum + r.amountMl, 0);
    const goal = user.waterGoalMl || 2000;
    const percent = Math.min(100, Math.round((todayTotal / goal) * 100));

    const filledCount = Math.floor(percent / 10);
    const progressBar = "💧".repeat(filledCount) + "⚪".repeat(10 - filledCount);

    const waterText = (
      "💧 <b>Kunlik Suv Hisobi</b>\n\n" +
      `Bugungi natija: <b>${todayTotal} ml</b> / <b>${goal} ml</b> (${percent}%)\n` +
      `<code>${progressBar}</code>\n\n` +
      "Suv ichganingizda pastdagi tugmalardan birini bosing: 👇"
    );

    await api.sendMessage({
      chat_id: chatId,
      text: waterText,
      parse_mode: 'HTML',
      reply_markup: waterInline()
    });
    return;
  }

  if (text === "👟 Qadamlar nazorati") {
    const rows = await db.select().from(stepLogs).where(eq(stepLogs.tgId, fromUser.id)).all();
    const todaySteps = rows.filter(r => r.logDate === today).reduce((sum, r) => sum + r.steps, 0);
    const goal = user.stepsGoal || 10000;
    const percent = Math.min(100, Math.round((todaySteps / goal) * 100));
    const km = (todaySteps * 0.00075).toFixed(2);
    const cal = Math.round(todaySteps * 0.04);

    const stepsText = (
      "👟 <b>Kunlik Qadamlar Nazorati</b>\n\n" +
      `Bugungi qadamlar: <b>${todaySteps.toLocaleString()}</b> / <b>${goal.toLocaleString()}</b> (${percent}%)\n` +
      `📏 Masofa: ~<b>${km} km</b>\n` +
      `🔥 Sarflangan quvvat: ~<b>${cal} kkal</b>\n\n` +
      "Kun davomida bosib o'tgan qadamlaringizni qo'shing: 👇"
    );

    await api.sendMessage({
      chat_id: chatId,
      text: stepsText,
      parse_mode: 'HTML',
      reply_markup: stepsInline()
    });
    return;
  }

  if (text === "⚖️ Vazn & O'lchamlar") {
    const startW = user.startWeight || user.currentWeight;
    const curW = user.currentWeight;
    const targetW = user.targetWeight;
    const diff = (curW - startW).toFixed(1);

    let progressStr = "";
    if (diff < 0) {
      progressStr = `📉 Boshlang'ichdan buyon: <b>${Math.abs(diff)} kg ozdingiz!</b> 🎉`;
    } else if (diff > 0) {
      progressStr = `📈 Boshlang'ichdan buyon: <b>+${diff} kg</b>`;
    } else {
      progressStr = `⚖️ O'zgarishsiz (Boshlang'ich vaznda)`;
    }

    const { bmi, status } = calculateBmi(curW, user.height);

    const mLogs = await db.select().from(measurementLogs).where(eq(measurementLogs.tgId, fromUser.id)).all();
    const lastWaist = mLogs.length > 0 && mLogs[mLogs.length - 1].waist > 0 ? `${mLogs[mLogs.length - 1].waist} sm` : "kiritilmagan";

    const textOut = (
      "⚖️ <b>Vazn va Tana O'lchamlari Nazorati</b>\n\n" +
      `🏁 <b>Boshlang'ich vazn:</b> ${startW} kg\n` +
      `📍 <b>Hozirgi vazn:</b> <b>${curW} kg</b>\n` +
      `🎯 <b>Maqsad:</b> ${targetW} kg\n` +
      `${progressStr}\n\n` +
      `📏 <b>Bo'y:</b> <b>${user.height} sm</b>\n` +
      `📊 <b>Tana vazni indeksi (BMI):</b> <b>${bmi}</b> (${status})\n` +
      `📐 <b>Oxirgi bel o'lchami:</b> <b>${lastWaist}</b>\n\n` +
      "<i>Vazn yoki bo'yingiz o'zgargan bo'lsa, quyidagi tugmalar orqali kiriting — bot qanchaga o'zgarganini hisoblab beradi: 👇</i>"
    );

    await api.sendMessage({
      chat_id: chatId,
      text: textOut,
      parse_mode: 'HTML',
      reply_markup: weightAndMeasureInline()
    });
    return;
  }

  if (text === "🏆 21 Kunlik Marafon") {
    const challenges = await db.select().from(challengeLogs).where(eq(challengeLogs.tgId, fromUser.id)).all();
    const completedCount = challenges.length;
    const currentDay = Math.min(21, completedCount + 1);
    const isTodayDone = challenges.some(c => c.logDate === today);

    const taskObj = CHALLENGE_DAYS.find(c => c.day === currentDay) || CHALLENGE_DAYS[0];

    const challengeText = (
      `🏆 <b>21 Kunlik Ozish va Odatlar Marafoni</b>\n\n` +
      `🔥 <b>Kunlik intizom:</b> ${completedCount}/21 kun yakunlandi\n` +
      `⚡ <b>Faol zanjir:</b> ${user.streak} kun uzluksiz\n\n` +
      `📌 <b>${taskObj.title}</b>\n` +
      `🎯 <b>Topshiriq:</b> ${taskObj.task}\n\n` +
      `💡 <i>Maslahat: ${taskObj.tip}</i>\n\n` +
      (isTodayDone ? "✅ <i>Bugungi topshiriq bajarilgan! Ertaga yangisi ochiladi.</i>" : "Topshiriqni bajargach quyidagi tugmani bosing:")
    );

    await api.sendMessage({
      chat_id: chatId,
      text: challengeText,
      parse_mode: 'HTML',
      reply_markup: challengeInline(currentDay, isTodayDone)
    });
    return;
  }

  if (text === "🔥 Kaloriya Yoqish" || text === "/burn") {
    const burnText = (
      `🔥 <b>Kaloriya Yoqish va Kardio Kalkulyatori:</b>\n\n` +
      `Biror ovqat yeb qo'ydingizmi yoki ortiqcha kaloriyani yoqib yubormoqchimisiz?\n\n` +
      `Quyidagi ro'yxatdan taomni tanlang yoki o'zingiz kaloriya miqdorini kiriting — bot qancha daqiqa yugurish, arqonda sakrash yoki qancha qadam yurish kerakligini aniq aytib beradi: 👇`
    );
    await api.sendMessage({
      chat_id: chatId,
      text: burnText,
      parse_mode: 'HTML',
      reply_markup: burnCalorieInline()
    });
    return;
  }

  if (text === "⏱️ Fitnes Taymer" || text === "/timer") {
    const timerText = (
      `⏱️ <b>Fitnes va Mashq Taymeri:</b>\n\n` +
      `Statik va intervalli mashqlar qorin sohasidagi eng chuqur yog'larni eritish va mushaklarni mustahkamlash uchun 1-raqamli quroldir!\n\n` +
      `Kerakli rejim yoki vaqtni tanlang: 👇`
    );
    await api.sendMessage({
      chat_id: chatId,
      text: timerText,
      parse_mode: 'HTML',
      reply_markup: fitnessTimerInline()
    });
    return;
  }

  if (text === "🥇 Liderlar Reytingi" || text === "/top" || text === "/leaderboard") {
    const lbText = await generateLeaderboardText(db, fromUser.id);
    await api.sendMessage({
      chat_id: chatId,
      text: lbText,
      parse_mode: 'HTML',
      reply_markup: leaderboardInline()
    });
    return;
  }

  if (text === "💡 Motivatsiya & Maslahat" || text === "/motivation") {
    const mText = getRandomMotivation();
    await api.sendMessage({
      chat_id: chatId,
      text: mText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔄 Boshqa motivatsiya", callback_data: "motivation_refresh" }]
        ]
      }
    });
    return;
  }

  if (text === "📋 7 Kunlik Fitnes Menyusi" || text === "/diet" || text === "/menu") {
    const plan = weeklyDietPlan[1];
    const textOut = (
      `📋 <b>7 Kunlik Fitnes Ratsioni — ${plan.dayName}</b>\n\n` +
      `🍳 <b>Nonushta:</b> ${plan.breakfast}\n\n` +
      `🍲 <b>Tushlik:</b> ${plan.lunch}\n\n` +
      `🍏 <b>Poldnik (Oraliq tamaddi):</b> ${plan.snack}\n\n` +
      `🥗 <b>Kechki ovqat:</b> ${plan.dinner}\n\n` +
      `${plan.tip}`
    );
    await api.sendMessage({
      chat_id: chatId,
      text: textOut,
      parse_mode: 'HTML',
      reply_markup: weeklyDietMenuInline(1)
    });
    return;
  }

  if (text === "🍹 Detoks Ichimliklar") {
    const detoxText = (
      "🍹 <b>Yog' Erituvchi va Detoks Ichimliklar Retseptlari</b>\n\n" +
      "Batafsil retseptni ko'rish uchun ichimlikni tanlang: 👇"
    );
    await api.sendMessage({
      chat_id: chatId,
      text: detoxText,
      parse_mode: 'HTML',
      reply_markup: detoxInline()
    });
    return;
  }

  if (text === "👤 Profil & BMI") {
    const { bmi, status } = calculateBmi(user.currentWeight || 70, user.height || 170);
    const toTarget = ((user.currentWeight || 70) - (user.targetWeight || 60)).toFixed(1);
    const diffText = toTarget > 0 ? `Tashlanishi kerak: <b>${toTarget} kg</b>` : "Siz maqsadingizdasiz! 🎯";
    const rank = getUserRank(user.xp);

    const profileText = (
      `👤 <b>Foydalanuvchi Profili: ${user.name}</b>\n\n` +
      `🎖 <b>Darajangiz:</b> ${rank}\n` +
      `⭐ <b>XP Ballaringiz:</b> ${user.xp} XP\n` +
      `🔥 <b>Faol intizom zanjiri:</b> ${user.streak} kun\n\n` +
      `📏 <b>Bo'y:</b> <b>${user.height || 0} sm</b>\n` +
      `🏁 <b>Boshlang'ich vazn:</b> ${user.startWeight || 0} kg\n` +
      `📍 <b>Hozirgi vazn:</b> <b>${user.currentWeight || 0} kg</b>\n` +
      `🎯 <b>Maqsadli vazn:</b> ${user.targetWeight || 0} kg (${diffText})\n\n` +
      `📊 <b>Tana vazni indeksi (BMI):</b> <b>${bmi}</b> — <i>${status}</i>\n` +
      `🔥 <b>Kunlik kaloriya normasi:</b> ${user.calorieGoal || 1800} kkal\n` +
      `💧 <b>Kunlik suv me'yori:</b> ${user.waterGoalMl || 2000} ml\n` +
      `👟 <b>Qadam maqsadi:</b> ${user.stepsGoal || 10000} qadam\n\n` +
      `<i>Bo'y yoki vazningizni o'zgartirish uchun: 👇</i>`
    );

    await api.sendMessage({
      chat_id: chatId,
      text: profileText,
      parse_mode: 'HTML',
      reply_markup: profileInline()
    });
    return;
  }

  if (text === "✨ Ideal Vazn Kalkulyatori") {
    const h = user.height || 170;
    const w = user.currentWeight || 70;
    const isMale = (user.gender || 'erkak').toLowerCase().includes('erkak');
    const idealW = isMale ? Math.round((h - 100) * 0.9) : Math.round((h - 100) * 0.85);
    const minHealthy = Math.round(18.5 * Math.pow(h / 100, 2));
    const maxHealthy = Math.round(24.9 * Math.pow(h / 100, 2));
    const diff = parseFloat((w - idealW).toFixed(1));
    const { bmi, status } = calculateBmi(w, h);

    let statusAdvice = "";
    if (diff > 0) {
      statusAdvice = `⚠️ <b>Xulosa:</b> Sizda ~<b>${diff} kg</b> ortiqcha vazn mavjud. Botdagi ertalabki badantarbiya va 7 kunlik fitnes menyusi bilan 1 oyda 3-5 kg sog'lom ozishingiz mumkin!`;
    } else if (diff < 0) {
      statusAdvice = `ℹ️ <b>Xulosa:</b> Ideal vaznga yetish uchun yana <b>${Math.abs(diff)} kg</b> sog'lom mushak massasi to'plash tavsiya etiladi.`;
    } else {
      statusAdvice = `🎯 <b>Ajoyib!</b> Siz aynan o'z bo'yingizga mos ideal me'yordasiz!`;
    }

    const report = (
      `⚖️ <b>SHAXSIY IDEAL VAZN & QOMAT TAHLILI</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 Jins: <b>${user.gender || 'Kiritilmagan'}</b>\n` +
      `📏 Bo'y: <b>${h} sm</b> | Hozirgi vazn: <b>${w} kg</b>\n\n` +
      `🎯 <b>Siz uchun eng mukammal ideal vazn:</b> <b>${idealW} kg</b>\n` +
      `🟢 <b>Sog'lom vazn chegarasi:</b> <b>${minHealthy} — ${maxHealthy} kg</b>\n` +
      `📊 <b>Tana massasi indeksi (BMI):</b> <b>${bmi}</b> (${status})\n\n` +
      `${statusAdvice}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `<i>Quyidagi tugmalar orqali taomlarni yoqish formulasi bilan ham tanishishingiz mumkin: 👇</i>`
    );

    await api.sendMessage({
      chat_id: chatId,
      text: report,
      parse_mode: 'HTML',
      reply_markup: idealWeightInline()
    });
    return;
  }

  if (text === "🎁 Yutuqlar & Medallar") {
    const xp = user.xp || 0;
    const streak = user.streak || 0;
    const hasWeight = (user.currentWeight || 0) < (user.startWeight || 999);

    const m1 = "🥉 <b>«Birinchi Qadam»</b> — Profil to'liq yaratildi! (Olingan ✅)\n";
    const m2 = xp >= 100 ? "🥈 <b>«Harakatdagi Sportchi»</b> — 100+ XP to'plandi! (Olingan ✅)\n" : "⚪ <b>«Harakatdagi Sportchi»</b> — 100 XP kerak (Hali qulflangan 🔒)\n";
    const m3 = xp >= 500 ? "🥇 <b>«Fitnes Ustasi»</b> — 500+ XP to'plandi! (Olingan ✅)\n" : "⚪ <b>«Fitnes Ustasi»</b> — 500 XP kerak (Hali qulflangan 🔒)\n";
    const m4 = streak >= 7 ? "🔥 <b>«Olovli Intizom»</b> — 7 kunlik buzilmas zanjir! (Olingan ✅)\n" : `⚪ <b>«Olovli Intizom»</b> — 7 kunlik zanjir kerak (Hozir: ${streak} kun 🔒)\n`;
    const m5 = hasWeight ? "⚖️ <b>«G'olib»</b> — Birinchi vazn yo'qotildi! (Olingan ✅)\n" : "⚪ <b>«G'olib»</b> — Birinchi vazn tashlanganda ochiladi 🔒\n";
    const m6 = xp >= 1000 ? "👑 <b>«Afsonaviy Chempion»</b> — 1000+ XP! (Olingan ✅)\n" : "⚪ <b>«Afsonaviy Chempion»</b> — 1000 XP kerak 🔒\n";

    const achText = (
      `🏆 <b>SIZNING YUTUQLARINGIZ VA MEDALLARINGIZ:</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `⭐ Jami tajriba: <b>${xp} XP</b>\n` +
      `🔥 Kunlik seriya: <b>${streak} kun</b>\n\n` +
      `${m1}${m2}${m3}${m4}${m5}${m6}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `💡 <i>Har kuni mashqlarni bajaring, suv va vazningizni kiriting — yangi medallar avtomatik ochiladi!</i>`
    );

    await api.sendMessage({
      chat_id: chatId,
      text: achText,
      parse_mode: 'HTML',
      reply_markup: achievementsInline()
    });
    return;
  }

  if (text === "👥 Do'stlarni taklif qilish") {
    const botUser = 'fitnesuzb_bot';
    const refLink = `https://t.me/${botUser}?start=ref_${fromUser.id}`;
    const inviteText = (
      `👥 <b>DO'STLAR BILAN BIRGA OZISH!</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `Yolg'iz shug'ullanishdan ko'ra, do'stlar yoki yaqinlar bilan musobaqa qilib ozish <b>3 barobar osonroq va qiziqarliroq</b> kechadi!\n\n` +
      `🎁 <b>Sizning shaxsiy taklif havolangiz:</b>\n` +
      `<code>${refLink}</code>\n\n` +
      `Har bir taklif qilgan do'stingiz uchun sizga ham, do'stingizga ham <b>+50 XP Bonus</b> beriladi!\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `<i>Do'stlaringizga yuborish uchun pastdagi tugmani bosing: 👇</i>`
    );

    await api.sendMessage({
      chat_id: chatId,
      text: inviteText,
      parse_mode: 'HTML',
      reply_markup: shareBotInline(botUser, fromUser.id)
    });
    return;
  }

  // AUTO-DETECT TAOM NOMLARI (Oddiy matn orqali kaloriya topish)
  if (text.length > 2 && text.length < 30) {
    const foods = searchFood(text);
    if (foods.length > 0) {
      const f = foods[0];
      const card = (
        `🍽 <b>${f.name}</b> (${f.serving})\n\n` +
        `• 🔥 Kaloriya: <b>${f.calories} kkal</b>\n` +
        `• 🥩 Oqsillar: <b>${f.protein}</b>\n` +
        `• 🧈 Yog'lar: <b>${f.fat}</b>\n` +
        `• 🍞 Uglevodlar: <b>${f.carbs}</b>\n\n` +
        `💡 <i>${f.note}</i>`
      );
      await api.sendMessage({
        chat_id: chatId,
        text: card,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: `➕ Ratsionga qo'shish (+${f.calories} kkal)`, callback_data: `cal_eat_${f.id}` }]
          ]
        }
      });
      return;
    }
  }

  // Standart javob
  await api.sendMessage({
    chat_id: chatId,
    text: "Quyidagi menyudan kerakli bo'limni tanlang: 👇",
    reply_markup: mainKeyboard(isOwner, activeMode)
  });
}
