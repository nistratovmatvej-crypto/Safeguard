import cron from 'node-cron';
import { prisma } from '../db.js';
import { env } from '../env.js';

async function sendDueReminders() {
  try {
    const due = await prisma.reminder.findMany({
      where: { sentAt: null, dueAt: { lte: new Date() } },
      include: { user: true },
      take: 50,
      orderBy: { dueAt: 'asc' }
    });

    for (const reminder of due) {
      try {
        const response = await fetch(
          'https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/sendMessage',
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              chat_id: reminder.user.telegramId,
              text: '🛡 SAVEGUARD\n' + reminder.title
            })
          }
        );
        const result = await response.json() as { ok?: boolean; description?: string };
        if (!response.ok || !result.ok) {
          throw new Error(result.description ?? 'Telegram API ' + response.status);
        }
        await prisma.reminder.updateMany({
          where: { id: reminder.id, sentAt: null },
          data: { sentAt: new Date() }
        });
      } catch (error) {
        console.error('Reminder delivery failed', reminder.id, error);
      }
    }
  } catch (error) {
    console.error('SAVEGUARD notification worker could not read reminders. Check database schema and connection.', error);
  }
}

export function startNotificationWorker() {
  const task = cron.schedule('* * * * *', () => {
    void sendDueReminders();
  });
  void sendDueReminders();
  return () => task.stop();
}
