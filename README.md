# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Jev AI Decision API Integration

The project integrates the Jev AI decision API via a server-side middleware (`server/`) mounted on the Vite dev and preview servers. This keeps `JEV_AI_API_KEY` out of the browser. The browser calls `/api/jev/*`; the middleware proxies to `https://jev-ai.pro/api/v1`.

### Files

- `server/jev-client.js` — typed client: `callSystemone()`, `getModels()`, `checkLayaModel()`. Handles noul/choice/score answers, 401/402/422/429/502/504 errors, and Retry-After for 429.
- `server/index.js` — Vite plugin (`jevMiddleware()`). Mounts `/api/jev/systemone` (POST) and `/api/jev/models` (GET) on the dev/preview server.
- `server/jev-client.test.js` — focused tests with mocked API responses. Run with `npm test`.

### Configure locally

Create `.env` in the project root (add `.env` to `.gitignore`):

```
JEV_AI_API_KEY=sk-...
```

Never commit this file or the key. Do not put it in browser code, logs, or chat.

### Configure in deployment

Set `JEV_AI_API_KEY` as a server environment variable on whatever host runs the server:

- **Vite dev/preview**: the same `.env` works when the server process starts; for a container or host, set the env var there.
- **Node server** (if deploying the `server/` handler separately): `JEV_AI_API_KEY` must be in the runtime environment.
- **Static hosting + functions** (Vercel/Netlify/Cloudflare): put the handler under the platform's functions directory and set the env var in the platform dashboard.

### Make one minimal live call and verify

With `JEV_AI_API_KEY` configured, start the dev server:

```
npm run dev
```

Then call the proxied endpoint from the browser or curl:

```bash
curl -X POST http://localhost:5173/api/jev/systemone \
  -H "Content-Type: application/json" \
  -d '{"model":"jev-latest","state":"My payment failed. Please help.","questions":{"urgent":{"type":"noul","instructions":"Does this message need urgent support?"}}}'
```

Verify the returned answers and usage:

- `answers.urgent.noul` — a 0–1 probability of yes.
- `usage.input_tokens` / `usage.output_tokens` — token counts.
- `model` — the resolved model name.

### Check connected models

```bash
curl http://localhost:5173/api/jev/models
```

Returns only models connected to your account. Use this to confirm `laya-english` or `laya-multilingual` availability before calling them (Laya English = 512 total tokens per question; Multilingual = 1,024).

### Run tests

```
npm test
```
