# React Mini App integration contract

1. Read window.Telegram.WebApp.initData in React. Never use initDataUnsafe as proof of identity.
2. POST { initData } to /api/v1/auth/telegram with credentials: include.
3. The API verifies Telegram HMAC using the bot token stored server-side and sets an HttpOnly session cookie.
4. Use credentials: include for later API calls.
5. GET /api/v1/auth/me restores the session; POST /api/v1/auth/logout revokes it.

Example:
```ts
const API = import.meta.env.VITE_API_URL;
const initData = window.Telegram?.WebApp?.initData;
if (!initData) throw new Error('Open SAVEGUARD inside Telegram');
const response = await fetch(`${API}/api/v1/auth/telegram`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ initData })
});
if (!response.ok) throw new Error('Telegram authentication failed');
const { user } = await response.json();
```
