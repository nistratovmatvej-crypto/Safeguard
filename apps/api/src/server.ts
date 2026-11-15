import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { env } from './env.js';
import { prisma } from './db.js';
import { authRoutes } from './routes/auth.js';
import { dataRoutes } from './routes/data.js';
import { ocrRoutes } from './routes/ocr.js';
import { startNotificationWorker } from './services/notifications.js';

const app = Fastify({ logger: true, trustProxy: env.NODE_ENV === 'production', bodyLimit: 32 * 1024 });
await app.register(helmet, { contentSecurityPolicy: false });
await app.register(cookie);
await app.register(multipart, { limits: { fileSize: 8 * 1024 * 1024, files: 1 } });
await app.register(cors, { origin: env.WEB_ORIGIN, credentials: true });
await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
app.get('/health', async () => ({ ok:true, service:'saveguard-api' }));
await app.register(authRoutes, { prefix:'/api/v1' });
await app.register(dataRoutes, { prefix:'/api/v1' });
await app.register(ocrRoutes, { prefix:'/api/v1' });
const stopNotifications = startNotificationWorker();

const close = async () => { stopNotifications(); await app.close(); await prisma.$disconnect(); process.exit(0); };
process.on('SIGINT', close); process.on('SIGTERM', close);
try { await app.listen({ host:env.HOST, port:env.PORT }); }
catch (error) { app.log.error(error); await prisma.$disconnect(); process.exit(1); }
