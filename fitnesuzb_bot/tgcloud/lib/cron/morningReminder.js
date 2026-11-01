import sendDailyReminders from '../../endpoints/sendDailyReminders.js';

export default async function (args, tick) {
  console.log("05:00 Morning reminder cron running...");
  return await sendDailyReminders({ type: 'morning' });
}
