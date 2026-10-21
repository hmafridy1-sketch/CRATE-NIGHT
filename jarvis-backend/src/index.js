import { createRemoteJWKSet, jwtVerify } from "jose";

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);
const MAX_MESSAGE_CHARS = 4000;
const MAX_HISTORY_MESSAGES = 12;
const MAX_HISTORY_CHARS = 12000;

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const headers = new Headers({
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
  });
  if (origin && allowed.includes(origin)) headers.set("Access-Control-Allow-Origin", origin);
  return headers;
}

function json(data, status, headers) {
  const h = new Headers(headers);
  h.set("Content-Type", "application/json; charset=utf-8");
  h.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(data), { status, headers: h });
}

async function verifyFirebaseToken(request, env) {
  const header = request.headers.get("Authorization") || "";
  if (!header.startsWith("Bearer ")) throw new Error("AUTH_REQUIRED");
  const token = header.slice(7).trim();
  if (!token) throw new Error("AUTH_REQUIRED");

  const projectId = env.FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("SERVER_CONFIG");
  const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    algorithms: ["RS256"],
  });
  if (!payload.sub || typeof payload.sub !== "string") throw new Error("AUTH_INVALID");
  return payload;
}

function validateMessages(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > MAX_HISTORY_MESSAGES) {
    throw new Error("INVALID_MESSAGES");
  }
  let total = 0;
  const messages = input.map((item) => {
    if (!item || !["user", "assistant"].includes(item.role) || typeof item.content !== "string") {
      throw new Error("INVALID_MESSAGES");
    }
    const content = item.content.trim();
    if (!content || content.length > MAX_MESSAGE_CHARS) throw new Error("INVALID_MESSAGES");
    total += content.length;
    return { role: item.role, content };
  });
  if (total > MAX_HISTORY_CHARS || messages[messages.length - 1].role !== "user") {
    throw new Error("INVALID_MESSAGES");
  }
  return messages;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const headers = corsHeaders(origin, env);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      if (origin && !headers.has("Access-Control-Allow-Origin")) {
        return new Response(null, { status: 403, headers });
      }
      return new Response(null, { status: 204, headers });
    }
    if (url.pathname === "/health" && request.method === "GET") {
      return json({ ok: true, service: "crate-night-jarvis-api", status: "ready" }, 200, headers);
    }
    if (url.pathname !== "/api/chat") return json({ error: "NOT_FOUND" }, 404, headers);
    if (request.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405, headers);
    if (origin && !headers.has("Access-Control-Allow-Origin")) {
      return json({ error: "ORIGIN_NOT_ALLOWED" }, 403, headers);
    }
    if (!env.OPENROUTER_API_KEY) return json({ error: "AI_PROVIDER_NOT_CONFIGURED" }, 503, headers);

    let user;
    try {
      user = await verifyFirebaseToken(request, env);
    } catch (error) {
      const code = error?.message === "SERVER_CONFIG" ? 503 : 401;
      return json({ error: code === 401 ? "UNAUTHORIZED" : "SERVER_CONFIG" }, code, headers);
    }

    let body;
    try {
      const length = Number(request.headers.get("Content-Length") || 0);
      if (length > 20000) return json({ error: "REQUEST_TOO_LARGE" }, 413, headers);
      body = await request.json();
    } catch {
      return json({ error: "INVALID_JSON" }, 400, headers);
    }

    let messages;
    try {
      messages = validateMessages(body?.messages);
    } catch {
      return json({ error: "INVALID_MESSAGES" }, 400, headers);
    }

    const model = env.GEMMA_MODEL || "google/gemma-4-31b-it:free";
    let upstream;
    try {
      upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": env.APP_ORIGIN || "https://hmafridy1-sketch.github.io",
          "X-Title": "Crate Night Jarvis",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "You are Crate Night Jarvis, a helpful business assistant. Reply in the language used by the user, preferably Bangla when the user writes Bangla. Be accurate, clearly state uncertainty, and never claim to have performed actions outside this chat. Do not request passwords, API keys, or other secrets.",
            },
            ...messages,
          ],
          temperature: 0.4,
          max_tokens: 700,
        }),
        signal: AbortSignal.timeout(25000),
      });
    } catch {
      return json({ error: "AI_PROVIDER_UNAVAILABLE" }, 502, headers);
    }

    if (!upstream.ok) {
      // Do not return provider body or secrets to the client.
      return json(
        { error: upstream.status === 429 ? "AI_RATE_LIMITED" : "AI_PROVIDER_ERROR" },
        upstream.status === 429 ? 429 : 502,
        headers
      );
    }

    let data;
    try {
      data = await upstream.json();
    } catch {
      return json({ error: "AI_BAD_RESPONSE" }, 502, headers);
    }
    const answer = data?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) {
      return json({ error: "AI_EMPTY_RESPONSE" }, 502, headers);
    }

    return json({
      answer: answer.trim(),
      model: data.model || model,
      usage: data.usage ? {
        prompt_tokens: data.usage.prompt_tokens,
        completion_tokens: data.usage.completion_tokens,
      } : null,
    }, 200, headers);
  },
};
