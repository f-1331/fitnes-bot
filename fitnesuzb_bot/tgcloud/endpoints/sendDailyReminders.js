import { api, db } from 'sdk';
import { users } from '../schema.js';
import { reminderMeasureInline } from '../lib/keyboards.js';

export default async function (input, ctx) {
  const type = input?.type || 'morning'; // 'morning' (05:00) yoki 'evening' (21:00)
  const allUsers = await db.select().from(users).all();

  let sentCount = 0;

  for (const user of allUsers) {
    if (!user.tgId || user.height <= 0) continue;

    let text;
    let label;

    if (type === 'morning') {
      label = "Ertalabki";
      text = (
        `🌅 <b>Xayrli tong, ${user.name}! Soat 05:00 — Ertalabki o'lchanish vaqti!</b>\n\n` +
        `Ertalab och qoringa taroziga chiqish eng aniq natijani ko'rsatadi.\n` +
        `Bugungi vazningiz yoki bo'yingiz o'zgargan bo'lsa, kiriting — bot qanchaga o'zgarganini hisoblab beradi! 👇`
      );
    } else {
      label = "Kechki";
      text = (
        `🌙 <b>Xayrli kech, ${user.name}! Soat 21:00 — Kechki o'lchanish vaqti!</b>\n\n` +
        `Kun yakunlandi! Bugungi vazningiz, bo'yingiz yoki belingiz o'zgargan bo'lsa, kiriting — bot farqni aniqlab beradi! 👇`
      );
    }

    try {
      await api.sendMessage({
        chat_id: user.tgId,
        text,
        parse_mode: 'HTML',
        reply_markup: reminderMeasureInline(label)
      });
      sentCount++;
    } catch (e) {
      console.error(`Failed to send reminder to ${user.tgId}:`, e);
    }
  }

  return { ok: true, type, sentCount };
}
