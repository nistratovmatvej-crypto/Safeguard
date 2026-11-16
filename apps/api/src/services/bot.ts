import { env } from '../env.js';
import { prisma } from '../db.js';

type Language = 'ru' | 'en' | 'de' | 'es' | 'fr' | 'it' | 'pt' | 'tr';
type TelegramUser = { id: number; first_name?: string; last_name?: string; username?: string; language_code?: string };
type Update = {
  update_id: number;
  message?: { text?: string; chat: { id: number }; from?: TelegramUser };
  callback_query?: { id: string; data?: string; from: TelegramUser; message?: { chat: { id: number } } };
};

const api = (method: string) =>
  'https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/' + method;

const languages: { code: Language; label: string }[] = [
  { code: 'ru', label: '🇷🇺 Русский' }, { code: 'en', label: '🇬🇧 English' },
  { code: 'de', label: '🇩🇪 Deutsch' }, { code: 'es', label: '🇪🇸 Español' },
  { code: 'fr', label: '🇫🇷 Français' }, { code: 'it', label: '🇮🇹 Italiano' },
  { code: 'pt', label: '🇵🇹 Português' }, { code: 'tr', label: '🇹🇷 Türkçe' }
];

type Translation = {
  welcome: string; help: string; dashboard: string; deadline: string; subzero: string;
  calendar: string; settings: string; language: string; languageSaved: string; open: string;
  dashboardBtn: string; deadlineBtn: string; subzeroBtn: string; calendarBtn: string;
  settingsBtn: string; helpBtn: string;
};

const copy: Record<Language, Translation> = {
  ru: {
    welcome: 'SAVEGUARD\nYour money. Protected.\n\nПривет, {name}! Я помогу следить за покупками, сроками возврата, гарантиями и подписками.\n\nВыбери нужный раздел кнопкой ниже.',
    help: 'Помощь SAVEGUARD\nВыбери раздел в меню ниже или используй команды:\n/start — главное меню\n/dashboard — обзор\n/deadline — покупки и возвраты\n/subzero — подписки\n/calendar — финансовый календарь\n/settings — настройки',
    dashboard: 'Обзор SAVEGUARD\nЛичная финансовая панель появится здесь после подключения Mini App.',
    deadline: 'DEADLINE\nХрани покупки, чеки, сроки возврата и гарантии. Управление записями будет доступно в приложении.',
    subzero: 'SUBZERO\nСледи за подписками, пробными периодами и регулярными платежами. Управление будет доступно в приложении.',
    calendar: 'Финансовый календарь\nЗдесь будут отображаться сроки возврата, гарантии и даты платежей.',
    settings: 'Настройки\nВыбери язык интерфейса. Валюту можно будет настроить в приложении.',
    language: 'Выбери язык SAVEGUARD:',
    languageSaved: 'Язык изменён на русский.',
    open: 'Открыть SAVEGUARD',
    dashboardBtn: '📊 Обзор', deadlineBtn: '🧾 Покупки', subzeroBtn: '❄️ Подписки', calendarBtn: '🗓 Календарь', settingsBtn: '⚙️ Настройки', helpBtn: '❔ Помощь'
  },
  en: {
    welcome: 'SAVEGUARD\nYour money. Protected.\n\nHi, {name}! I help you track purchases, return windows, warranties and subscriptions.\n\nChoose a section using the buttons below.',
    help: 'SAVEGUARD help\nChoose a section below or use commands:\n/start — main menu\n/dashboard — overview\n/deadline — purchases and returns\n/subzero — subscriptions\n/calendar — financial calendar\n/settings — settings',
    dashboard: 'SAVEGUARD dashboard\nYour personal financial overview will appear here when the Mini App is connected.',
    deadline: 'DEADLINE\nKeep track of purchases, receipts, return windows and warranty dates. Record management will be available in the app.',
    subzero: 'SUBZERO\nTrack subscriptions, free trials and recurring payments. Management will be available in the app.',
    calendar: 'Financial calendar\nReturn deadlines, warranty dates and upcoming payments will appear here.',
    settings: 'Settings\nChoose your interface language. Currency settings will be available in the app.',
    language: 'Choose your SAVEGUARD language:',
    languageSaved: 'Language changed to English.',
    open: 'Open SAVEGUARD',
    dashboardBtn: '📊 Dashboard', deadlineBtn: '🧾 Purchases', subzeroBtn: '❄️ Subscriptions', calendarBtn: '🗓 Calendar', settingsBtn: '⚙️ Settings', helpBtn: '❔ Help'
  },
  de: {
    welcome: 'SAVEGUARD\nDein Geld. Geschützt.\n\nHallo, {name}! Ich helfe dir, Käufe, Rückgabefristen, Garantien und Abonnements im Blick zu behalten.\n\nWähle unten einen Bereich aus.',
    help: 'SAVEGUARD-Hilfe\nWähle unten einen Bereich oder nutze die Befehle:\n/start — Hauptmenü\n/dashboard — Übersicht\n/deadline — Käufe und Rückgaben\n/subzero — Abonnements\n/calendar — Finanzkalender\n/settings — Einstellungen',
    dashboard: 'SAVEGUARD-Übersicht\nDeine persönliche Finanzübersicht erscheint hier, sobald die Mini App verbunden ist.',
    deadline: 'DEADLINE\nBehalte Käufe, Belege, Rückgabefristen und Garantien im Blick. Die Verwaltung erfolgt in der App.',
    subzero: 'SUBZERO\nBehalte Abonnements, Testzeiträume und wiederkehrende Zahlungen im Blick.',
    calendar: 'Finanzkalender\nHier erscheinen Rückgabefristen, Garantietermine und anstehende Zahlungen.',
    settings: 'Einstellungen\nWähle deine Sprache. Die Währung kannst du später in der App festlegen.',
    language: 'Wähle deine SAVEGUARD-Sprache:',
    languageSaved: 'Sprache auf Deutsch geändert.',
    open: 'SAVEGUARD öffnen',
    dashboardBtn: '📊 Übersicht', deadlineBtn: '🧾 Käufe', subzeroBtn: '❄️ Abos', calendarBtn: '🗓 Kalender', settingsBtn: '⚙️ Einstellungen', helpBtn: '❔ Hilfe'
  },
  es: {
    welcome: 'SAVEGUARD\nTu dinero. Protegido.\n\n¡Hola, {name}! Te ayudo a controlar compras, plazos de devolución, garantías y suscripciones.\n\nElige una sección abajo.',
    help: 'Ayuda de SAVEGUARD\nElige una sección o usa los comandos:\n/start — menú principal\n/dashboard — resumen\n/deadline — compras y devoluciones\n/subzero — suscripciones\n/calendar — calendario financiero\n/settings — ajustes',
    dashboard: 'Panel SAVEGUARD\nTu resumen financiero aparecerá aquí cuando se conecte la Mini App.',
    deadline: 'DEADLINE\nControla compras, recibos, plazos de devolución y garantías. La gestión estará disponible en la aplicación.',
    subzero: 'SUBZERO\nControla suscripciones, pruebas gratuitas y pagos periódicos.',
    calendar: 'Calendario financiero\nAquí aparecerán las fechas de devolución, garantías y próximos pagos.',
    settings: 'Ajustes\nElige el idioma de la interfaz. La moneda se podrá configurar en la aplicación.',
    language: 'Elige el idioma de SAVEGUARD:',
    languageSaved: 'Idioma cambiado a español.',
    open: 'Abrir SAVEGUARD',
    dashboardBtn: '📊 Resumen', deadlineBtn: '🧾 Compras', subzeroBtn: '❄️ Suscripciones', calendarBtn: '🗓 Calendario', settingsBtn: '⚙️ Ajustes', helpBtn: '❔ Ayuda'
  },
  fr: {
    welcome: 'SAVEGUARD\nVotre argent. Protégé.\n\nBonjour, {name} ! Je vous aide à suivre vos achats, délais de retour, garanties et abonnements.\n\nChoisissez une rubrique ci-dessous.',
    help: 'Aide SAVEGUARD\nChoisissez une rubrique ou utilisez les commandes :\n/start — menu principal\n/dashboard — aperçu\n/deadline — achats et retours\n/subzero — abonnements\n/calendar — calendrier financier\n/settings — paramètres',
    dashboard: 'Tableau de bord SAVEGUARD\nVotre aperçu financier apparaîtra ici lorsque la Mini App sera connectée.',
    deadline: 'DEADLINE\nSuivez vos achats, reçus, délais de retour et garanties. La gestion sera disponible dans l’application.',
    subzero: 'SUBZERO\nSuivez vos abonnements, essais gratuits et paiements récurrents.',
    calendar: 'Calendrier financier\nLes dates de retour, garanties et prochains paiements apparaîtront ici.',
    settings: 'Paramètres\nChoisissez la langue de l’interface. La devise sera configurable dans l’application.',
    language: 'Choisissez la langue de SAVEGUARD :',
    languageSaved: 'La langue est maintenant le français.',
    open: 'Ouvrir SAVEGUARD',
    dashboardBtn: '📊 Aperçu', deadlineBtn: '🧾 Achats', subzeroBtn: '❄️ Abonnements', calendarBtn: '🗓 Calendrier', settingsBtn: '⚙️ Paramètres', helpBtn: '❔ Aide'
  },
  it: {
    welcome: 'SAVEGUARD\nI tuoi soldi. Protetti.\n\nCiao, {name}! Ti aiuto a tenere sotto controllo acquisti, resi, garanzie e abbonamenti.\n\nScegli una sezione qui sotto.',
    help: 'Aiuto SAVEGUARD\nScegli una sezione o usa i comandi:\n/start — menu principale\n/dashboard — riepilogo\n/deadline — acquisti e resi\n/subzero — abbonamenti\n/calendar — calendario finanziario\n/settings — impostazioni',
    dashboard: 'Dashboard SAVEGUARD\nIl tuo riepilogo finanziario apparirà qui quando la Mini App sarà collegata.',
    deadline: 'DEADLINE\nTieni traccia di acquisti, ricevute, termini di reso e garanzie. La gestione sarà disponibile nell’app.',
    subzero: 'SUBZERO\nTieni sotto controllo abbonamenti, prove gratuite e pagamenti ricorrenti.',
    calendar: 'Calendario finanziario\nQui appariranno scadenze dei resi, garanzie e prossimi pagamenti.',
    settings: 'Impostazioni\nScegli la lingua dell’interfaccia. La valuta sarà configurabile nell’app.',
    language: 'Scegli la lingua di SAVEGUARD:',
    languageSaved: 'Lingua impostata su italiano.',
    open: 'Apri SAVEGUARD',
    dashboardBtn: '📊 Riepilogo', deadlineBtn: '🧾 Acquisti', subzeroBtn: '❄️ Abbonamenti', calendarBtn: '🗓 Calendario', settingsBtn: '⚙️ Impostazioni', helpBtn: '❔ Aiuto'
  },
  pt: {
    welcome: 'SAVEGUARD\nSeu dinheiro. Protegido.\n\nOlá, {name}! Ajudo você a acompanhar compras, prazos de devolução, garantias e assinaturas.\n\nEscolha uma seção abaixo.',
    help: 'Ajuda SAVEGUARD\nEscolha uma seção ou use os comandos:\n/start — menu principal\n/dashboard — visão geral\n/deadline — compras e devoluções\n/subzero — assinaturas\n/calendar — calendário financeiro\n/settings — configurações',
    dashboard: 'Painel SAVEGUARD\nSeu resumo financeiro aparecerá aqui quando o Mini App estiver conectado.',
    deadline: 'DEADLINE\nAcompanhe compras, recibos, prazos de devolução e garantias. A gestão estará disponível no aplicativo.',
    subzero: 'SUBZERO\nAcompanhe assinaturas, testes gratuitos e pagamentos recorrentes.',
    calendar: 'Calendário financeiro\nOs prazos de devolução, garantias e próximos pagamentos aparecerão aqui.',
    settings: 'Configurações\nEscolha o idioma da interface. A moeda poderá ser configurada no aplicativo.',
    language: 'Escolha o idioma do SAVEGUARD:',
    languageSaved: 'Idioma alterado para português.',
    open: 'Abrir SAVEGUARD',
    dashboardBtn: '📊 Visão geral', deadlineBtn: '🧾 Compras', subzeroBtn: '❄️ Assinaturas', calendarBtn: '🗓 Calendário', settingsBtn: '⚙️ Configurações', helpBtn: '❔ Ajuda'
  },
  tr: {
    welcome: 'SAVEGUARD\nParanız. Güvende.\n\nMerhaba, {name}! Alışverişlerinizi, iade sürelerini, garantileri ve abonelikleri takip etmenize yardımcı olurum.\n\nAşağıdan bir bölüm seçin.',
    help: 'SAVEGUARD yardımı\nAşağıdan bir bölüm seçin veya komutları kullanın:\n/start — ana menü\n/dashboard — genel bakış\n/deadline — alışveriş ve iadeler\n/subzero — abonelikler\n/calendar — finans takvimi\n/settings — ayarlar',
    dashboard: 'SAVEGUARD paneli\nMini App bağlandığında kişisel finans özetiniz burada görünecek.',
    deadline: 'DEADLINE\nAlışverişleri, fişleri, iade sürelerini ve garantileri takip edin. Kayıt yönetimi uygulamada sunulacak.',
    subzero: 'SUBZERO\nAbonelikleri, ücretsiz denemeleri ve düzenli ödemeleri takip edin.',
    calendar: 'Finans takvimi\nİade tarihleri, garanti süreleri ve yaklaşan ödemeler burada gösterilecek.',
    settings: 'Ayarlar\nArayüz dilini seçin. Para birimi uygulamada ayarlanabilecek.',
    language: 'SAVEGUARD dilini seçin:',
    languageSaved: 'Dil Türkçe olarak ayarlandı.',
    open: 'SAVEGUARD uygulamasını aç',
    dashboardBtn: '📊 Genel bakış', deadlineBtn: '🧾 Alışverişler', subzeroBtn: '❄️ Abonelikler', calendarBtn: '🗓 Takvim', settingsBtn: '⚙️ Ayarlar', helpBtn: '❔ Yardım'
  }
};

const commandNames = ['start', 'dashboard', 'deadline', 'subzero', 'calendar', 'settings', 'help'] as const;
type Command = typeof commandNames[number];

const localizedCommands: Record<string, Command> = {};
for (const lang of languages) {
  const t = copy[lang.code];
  localizedCommands[t.dashboardBtn] = 'dashboard';
  localizedCommands[t.deadlineBtn] = 'deadline';
  localizedCommands[t.subzeroBtn] = 'subzero';
  localizedCommands[t.calendarBtn] = 'calendar';
  localizedCommands[t.settingsBtn] = 'settings';
  localizedCommands[t.helpBtn] = 'help';
}

let stopped = false;
let offset = 0;

async function telegram(method: string, body: Record<string, unknown>) {
  const response = await fetch(api(method), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const payload = await response.json() as { ok: boolean; result?: unknown; description?: string };
  if (!response.ok || !payload.ok) throw new Error(payload.description ?? 'Telegram API ' + response.status);
  return payload.result;
}

function languageOf(value?: string): Language {
  const code = (value ?? 'en').toLowerCase().split('-')[0];
  return languages.some(item => item.code === code) ? code as Language : 'en';
}

function keyboard(lang: Language) {
  const t = copy[lang];
  return {
    keyboard: [
      [{ text: t.dashboardBtn }, { text: t.deadlineBtn }],
      [{ text: t.subzeroBtn }, { text: t.calendarBtn }],
      [{ text: t.settingsBtn }, { text: t.helpBtn }]
    ],
    resize_keyboard: true,
    is_persistent: true,
    input_field_placeholder: lang === 'ru' ? 'Выберите раздел…' : lang === 'de' ? 'Bereich auswählen…' : lang === 'es' ? 'Elige una sección…' : lang === 'fr' ? 'Choisissez une rubrique…' : lang === 'it' ? 'Scegli una sezione…' : lang === 'pt' ? 'Escolha uma seção…' : lang === 'tr' ? 'Bir bölüm seçin…' : 'Choose a section…'
  };
}

function languageKeyboard() {
  return {
    inline_keyboard: [
      languages.slice(0, 2).map(x => ({ text: x.label, callback_data: 'lang:' + x.code })),
      languages.slice(2, 4).map(x => ({ text: x.label, callback_data: 'lang:' + x.code })),
      languages.slice(4, 6).map(x => ({ text: x.label, callback_data: 'lang:' + x.code })),
      languages.slice(6, 8).map(x => ({ text: x.label, callback_data: 'lang:' + x.code }))
    ]
  };
}

async function getUser(tg: TelegramUser) {
  return prisma.user.upsert({
    where: { telegramId: String(tg.id) },
    create: {
      telegramId: String(tg.id),
      firstName: tg.first_name ?? 'there',
      lastName: tg.last_name,
      username: tg.username,
      languageCode: languageOf(tg.language_code)
    },
    update: {
      firstName: tg.first_name ?? 'there',
      lastName: tg.last_name,
      username: tg.username
    }
  });
}

async function send(chatId: number, text: string, lang: Language, extra: Record<string, unknown> = {}) {
  const reply_markup = env.MINI_APP_URL
    ? { ...keyboard(lang), keyboard: [...(keyboard(lang).keyboard as { text: string }[][]), [{ text: copy[lang].open, web_app: { url: env.MINI_APP_URL } }]] }
    : keyboard(lang);
  await telegram('sendMessage', { chat_id: chatId, text, reply_markup, ...extra });
}

async function showSettings(chatId: number, lang: Language) {
  await send(chatId, copy[lang].settings + '\n\n' + copy[lang].language, lang, { reply_markup: languageKeyboard() });
}

async function handleMessage(update: NonNullable<Update['message']>) {
  const message = update;
  if (!message.text || !message.from) return;
  const user = await getUser(message.from);
  const lang = languageOf(user.languageCode);
  const raw = message.text.trim();
  const firstToken = raw.split(/\s+/).at(0) ?? '';
  const command = raw.startsWith('/')
    ? (firstToken.replace(/^\//, '').split('@').at(0) ?? '').toLowerCase()
    : localizedCommands[raw];
  if (!command) return;

  if (command === 'settings') return showSettings(message.chat.id, lang);
  if (command === 'start') {
    const name = message.from.first_name ?? 'there';
    const text = copy[lang].welcome.replace('{name}', name);
    await send(message.chat.id, text, lang);
    return;
  }
  if (command === 'help' || commandNames.includes(command as Command)) {
    const key = command as Exclude<Command, 'start'>;
    await send(message.chat.id, copy[lang][key], lang);
  }
}

async function handleCallback(query: NonNullable<Update['callback_query']>) {
  if (!query.data?.startsWith('lang:') || !query.message) return;
  const chatId = query.message.chat.id;
  const selected = languageOf(query.data.slice(5));
  await prisma.user.upsert({
    where: { telegramId: String(query.from.id) },
    create: { telegramId: String(query.from.id), firstName: query.from.first_name ?? 'there', languageCode: selected },
    update: { languageCode: selected, firstName: query.from.first_name ?? 'there' }
  });
  await telegram('answerCallbackQuery', { callback_query_id: query.id, text: copy[selected].languageSaved });
  await send(chatId, copy[selected].languageSaved + '\n\n' + copy[selected].welcome.replace('{name}', query.from.first_name ?? 'there'), selected);
}

async function registerTelegramMenu() {
  const descriptions: Record<Language, string[]> = {
    ru: ['Главное меню', 'Обзор финансов', 'Покупки и возвраты', 'Подписки и платежи', 'Финансовый календарь', 'Настройки', 'Помощь'],
    en: ['Main menu', 'Financial overview', 'Purchases and returns', 'Subscriptions and payments', 'Financial calendar', 'Settings', 'Help'],
    de: ['Hauptmenü', 'Finanzübersicht', 'Käufe und Rückgaben', 'Abonnements und Zahlungen', 'Finanzkalender', 'Einstellungen', 'Hilfe'],
    es: ['Menú principal', 'Resumen financiero', 'Compras y devoluciones', 'Suscripciones y pagos', 'Calendario financiero', 'Ajustes', 'Ayuda'],
    fr: ['Menu principal', 'Aperçu financier', 'Achats et retours', 'Abonnements et paiements', 'Calendrier financier', 'Paramètres', 'Aide'],
    it: ['Menu principale', 'Riepilogo finanziario', 'Acquisti e resi', 'Abbonamenti e pagamenti', 'Calendario finanziario', 'Impostazioni', 'Aiuto'],
    pt: ['Menu principal', 'Visão financeira', 'Compras e devoluções', 'Assinaturas e pagamentos', 'Calendário financeiro', 'Configurações', 'Ajuda'],
    tr: ['Ana menü', 'Finans özeti', 'Alışveriş ve iadeler', 'Abonelikler ve ödemeler', 'Finans takvimi', 'Ayarlar', 'Yardım']
  };
  for (const lang of languages) {
    await telegram('setMyCommands', {
      language_code: lang.code,
      commands: commandNames.map((command, index) => ({ command, description: descriptions[lang.code][index] }))
    });
  }
  await telegram('setMyCommands', {
    commands: commandNames.map((command, index) => ({ command, description: descriptions.en[index] }))
  });
}

export function startTelegramBot() {
  stopped = false;
  void registerTelegramMenu().catch(error => console.error('SAVEGUARD command menu setup failed', error));

  const loop = async () => {
    while (!stopped) {
      try {
        const updates = await telegram('getUpdates', { offset, timeout: 25, allowed_updates: ['message', 'callback_query'] }) as Update[];
        for (const update of updates) {
          offset = update.update_id + 1;
          try {
            if (update.callback_query) await handleCallback(update.callback_query);
            if (update.message) await handleMessage(update.message);
          } catch (error) {
            console.error('SAVEGUARD bot update failed', error);
          }
        }
      } catch (error) {
        console.error('SAVEGUARD bot polling failed. Check token and remove any configured webhook.', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  };
  void loop();
  return () => { stopped = true; };
}
