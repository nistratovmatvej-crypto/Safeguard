import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { env } from '../env.js';
import { verifyTelegramInitData } from '../services/telegram.js';
import { issueSession, requireAuth, getAuthUser, revokeSession } from '../plugins/auth.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/telegram', async (request, reply) => {
    const body = z.object({ initData: z.string().min(1).max(16_384) }).safeParse(request.body);
    if (!body.success) return reply.code(400).send({ error: 'INVALID_REQUEST' });
    try {
      const { user: tg } = verifyTelegramInitData(body.data.initData);
      const user = await prisma.user.upsert({
        where: { telegramId: String(tg.id) },
        create: { telegramId: String(tg.id), firstName: tg.first_name, lastName: tg.last_name, username: tg.username, languageCode: tg.language_code ?? 'en', photoUrl: tg.photo_url },
        update: { firstName: tg.first_name, lastName: tg.last_name, username: tg.username, languageCode: tg.language_code ?? 'en', photoUrl: tg.photo_url }
      });
      const { token, expiresAt } = await issueSession(user.id);
      reply.setCookie('sg_session', token, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires: expiresAt });
      return { user: { id: user.id, firstName: user.firstName, lastName: user.lastName, username: user.username, languageCode: user.languageCode, currency: user.currency } };
    } catch (error) {
      const code = error instanceof Error ? error.message : 'AUTH_FAILED';
      return reply.code(401).send({ error: code === 'EXPIRED_INIT_DATA' ? code : 'TELEGRAM_AUTH_FAILED' });
    }
  });
  app.get('/auth/me', { preHandler: requireAuth }, async request => {
    const user = getAuthUser(request);
    return { user: { id: user.id, firstName: user.firstName, lastName: user.lastName, username: user.username, languageCode: user.languageCode, currency: user.currency } };
  });
  app.post('/auth/logout', { preHandler: requireAuth }, async (request, reply) => {
    const token = request.cookies.sg_session;
    if (token) await revokeSession(token);
    reply.clearCookie('sg_session', { path: '/' });
    return { ok: true };
  });
}
