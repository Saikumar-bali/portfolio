# Repo Content — Saikumar Bali Featured Projects

> Source: GitHub public REST API (`api.github.com`) and `raw.githubusercontent.com` fetched directly.
> Every field below was observed in a real fetch. Anything not fetched is marked "README not available" / "not fetched".
> Fetch date: 2026-09-25.

---

## 1. AAGAM E-Commerce Monorepo

- **Repo URL:** https://github.com/Saikumar-bali/AAGAM_E-commerce
- **Default branch:** `main`
- **Language:** TypeScript
- **Homepage:** https://aagaam.in
- **Description:** *Not set on GitHub (repo `description` is `null`, `topics` is empty).* Local portfolio copy describes it as a production-grade e-commerce monorepo hosting Admin / Customer / Rider apps over a shared NestJS backend.
- **Size:** 163,696 KB (~163 MB) · **Open issues:** 28 · **Forks:** 1 · **Stars:** 0
- **Created:** 2026-04-18 · **Last pushed:** 2026-09-23 · **GitHub Pages:** enabled

**README status:** `README.md` at root returns **404 — README not available**. Content below is taken from real root files that *do* exist: `AGENTS.md`, `FINAL_SUMMARY.md`, `package.json`, `turbo.json`, `.github/workflows/deploy.yml`, and the root contents listing.

### Architecture / Structure (root contents API listing)

```
AAGAM_E-commerce/
├── .Jules/  .devcontainer/  .github/  .zcode/      (tooling dirs)
├── .env.example (3,380 B)  .env.production.example (3,273 B)
├── AGENTS.md (5,832 B)  AI_BRAIN.md  ANDROID_UPDATE_PLAN.md
├── FINAL_SUMMARY.md (9,836 B)  PHASE-3-PROOF.md
├── SETUP_COMPLETE.txt (11,162 B)  SETUP_STATUS.md (7,633 B)
├── apps/
│   ├── admin-dashboard/      (Next.js)
│   ├── api-gateway/          (NestJS — owns most business logic + tests)
│   ├── mobile-customer/      (Expo / React Native)
│   ├── mobile-partners/      (Expo / React Native)
│   └── worker-service/
├── packages/
│   ├── database/  (Prisma schema + migrations)
│   ├── mobile-shared/  ├── types/  ├── ui/  ├── utils/
├── automations/  deployment/  docs/  production/  scripts/  tests/
├── codespace-start.sh  create-admin.js  deploy.sh (20,731 B)
├── ecosystem.config.js (PM2)  railpack.admin.json  start_tunnel.bat
├── package.json (4,977 B)  package-lock.json (916,360 B)
├── turbo.json (202 B)  tsconfig.json
└── .github/workflows/: ci.yml, deploy.yml, android-apk-release.yml,
                        dependency-security-audit.yml, trigger-coderabbit.yml
```

`docs/` alone contains **60+ architecture/phase docs**, incl. `DELIVERY_DOMAIN_STATE_MACHINE.md`, `NOTIFICATION_OUTBOX_ARCHITECTURE.md`, `PARTNER_ONBOARDING_ARCHITECTURE.md`, `VERIFICATION_V1_ARCHITECTURE.md`, `DEPLOYMENT_RUNBOOK.md`, `PROFESSIONAL_ECOMMERCE_ROADMAP.md`, phases 1–17, plus `qa/`, `cli-ai/`, `ai-runs/` dirs.

### Features (from AGENTS.md + FINAL_SUMMARY.md)

- npm-workspaces **monorepo**: 5 apps + 6 packages, orchestrated by **Turborepo** with task caching and parallel builds.
- **3 client apps on 1 backend** (Admin, Customer, Rider/Partners) sharing `@aagam/types`, `@aagam/utils`, `@aagam/database`, `@aagam/ui`.
- **Subscription money is derived, not read raw** — `reconcileSubscriptionBalance()` in `apps/api-gateway/src/subscriptions/subscription-balances.ts` treats the ledger as a floor and absorbs day-cell cash drift (31-Day Matrix / Nookalamma bug called out explicitly).
- **Idempotent SQL migrations** (`ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `DO $$ ... EXCEPTION WHEN duplicate_object`) so `prisma migrate deploy` survives manually-applied DDL.
- **Test matrix**: `test:ci`, `test:api-smoke`, phase suites 6/8/9/10/11/12, ETA lifecycle simulation, Maestro mobile E2E (`customer/`, `partners/`), k6 + Artillery load tests (API, checkout, rider WebSocket throughput, campaigns), Lighthouse CI, inventory/promotions/partner/rider E2E.
- **Security hardening scripts**: `patch-image-size-cves.js`, `test-image-size-cve-patch.js`, `test-google-uuid-security-override.js`, `verify-dependency-security.js`, `dependency-security-audit.yml` workflow.
- **OpenHands automation API** integration — `automations/*.json` payloads posted to `/api/automation/v1/preset/prompt|plugin`, JMESPath event filters, `timeout` capped at **1800 s**; a second GitHub Actions path was deliberately removed after it falsely reported success.
- Admin dashboard: **51 compiled pages**, Next.js 14.1.0 / React 19.

### Tech Stack (from package.json + FINAL_SUMMARY.md table)

| Layer | Tech (version observed) |
|---|---|
| Monorepo | npm workspaces (`npm@11.6.1`), **Turborepo `^2.10.7`** |
| Language | TypeScript (strict), Node 24.16.0 locally / **Node 22.22.3 in deploy CI** |
| Backend | **NestJS 11.1.28** (`@nestjs/common|core|platform-express|platform-socket.io|websockets` pinned via `overrides`), Socket.io |
| Frontend | **Next.js 14.1.0**, React **19**, Tailwind CSS |
| Mobile | Expo / React Native, `react-native-dotenv` |
| ORM / DB | **Prisma 5.22.0**, **PostgreSQL 18** (CI uses `postgres:15-alpine` in Docker on port 5433) |
| Maps | `mapbox-gl ^3.29.0`, Google Maps keys wired in deploy |
| Testing | Playwright `^1.61.1`, Jest, k6, Artillery, Lighthouse CI, Maestro |
| Other pinned | `fast-xml-parser 5.10.1`, `reflect-metadata 0.2.2`, `rxjs 7.8.2`, `postcss 8.5.23`, `sharp 0.35.3`, uuid override `11.1.1` |
| Runtime | PM2 (`ecosystem.config.js`), `ensure-pm2-node22-runtime.sh` |

### Deployment details (from `.github/workflows/deploy.yml` + scripts)

- **Pipeline:** `CI` → on success of `main` → `Deploy production` (`workflow_run`), plus `workflow_dispatch` with an explicit `ref` input.
- **Concurrency:** group `production-deploy`, `cancel-in-progress: false`; job `timeout-minutes: 45`; GitHub Environment `production`.
- **Mechanism:** SSH to a self-hosted server (`DEPLOY_HOST`/`DEPLOY_USER`/`DEPLOY_PORT`/`DEPLOY_PATH` vars + `DEPLOY_SSH_PRIVATE_KEY`, `DEPLOY_KNOWN_HOSTS` secrets) → git clone/reset to the exact `DEPLOY_SHA` → run server-side `deploy.sh`.
- **Guard rails:** refuses to deploy a commit not contained in `origin/main`; validates `DEPLOY_PORT` range; rejects `DEPLOY_PATH` of `/`, `/home`, `/root`, `/opt`, `/var`, `/usr`; requires `PRODUCTION_URL` to match `https://…`; runs `validate-prod-env.js` before deploy.
- **Secrets injected:** Firebase service account, WhatsApp Business Graph (access token, phone number ID, OTP template, webhook verify token, app secret), Mapbox + Google Maps tokens.
- **Post-deploy verification:** 30 × 5 s poll of the public frontend plus `/api/health`, asserting `status === "ok"` **and** `revision === DEPLOY_SHA` (exact-revision proof).
- Other workflows: `ci.yml` (DB seed step, 60-second API health check, 2-second stabilization, `NODE_ENV=test`), `android-apk-release.yml`, `dependency-security-audit.yml`.
- Local/dev evidence (FINAL_SUMMARY.md): API on `http://localhost:3005` (NestJS, `/health`), Admin on `http://localhost:3001`, PostgreSQL 18 on `5432` DB `aagam_ecom`, **7 seeded test users**, "700+ npm dependencies", setup completed in ~30 minutes on 2026-07-16.

### Metrics / numbers observed

- 163 MB repo · 28 open issues · 1 fork · 5 apps · 6 packages · 51 admin pages · 60+ docs · 7 test accounts · 700+ deps · 45-min deploy job · 30-attempt health poll · 1800 s automation cap · NestJS 11.1.28 · Prisma 5.22.0 · Next.js 14.1.0 · Node 22.22.3 (CI).

---

## 2. HFT Algo Trading — `master_controller`

- **Repo URL (as linked by the portfolio):** https://github.com/saikumar-bali/master_controller
- **Correct repo URL found:** **NONE — the repository does not exist publicly.**

### What was checked (all real API calls)

| Check | Result |
|---|---|
| `GET /repos/saikumar-bali/master_controller` | **HTTP 404** |
| `GET /users/Saikumar-bali/repos?per_page=100&page=1` | 19 repos returned (the user has **19 public repos total** per profile API) |
| `GET /users/Saikumar-bali/repos?per_page=100&page=2` | **empty array** |
| Name scan of all 19 repos for `master`, `trading`, `algo`, `controller`, `stock`, `nse`, `hft` | **no match** |
| `GET /search/repositories?q=user:Saikumar-bali+trading` | 0 items |
| `GET /search/repositories?q=user:Saikumar-bali+algo` | 0 items |
| `GET /search/repositories?q=user:Saikumar-bali+master` | 0 items |
| `GET /search/repositories?q=user:Saikumar-bali+hft` | 0 items |
| `GET /search/repositories?q=user:Saikumar-bali+stock` | 0 items |
| `GET /search/repositories?q=user:Saikumar-bali+controller` | 0 items |
| `GET /search/repositories?q=master_controller+in:name+trading` (global) | 0 items |
| `GET /search/repositories?q=master_controller+in:name+hft` (global) | 0 items |
| `GET /search/users?q=saikumar+bali` | only `Saikumar-bali` (no alternate account) |
| `GET /users/Saikumar-bali/events/public` | only `Saikumar-bali/AAGAM_E-commerce` — no rename/delete events visible |
| Global `q=master_controller` | only unrelated third-party repos |

**Conclusion:** `saikumar-bali/master_controller` is either **private or deleted**. It is not a casing/renaming issue (GitHub URLs are case-insensitive; `Saikumar-bali/master_controller` also 404s). Two other portfolio-linked repos also 404: `Saikumar-bali/chat_bot` and `Saikumar-bali/hippocloud-elevate`.

- **Default branch:** README not available (repo 404)
- **Language / Homepage / Description / topics:** README not available (repo 404)
- **Size / forks / open issues / created / pushed:** unavailable (repo 404)

### Architecture / Structure

README not available. No file or folder listing obtainable.

The **only** verifiable public surface is the portfolio copy in the local repo (`src/config/portfolioContent.js:25-28`) plus a live Grafana dashboard:

- Description: "Production HFT engine executing multiple strategies across NSE, BSE, and MCX — with crash recovery, a live Grafana dashboard, and Telegram commands like `/livepnl` for on-the-go P&L."
- GitHub link: `https://github.com/saikumar-bali/master_controller` (**404**)
- Live link: `https://saikumarbali55.grafana.net/public-dashboards/e7c3902f059b44128b326eb17fb2cf4d`
- Related portfolio references: `platformsContent.js` — "Hosts the HFT trading engine"; `inventoryContent.js` — "HFT Algo Suite"; `server/jev-client.test.js` — "Built a crash-proof HFT engine".

### Features / Tech Stack / Deployment / Metrics

**Not available from GitHub — repo is private/deleted.** No README, no `package.json`, no contents listing could be fetched.

---

## 3. Movie Mandir

- **Repo URL:** https://github.com/Saikumar-bali/movie_mandir
- **Default branch:** `main`
- **Language:** JavaScript (repo API) — sources are a JS/TS mix (`App.tsx`, `tsconfig.json` present)
- **Homepage:** *(empty — no homepage set)*
- **Description:** "React Native movie streaming app with Supabase backend and Cloudinary media"
- **Topics:** `android`, `cloudinary`, `mobile-app`, `movie-streaming`, `react-native`, `supabase`
- **Size:** 2,961 KB · **Open issues:** 1 · **Forks:** 0 · **Stars:** 0
- **Created:** 2026-02-03 · **Last pushed:** 2026-09-01

**README status:** ✅ **Fetched successfully** — `raw.githubusercontent.com/Saikumar-bali/movie_mandir/main/README.md` (3,107 B).

### Architecture / Structure (root contents API listing)

```
movie_mandir/
├── .bundle/  .github/workflows/android-build.yml  .eslintrc.js  .prettierrc.js
├── App.tsx  AppNavigator.js  index.js  app.json  babel.config.js
├── metro.config.js  jest.config.js  tsconfig.json  .watchmanconfig
├── android/  ios/  assets/
├── src/
│   ├── api/  assets/  components/  config/  screens/  services/  tasks/  types/
├── __tests__/  scripts/  analyze-imports.js
├── supabase_setup.sql (971 B)   ← creates app_config + support_messages, enables Realtime
├── patch-rn-fetch-blob.js  (postinstall patches)
├── .env.example (1,096 B)  Gemfile  package.json  package-lock.json (515,741 B)
└── README.md (3,107 B)
```

### Features (verbatim from README)

- **Video Streaming** — seamless playback via `react-native-video`.
- **Modern UI** — category filtering + deep details for Movies and Series.
- **Secret Channel (SDUI)** — hidden dashboard opened by a long-press on the header, controlled entirely from the server (Supabase).
- **Live Support** — real-time chat with admins via Supabase Realtime.
- **Secured Content** — passcode-locked images and videos inside the secret channel.
- **Cloudinary Optimized** — high-performance media serving with dynamic transformations.
- **Server-Driven UI engine** — the Secret Channel's whole layout is a JSON row in the `app_config.layout` column; changing it re-skins the screen instantly.
- **Auto-build** — GitHub Action attempts an unsigned Release APK on every push to `main`.

### Tech Stack (from README + package.json)

- **Frontend:** React Native **0.82.0**, React **19.1.1**, TypeScript **^5.8.3**, Node `>=20`
- **Navigation:** `@react-navigation/native ^7.1.22`, `@react-navigation/stack ^7.6.8`
- **Backend/DB:** Supabase — `@supabase/supabase-js ^2.93.3` (PostgreSQL + Realtime), `react-native-url-polyfill`
- **Media:** Cloudinary; `react-native-video ^6.18.0`; `react-native-blob-util`, `react-native-fs`
- **UI/UX:** `@fortawesome/*`, `react-native-reanimated ^4.2.0`, `react-native-worklets`, `react-native-gesture-handler`, `react-native-svg ^15.15.1`, `react-native-webview ^13.16.0`, `react-native-orientation-locker`, `@react-native-community/slider`
- **Device/ops:** `react-native-device-info`, `react-native-permissions`, `react-native-background-fetch`, `react-native-background-timer`, `react-native-intent-launcher`, `@react-native-community/netinfo`, `@react-native-async-storage/async-storage`
- **HTTP:** `axios ^1.13.2`
- **Testing/Quality:** Jest `^29.6.3`, `react-test-renderer 19.1.1`, ESLint (`@react-native/eslint-config 0.82.0`), Prettier 2.8.8

### Deployment details

- **CI:** `.github/workflows/android-build.yml` — GitHub Actions auto-builds an **unsigned Release APK on every push to `main`**; artifacts land in the Actions tab. Play Store signing requires Android Signing Secrets.
- **Manual Android build:** `cd android && ./gradlew assembleRelease` → `android/app/build/outputs/apk/release/app-release.apk`
- **Env setup:** copy `src/config/env.example.js` → `src/config/env.js` with `SUPABASE_URL`, `SUPABASE_ANON_KEY`, etc.
- **DB bootstrap:** run `supabase_setup.sql` in the Supabase SQL Editor (creates `app_config`, `support_messages`, enables Realtime).
- **Run:** `npx react-native run-android` / `run-ios`.
- **SDUI example layout JSON from README:** `[{"type":"text","text":"VIP Dashboard","style":"h1"},{"type":"slider","images":[...],"interval":3000,"height":200},{"type":"chat","title":"Admin Help"}]`

### Metrics / numbers observed

- React Native 0.82.0 · React 19.1.1 · supabase-js 2.93.3 · slider interval 3000 ms · 2 Supabase tables · 6 topics · 1 open issue · 0 forks · repo 2,961 KB.

---

## 4. WhatsApp AI Automation (GrokWA-Auto)

- **Repo URL:** https://github.com/Saikumar-bali/whatsapp-ai-automation
- **Default branch:** `main`
- **Language:** Python
- **Homepage:** *(empty)*
- **Description:** "An intelligent WhatsApp automation tool built in Python that uses the Groq AI model to generate human-like responses and simulate natural conversations on WhatsApp Web."
- **Topics:** `ai-bot`, `automation`, `fastapi`, `grok`, `python`, `selenium`, `whatsapp`, `whatsapp-automation`
- **Size:** 24,556 KB · **Open issues:** 0 · **Forks:** 0 · **Stars:** 0
- **Created:** 2026-02-03 · **Last pushed:** 2026-02-07

**README status:** ✅ **Fetched successfully** — `raw.githubusercontent.com/Saikumar-bali/whatsapp-ai-automation/main/README.md`.

### Architecture / Structure (root contents API listing + README "Project Structure")

```
whatsapp-ai-automation/
├── main.py            ← entry point: starts bot + FastAPI server
├── ai_engine.py       ← Groq model interactions, Ollama fallback
├── whatsapp_client.py ← Selenium interactions with WhatsApp Web
├── humanizer.py       ← human-like typing + delays
├── find_profiles.py
├── test_groq.py
├── config.yaml        ← central config (app, browser, ai, humanizer, memory)
├── requirements.txt   ← Python deps
├── setup.sh
├── data/  logs/  user_data/  __pycache__/
└── README.md
```

*(No `.github/workflows` — no CI directory in the listing.)*

### Features (verbatim from README)

- **AI-Powered Responses** — uses Groq's language model to generate replies.
- **Human-like Typing** — simulates human typing speed, occasional typos + corrections, and **circadian rhythms** for realistic interaction delays.
- **WhatsApp Web Automation** — reads incoming messages and sends responses directly on WhatsApp Web.
- **Configurable** — `config.yaml` + environment variables.
- **FastAPI dashboard** — served at `http://localhost:8085` with basic status and **live logs**.
- **Session persistence** — `user_data/` dir keeps the WhatsApp Web login so QR rescan isn't needed every run.
- **Local LLM fallback** — Ollama when the cloud key is unavailable.

### Tech Stack (from `requirements.txt` + `config.yaml` + README)

- **Language:** Python **3.8+**
- **AI:** Groq API, model **`llama-3.3-70b-versatile`**; fallback Ollama local model **`mistral`** at `http://localhost:11434/api/generate`
- **Browser automation:** Selenium + `webdriver-manager` (Google Chrome required, `headless: false` for the QR scan)
- **Web/dashboard:** FastAPI (dashboard on port **8085**)
- **NLP/parsing:** `beautifulsoup4`
- **Config:** `pyyaml`, `python-dotenv`, `requests`
- **Logging:** `loguru` (`LOG_LEVEL=INFO`)
- **Deps (exact list):** `openai`, `loguru`, `selenium`, `webdriver-manager`, `beautifulsoup4`, `pyyaml`, `requests`, `python-dotenv`

### Deployment details

- Run: `python main.py` → launches Chrome, navigates to WhatsApp Web, starts the automation loop; scan QR on first login.
- Env: `.env` with `GROK_API_KEY` (from https://console.groq.com/docs/api-keys) and `LOG_LEVEL=INFO`.
- Install: `python -m venv venv` → activate → `pip install -r requirements.txt`; helper `setup.sh` included.
- Config: `config.yaml` (model, humanizer params, browser settings, proxy support).
- No GitHub Actions workflow present.

### Metrics / numbers observed (from `config.yaml`)

- App name **GrokWA-Auto**, **version 2.0**, `debug: true`
- Humanizer: **60 WPM**, **typo_rate 0.04 (4%)**, `circadian_rhythm: true`, response delay **2–10 seconds**
- Model `llama-3.3-70b-versatile`; fallback `mistral` via Ollama; `fallback_enabled: true`
- Memory: `chroma_db` (Chroma path) + `sqlite:///./app.db`
- System prompt enforces **Tanglish** (Telugu words in Latin script), casual/lowercase style
- Dashboard port **8085** · Python 3.8+ · repo 24,556 KB · 0 open issues · 0 forks

---

## 5. ERP Automation — Hippo ERP Bot (condensed, README already in hand — not refetched)

- **Repo URL:** https://github.com/Saikumar-bali/erp_automation_bot
- **Default branch:** `master`
- **Language (repo API):** JavaScript — GitHub's language stats are dominated by `attendance.js` / `worker.js`, but the **README and `src/auto_attendance.py` are Python**
- **Homepage:** *(empty)*
- **Description:** "ERP Attendance Automation Bot. A Python-based automation bot that logs into ERP systems and automatically marks employee attendance using browser automation, geolocation simulation, logging, and scheduled execution."
- **Topics:** `attendance`, `automation`, `browser-automation`, `erp`, `python`, `task-scheduler`
- **Size:** 97 KB · **Open issues:** 1 · **Forks:** 2 · **Stars:** 0
- **Created:** 2026-02-04 · **Last pushed:** 2026-09-13

**README status:** Already held locally (per task instructions — not refetched). Condensed from that description: **"Hippo ERP Bot — Precision Attendance Automation."**

### Architecture / Structure (root contents API listing — fetched)

```
erp_automation_bot/
├── .github/workflows/  erp-task-sync.yml, scheduled-attendance.yml
├── README.md, WORKFLOW.md
├── attendance.js, worker.js          (Cloudflare Workers primary layer)
├── src/auto_attendance.py            (Python automation)
├── check_logs.py
├── package.json, package-lock.json
├── scripts/  data/  docs/
└── .gitignore
```

### Features (condensed from the README already provided)

- **Dual-layer architecture:** **Cloudflare Workers** as the primary execution layer, **GitHub Actions + Playwright** as the secondary failover layer.
- **Precision Sniper** — the targeted attendance-marking routine.
- **Pre-warm cron:** `29 4 * * MON-SAT` (04:29, Mon–Sat) to warm the session before the attendance window.
- **Dashboard** for run status/monitoring.
- **Geolocation spoofing** to satisfy ERP location checks.
- **Multi-user** support.
- **Logging** and **scheduled execution** (per repo description).

### Tech Stack

- Python (automation core: `src/auto_attendance.py`, `check_logs.py`)
- Cloudflare Workers (primary layer: `worker.js`, `attendance.js`)
- GitHub Actions + Playwright (secondary layer; workflows `scheduled-attendance.yml`, `erp-task-sync.yml`)
- Node.js tooling (`package.json` / lockfile)

### Deployment details

- **Cron:** `29 4 * * MON-SAT` pre-warm job.
- **CI:** two GitHub Actions workflows — `scheduled-attendance.yml` (scheduled run) and `erp-task-sync.yml` (task sync).
- **Failover:** Workers primary → Actions/Playwright secondary.

### Metrics / numbers observed

- Cron `29 4 * * MON-SAT` · 2 forks · 1 open issue · repo 97 KB · created 2026-02-04 · last pushed 2026-09-13 · 6 topics.

---

## Appendix — fetch log

| # | Endpoint | Result |
|---|---|---|
| 1 | `api.github.com/repos/Saikumar-bali/AAGAM_E-commerce/contents/` | ✅ 35 root entries |
| 2 | `raw…/AAGAM_E-commerce/main/package.json` | ✅ full file |
| 3 | `raw…/AAGAM_E-commerce/main/turbo.json` | ✅ full file |
| 4 | `raw…/AAGAM_E-commerce/main/README.md` | ❌ 404 — README not available |
| 5 | `raw…/AAGAM_E-commerce/main/AGENTS.md` | ✅ full file |
| 6 | `raw…/AAGAM_E-commerce/main/FINAL_SUMMARY.md` | ✅ full file |
| 7 | `raw…/AAGAM_E-commerce/main/.github/workflows/deploy.yml` | ✅ full file |
| 8 | `api…/AAGAM_E-commerce/contents/{.github,workflows,apps,packages,docs}` | ✅ all |
| 9 | `api.github.com/users/Saikumar-bali/repos?per_page=100&page=1` | ✅ 19 repos |
| 10 | `api.github.com/users/Saikumar-bali/repos?per_page=100&page=2` | ✅ empty |
| 11 | `api.github.com/users/Saikumar-bali` (profile) | ✅ `public_repos: 19` |
| 12 | `api.github.com/repos/saikumar-bali/master_controller` | ❌ 404 |
| 13 | `api…/search/repositories?q=user:Saikumar-bali+{trading,algo,master,hft,stock,controller}` | ✅ 0 items each |
| 14 | `api…/search/repositories?q=master_controller+in:name+{trading,hft}` | ✅ 0 items each |
| 15 | `api…/search/users?q=saikumar+bali` | ✅ 1 result: `Saikumar-bali` |
| 16 | `api…/users/Saikumar-bali/events/public` | ✅ only AAGAM activity |
| 17 | `raw…/movie_mandir/main/README.md` | ✅ 3,107 B |
| 18 | `api…/movie_mandir/contents/` | ✅ 30 entries |
| 19 | `raw…/movie_mandir/main/package.json` | ✅ full file |
| 20 | `api…/movie_mandir/contents/{.github/workflows,src}` | ✅ |
| 21 | `raw…/whatsapp-ai-automation/main/README.md` | ✅ full file |
| 22 | `api…/whatsapp-ai-automation/contents/` | ✅ 15 entries |
| 23 | `raw…/whatsapp-ai-automation/main/requirements.txt` | ✅ 8 deps |
| 24 | `raw…/whatsapp-ai-automation/main/config.yaml` | ✅ full file |
| 25 | `api…/erp_automation_bot/contents/` + `src/` + `.github/workflows/` | ✅ structure only (README not refetched by instruction) |
