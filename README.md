# SAVEGUARD v0.3.0

Telegram Mini App + Node.js API. The backend uses Fastify, PostgreSQL and Prisma. It verifies Telegram Mini App initData, stores purchases/subscriptions/reminders, and includes receipt OCR and scheduled Telegram reminder delivery.

## Repository contents
- apps/api — Fastify API
- packages/database — Prisma schema
- docker-compose.yml — local PostgreSQL for development
- docs — Mini App integration notes

## Local setup
1. Copy .env.example to .env.
2. Set DATABASE_URL, TELEGRAM_BOT_TOKEN and a random SESSION_SECRET (32+ characters).
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
The bot token is a server secret. Users must start the bot once before it can send them notifications. The current archive is an API backend, not a complete Mini App frontend or a complete Telegram command bot.

## Not production-ready yet
No production database is connected, migrations and tests have not been run, and deployment secrets/HTTPS/monitoring must be configured. The React Mini App source still needs to be added and connected to these API routes. OCR language assets need provisioning in deployment.
