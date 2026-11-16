import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development','test','production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  TELEGRAM_BOT_TOKEN: z.string().min(20),
  SESSION_SECRET: z.string().min(32),
  WEB_ORIGIN: z.string().url().default('http://localhost:5173'),
  MINI_APP_URL: z.string().url().optional(),
  WELCOME_GIF_URL: z.string().url().optional(),
  SAVEGUARD_PREMIUM_EMOJI_ID: z.string().regex(/^\d+$/).optional(),
  TELEGRAM_INITDATA_MAX_AGE_SECONDS: z.coerce.number().int().positive().default(600)
});
export const env = schema.parse(process.env);
