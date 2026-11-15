import type { FastifyRequest, FastifyReply } from 'fastify';
import { createHash, randomBytes } from 'node:crypto';
import { env } from '../env.js';
import { prisma } from '../db.js';

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export async function issueSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { tokenHash, userId, expiresAt } });
  return { token, expiresAt };
}
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies.sg_session;
  if (!token) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  const session = await prisma.session.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
  if (!session || session.expiresAt <= new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } });
    return reply.code(401).send({ error: 'SESSION_EXPIRED' });
  }
  (request as FastifyRequest & { authUser: typeof session.user }).authUser = session.user;
}
export function getAuthUser(request: FastifyRequest) {
  return (request as FastifyRequest & { authUser: { id: string; telegramId: string; firstName: string; lastName: string | null; username: string | null; languageCode: string; currency: string } }).authUser;
}
export async function revokeSession(token: string) {
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}
