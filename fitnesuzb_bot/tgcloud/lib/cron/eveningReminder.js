import sendDailyReminders from '../../endpoints/sendDailyReminders.js';

export default async function (args, tick) {
  console.log("21:00 Evening reminder cron running...");
  return await sendDailyReminders({ type: 'evening' });
}
