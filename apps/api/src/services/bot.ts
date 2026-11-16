import { env } from '../env.js';

type Update = {
  update_id: number;
  message?: {
    text?: string;
    chat: { id: number };
    from?: { first_name?: string; language_code?: string };
  };
};

const api = (method: string) =>
  'https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/' + method;

let stopped = false;
let offset = 0;

async function telegram(method: string, body: Record<string, unknown>) {
  const response = await fetch(api(method), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const payload = await response.json() as {
    ok: boolean;
    result?: unknown;
    description?: string;
  };
  if (!response.ok || !payload.ok) {
    throw new Error(payload.description ?? 'Telegram API ' + response.status);
  }
  return payload.result;
}

function responseFor(command: string, firstName: string, miniAppUrl?: string) {
  const copy: Record<string, string> = {
    start:
      '🛡 SAVEGUARD\n\nYour money. Protected.\n\nПривет, ' + firstName +
      '! Я помогу следить за подписками, покупками, сроками возврата и гарантиями.' +
      '\n\nПока приложение подключается, вот доступные разделы:' +
      '\n/deadline — покупки и возвраты' +
      '\n/subzero — подписки и платежи' +
      '\n/calendar — финансовый календарь' +
      '\n/dashboard — обзор' +
      '\n/help — помощь',
    help: 'SAVEGUARD help\n/start — welcome\n/dashboard — overview\n/deadline — purchases and return deadlines\n/subzero — subscriptions\n/calendar — financial calendar\n/settings — settings',
    dashboard: '📊 SAVEGUARD dashboard\nYour personal dashboard will appear here when the Mini App frontend is connected.',
    deadline: '🧾 DEADLINE\nTrack purchases, receipts, return windows and warranty dates. Add and manage records in the SAVEGUARD app.',
    subzero: '❄️ SUBZERO\nTrack recurring payments, free trials and subscription costs. Manage records in the SAVEGUARD app.',
    calendar: '🗓 Financial calendar\nUpcoming return deadlines, warranty dates and subscription payments will be shown in the app.',
    settings: '⚙️ Settings\nLanguage and preferred currency settings will be available in the SAVEGUARD app.'
  };

  const key = (command.replace(/^\//, '').split('@')[0] ?? '').toLowerCase();
  const text = copy[key] ?? copy.help;
  const reply_markup = miniAppUrl
    ? { inline_keyboard: [[{ text: 'Open SAVEGUARD', web_app: { url: miniAppUrl } }]] }
    : undefined;

  return { text, ...(reply_markup ? { reply_markup } : {}) };
}

async function handle(update: Update) {
  const message = update.message;
  if (!message?.text) return;

  const command = message.text.trim().split(/\s+/)[0] ?? '';
  if (!command.startsWith('/')) return;

  const firstName = message.from?.first_name ?? 'there';
  const answer = responseFor(command, firstName, env.MINI_APP_URL);
  await telegram('sendMessage', { chat_id: message.chat.id, ...answer });
}

export function startTelegramBot() {
  stopped = false;

  const loop = async () => {
    while (!stopped) {
      try {
        const updates = await telegram('getUpdates', {
          offset,
          timeout: 25,
          allowed_updates: ['message']
        }) as Update[];

        for (const update of updates) {
          offset = update.update_id + 1;
          try {
            await handle(update);
          } catch (error) {
            console.error('SAVEGUARD bot update failed', error);
          }
        }
      } catch (error) {
        console.error(
          'SAVEGUARD bot polling failed. Check token and remove any configured webhook.',
          error
        );
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  };

  void loop();
  return () => {
    stopped = true;
  };
}
