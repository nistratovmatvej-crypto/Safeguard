import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../env.js';

export type TelegramUser = { id: number; first_name: string; last_name?: string; username?: string; language_code?: string; photo_url?: string };
export function verifyTelegramInitData(initData: string, nowSeconds = Math.floor(Date.now()/1000)) {
  if (!initData || initData.length > 16_384) throw new Error('INVALID_INIT_DATA');
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  const authDateRaw = params.get('auth_date');
  const userRaw = params.get('user');
  if (!hash || !/^[a-f0-9]{64}$/i.test(hash) || !authDateRaw || !userRaw) throw new Error('INVALID_INIT_DATA');
  const authDate = Number(authDateRaw);
  if (!Number.isInteger(authDate) || authDate > nowSeconds + 30 || nowSeconds - authDate > env.TELEGRAM_INITDATA_MAX_AGE_SECONDS) throw new Error('EXPIRED_INIT_DATA');
  const dataCheckString = [...params.entries()].filter(([key]) => key !== 'hash').sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join('\n');
  const secretKey = createHmac('sha256', env.TELEGRAM_BOT_TOKEN).update('WebAppData').digest();
  const expected = createHmac('sha256', secretKey).update(dataCheckString).digest();
  const received = Buffer.from(hash, 'hex');
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) throw new Error('INVALID_SIGNATURE');
  let user: TelegramUser;
  try { user = JSON.parse(userRaw) as TelegramUser; } catch { throw new Error('INVALID_USER'); }
  if (!Number.isSafeInteger(user.id) || user.id <= 0 || typeof user.first_name !== 'string') throw new Error('INVALID_USER');
  return { user, authDate };
}
