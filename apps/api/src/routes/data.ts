import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth, getAuthUser } from '../plugins/auth.js';
const date = z.string().datetime({ offset: true }).transform(v => new Date(v));
const purchaseInput = z.object({ title:z.string().trim().min(1).max(120), merchant:z.string().max(120).optional(), amountMinor:z.number().int().nonnegative().max(100_000_000), currency:z.string().regex(/^[A-Z]{3}$/), purchasedAt:date, returnUntil:date.optional(), warrantyUntil:date.optional(), notes:z.string().max(2000).optional() });
const subscriptionInput = z.object({ name:z.string().trim().min(1).max(120), amountMinor:z.number().int().nonnegative().max(100_000_000), currency:z.string().regex(/^[A-Z]{3}$/), interval:z.enum(['WEEKLY','MONTHLY','QUARTERLY','YEARLY']), nextPaymentAt:date, trialEndsAt:date.optional() });
export async function dataRoutes(app: FastifyInstance) {
  app.get('/dashboard', { preHandler: requireAuth }, async request => {
    const user = getAuthUser(request);
    const [purchases, subscriptions] = await Promise.all([
      prisma.purchase.findMany({ where:{userId:user.id}, orderBy:{createdAt:'desc'}, take:100 }),
      prisma.subscription.findMany({ where:{userId:user.id}, orderBy:{nextPaymentAt:'asc'}, take:100 })
    ]);
    const now = new Date();
    const activeReturns = purchases.filter(p => p.returnUntil && p.returnUntil >= now && p.status === 'ACTIVE');
    return { purchases, subscriptions, returnWindowCount:activeReturns.length };
  });
  app.post('/purchases', { preHandler: requireAuth }, async (request, reply) => {
    const parsed = purchaseInput.safeParse(request.body);
    if(!parsed.success) return reply.code(400).send({error:'INVALID_REQUEST',details:parsed.error.flatten()});
    return prisma.purchase.create({data:{...parsed.data,userId:getAuthUser(request).id}});
  });
  app.delete('/purchases/:id', { preHandler: requireAuth }, async (request, reply) => {
    const params = z.object({id:z.string().min(1)}).safeParse(request.params);
    if(!params.success) return reply.code(400).send({error:'INVALID_ID'});
    const result = await prisma.purchase.deleteMany({where:{id:params.data.id,userId:getAuthUser(request).id}});
    return result.count ? {ok:true} : reply.code(404).send({error:'NOT_FOUND'});
  });
  app.post('/subscriptions', { preHandler: requireAuth }, async (request, reply) => {
    const parsed = subscriptionInput.safeParse(request.body);
    if(!parsed.success) return reply.code(400).send({error:'INVALID_REQUEST',details:parsed.error.flatten()});
    return prisma.subscription.create({data:{...parsed.data,userId:getAuthUser(request).id}});
  });
  app.delete('/subscriptions/:id', { preHandler: requireAuth }, async (request, reply) => {
    const params = z.object({id:z.string().min(1)}).safeParse(request.params);
    if(!params.success) return reply.code(400).send({error:'INVALID_ID'});
    const result = await prisma.subscription.deleteMany({where:{id:params.data.id,userId:getAuthUser(request).id}});
    return result.count ? {ok:true} : reply.code(404).send({error:'NOT_FOUND'});
  });
  app.post('/reminders', { preHandler: requireAuth }, async (request, reply) => {
    const parsed = z.object({ type:z.string().min(1).max(40), title:z.string().trim().min(1).max(180), dueAt:date }).safeParse(request.body);
    if(!parsed.success) return reply.code(400).send({error:'INVALID_REQUEST',details:parsed.error.flatten()});
    return prisma.reminder.create({data:{...parsed.data,userId:getAuthUser(request).id}});
  });
  app.delete('/reminders/:id', { preHandler: requireAuth }, async (request, reply) => {
    const params = z.object({id:z.string().min(1)}).safeParse(request.params);
    if(!params.success) return reply.code(400).send({error:'INVALID_ID'});
    const result = await prisma.reminder.deleteMany({where:{id:params.data.id,userId:getAuthUser(request).id,sentAt:null}});
    return result.count ? {ok:true} : reply.code(404).send({error:'NOT_FOUND'});
  });
}
