# SAVEGUARD v0.3.0

Telegram Mini App + Node.js API. The backend uses Fastify, PostgreSQL and Prisma. It verifies Telegram Mini App initData, stores purchases/subscriptions/reminders, and includes receipt OCR and scheduled Telegram reminder delivery.

## Repository contents
- apps/api — Fastify API
- packages/database — Prisma schema
- docker-compose.yml — local PostgreSQL for development
- docs — Mini App integration notes

## Local setup
1. Copy .env.example to .env.
2. Create a Supabase project. In Project → Connect, copy the Session pooler connection string (port 5432). Put it in DATABASE_URL and DIRECT_URL in .env. Set TELEGRAM_BOT_TOKEN and a random SESSION_SECRET (32+ characters).
3. Start local PostgreSQL: docker compose up -d
4. npm install
5. npm run db:generate
6. npm run db:migrate
7. npm run dev

Health check: http://localhost:3000/health

## API
- POST /api/v1/auth/telegram
- GET /api/v1/auth/me
- POST /api/v1/auth/logout
- GET /api/v1/dashboard
- POST/DELETE /api/v1/purchases
- POST/DELETE /api/v1/subscriptions
- POST/DELETE /api/v1/reminders
- POST /api/v1/ocr/receipt

## Telegram limitation
The bot token is a server secret. Users must start the bot once before it can send them notifications. A basic Telegram command responder is included for /start, /help, /dashboard, /deadline, /subzero, /calendar and /settings. The full React Mini App frontend is still not included.

## Not production-ready yet
No production database is connected, migrations and tests have not been run, and deployment secrets/HTTPS/monitoring must be configured. The React Mini App source still needs to be added and connected to these API routes. OCR language assets need provisioning in deployment.
