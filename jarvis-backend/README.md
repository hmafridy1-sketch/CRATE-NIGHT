# Crate Night Jarvis — Gemma API backend (MVP)

This folder adds a separate Cloudflare Worker API to the existing CRATE-NIGHT repository. It does not replace the current website or change Firebase data. The Worker keeps the OpenRouter API key server-side and requires a Firebase Authentication ID token for chat requests.

## Free-tier-first design

- Cloudflare Workers Free: host the API (subject to current account limits).
- OpenRouter free model route: inference is subject to model availability and provider rate limits.
- Firebase Authentication: existing project ID is configured as `crate-night-eaa55`.
- No API keys belong in browser code, GitHub files, or this README.

## Deploy from Android

1. Open https://dash.cloudflare.com/ and sign in/create an account.
2. Open Workers & Pages and create a Worker named `crate-night-jarvis-api`.
3. For a repository-based deployment, use a computer when available; for Android-only setup, open Cloudflare's web editor and paste the contents of `src/index.js`. The web editor may not install the `jose` dependency, so use Cloudflare's Git integration/build settings or deploy with Wrangler from a supported terminal environment.
4. In Worker Settings → Variables and Secrets, set:
   - Secret: `OPENROUTER_API_KEY` = your key from https://openrouter.ai/keys
   - Variable: `FIREBASE_PROJECT_ID` = `crate-night-eaa55`
   - Variable: `GEMMA_MODEL` = `google/gemma-4-31b-it:free`
   - Variable: `ALLOWED_ORIGINS` = the exact website origin, e.g. `https://hmafridy1-sketch.github.io` (no trailing slash). Add other exact origins comma-separated only if required.
   - Variable: `APP_ORIGIN` = your website origin.
5. If using Wrangler locally, run `npm install`, then `npx wrangler secret put OPENROUTER_API_KEY`, then `npx wrangler deploy`. Never paste the key into chat or commit it to Git.
6. Confirm the Worker URL, for example `https://crate-night-jarvis-api.<your-subdomain>.workers.dev`. The actual hostname depends on your Cloudflare account.

## API

### Health check

`GET /health`

Expected: `{"ok":true,"service":"crate-night-jarvis-api","status":"ready"}`

### Chat

`POST /api/chat`

Headers:
- `Authorization: Bearer <Firebase ID token>`
- `Content-Type: application/json`

Body:
```json
{
  "messages": [
    {"role": "user", "content": "বাংলায় Crate Night Jarvis পরিচয় দাও"}
  ]
}
```

Success response:
```json
{
  "answer": "…",
  "model": "…",
  "usage": {"prompt_tokens": 10, "completion_tokens": 20}
}
```

Only `user` and `assistant` history messages are accepted. The backend validates the Firebase token issuer/audience, limits request size and history, and does not return upstream error bodies.

## Test checklist

1. `GET <WORKER_URL>/health` → HTTP 200.
2. `POST <WORKER_URL>/api/chat` without Authorization → HTTP 401.
3. Send a valid Firebase ID token with the JSON body above → HTTP 200 and a non-empty Bangla answer.
4. Send invalid JSON → HTTP 400.
5. Call from an unlisted website origin → blocked by CORS.
6. Trigger a provider limit → HTTP 429 with `AI_RATE_LIMITED`.

## Important status

This is an initial implementation committed to a feature branch. It is **not deployed**, no provider key has been configured, and no live AI request has been tested yet. Check current Cloudflare, Firebase and OpenRouter free-tier rules before launch. OpenRouter free-model limits can change; do not assume unlimited use.
