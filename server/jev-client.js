const BASE = 'https://jev-ai.pro/api/v1';
const SYSTEMONE = `${BASE}/systemone`;
const MODELS = `${BASE}/models`;

function key() {
  return process.env.JEV_AI_API_KEY;
}

function headers(extra = {}) {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${key()}`,
    ...extra,
  };
}

function err(status, body, headers_) {
  const h = headers_ || {};
  const rh = { 'retry-after': h['retry-after'] || h['Retry-After'] };
  const map = {
    401: () => new Error(`Jev 401: invalid or missing API key. Check JEV_AI_API_KEY.`),
    402: () => new Error(`Jev 402: insufficient balance or spending paused. Check account billing.`),
    422: () => new Error(`Jev 422: invalid request body, state, model, or questions. Correct before retrying.`),
    429: () => new Error(`Jev 429: rate limit hit. Retry after ${rh['retry-after'] || 'unknown'}s.`),
    502: () => new Error(`Jev 502: upstream service unavailable. Retry later.`),
    503: () => new Error(`Jev 503: model unavailable. Retry later.`),
    504: () => new Error(`Jev 504: gateway timeout. Retry later.`),
  };
  const e = map[status] ? map[status]() : new Error(`Jev ${status}: ${JSON.stringify(body)}`);
  e.status = status;
  e.body = body;
  e.headers = h;
  return e;
}

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers: headers(opts.headers),
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });
  const h = Object.fromEntries(res.headers.entries());
  if (!res.ok) {
    let body;
    try { body = await res.json(); } catch { body = {}; }
    throw err(res.status, body, h);
  }
  return { body: await res.json(), headers: h, status: res.status };
}

export async function callSystemone({ model = 'jev-latest', state, questions }, { signal } = {}) {
  if (!key()) throw new Error('JEV_AI_API_KEY is not configured.');
  const { body, headers: h } = await fetchJson(SYSTEMONE, {
    method: 'POST',
    body: { model, state, questions },
    signal,
  });
  return { model: body.model, answers: body.answers, usage: body.usage, runId: h['x-jev-run-id'] };
}

export async function getModels({ signal } = {}) {
  const { body } = await fetchJson(MODELS, { signal });
  return body.models || [];
}

export async function checkLayaModel(model, { signal } = {}) {
  if (!['laya-english', 'laya-multilingual'].includes(model)) return null;
  const models = await getModels({ signal });
  const found = models.find((m) => m.name === model);
  if (!found) throw new Error(`Model ${model} is not connected to your account. Check GET /api/v1/models.`);
  return found;
}

export { err };
