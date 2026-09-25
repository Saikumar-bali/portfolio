const inventorySections = [
  {
    id: 'inventory',
    eyebrow: 'the complete notebook',
    title: 'Work Inventory',
    intro: 'A copy-ready dump of everything shipped, verifiable via live URL, public repo, or artifact.',
  },
  {
    section: 'profile',
    eyebrow: 'profile / positioning',
    title: 'Saikumar Bali — Complete Work Inventory',
    intro: 'Versatile Automation Architect and Full-Stack Engineer with 3+ years of independent delivery across Fintech, AI integration, mobile development, DevOps, and cloud infrastructure. Architect of 20+ production systems. Every claim verifiable via live URL, public repo, or shipped artifact.',
    contact: [
      { icon: '📍', text: 'Andhra Pradesh, India' },
      { icon: '📧', text: 'saikumar@email.com' },
      { icon: '📱', text: '+91 78422 04844 (WhatsApp)' },
      { icon: '🌐', text: 'https://portfoliowebsite-ashen-two.vercel.app' },
      { icon: '⌥', text: 'https://github.com/saikumar-bali' },
    ],
  },
]

const jobTitles = [
  { title: 'Automation Architect', evidence: ['ERP Precision Automation Sniper', 'WhatsApp AI Automation Bot', 'Movie Mandir APK CI/CD', 'Telugu News Aggregator', 'SMS Interceptor App'] },
  { title: 'Full-Stack Engineer', evidence: ['AAGAM E-Commerce Monorepo', 'HippoClouds Website', 'Vaji News Platform', 'Patala Pustakam Bookstore'] },
  { title: 'AI Integration Engineer', evidence: ['ReelGenius AI', 'WhatsApp AI Automation Bot', 'AI Customer Support Bot', 'HFT Algo Suite', 'HippoClouds'] },
  { title: 'Fintech / Quantitative Developer', evidence: ['High-Frequency Algo Trading Suite', 'Public Grafana dashboard', 'VaR-based position sizing'] },
  { title: 'React Native Developer', evidence: ['Movie Mandir SDUI app', 'SMS Interceptor App'] },
  { title: 'DevOps / CI-CD Engineer', evidence: ['GitHub Actions APK pipeline', 'Grafana observability', 'Cloudflare Workers', 'Docker', 'TurboRepo'] },
  { title: 'Solutions Architect', evidence: ['3-app monorepo + NestJS gateway', 'Server-Driven UI engine', 'Hybrid edge + origin backend', 'Dual-layer automation'] },
  { title: 'Quantitative Developer', evidence: ['Multi-strategy HFT concurrency', 'Sub-500ms crash recovery', 'VaR-based sizing', 'Live Grafana P&L'] },
  { title: 'Cloud / Serverless Engineer', evidence: ['AWS', 'Cloudflare Workers', 'Supabase', 'Redis', 'Firebase', 'Netlify'] },
  { title: 'Technical Lead / Founding Engineer', evidence: ['Sole end-to-end ownership', '20+ production systems', '15+ deliveries 2022–Present'] },
]

const featuredProjects = [
  { name: 'High-Frequency Algo Trading Suite', proof: 'GitHub · Live Grafana Dashboard', type: 'Fintech engine', description: 'Production HFT engine executing multiple strategies across NSE, BSE, and MCX with crash recovery and live observability.', metrics: '<500ms crash recovery · 3 concurrent strategies · Live public dashboard', stack: 'Node.js · WebSocket · Supabase · Gemini AI · Grafana · AWS' },
  { name: 'AAGAM E-Commerce Monorepo', proof: 'GitHub', type: '3-app platform', description: 'Admin, Customer, and Rider apps synchronized through a centralized order-lifecycle finite state machine.', metrics: '3 client apps · TurboRepo monorepo · E2E type safety', stack: 'TypeScript · Next.js · NestJS · React Native · Socket.io · Prisma · PostgreSQL' },
  { name: 'Movie Mandir — SDUI Streaming Platform', proof: 'APK v1.0.1 · GitHub', type: 'SDUI mobile', description: 'React Native CLI app whose UI is driven by a remote JSON schema, allowing UI changes without app releases.', metrics: '<150ms UI latency · SDUI engine · Auto APK CI/CD · Shipped v1.0.1', stack: 'React Native CLI · TypeScript · Supabase Realtime · Cloudinary · GitHub Actions' },
  { name: 'ERP Precision Automation Sniper', proof: 'GitHub', type: 'Dual-layer automation', description: 'Attendance automation at 10:00:00.005 with geolocation spoofing and Cloudflare Worker + Playwright failover.', metrics: 'ms-level precision · Dual-layer redundancy · CF Workers primary', stack: 'Cloudflare Workers · Playwright · Python · GitHub Actions · Node.js' },
  { name: 'WhatsApp AI Automation Bot', proof: 'GitHub', type: 'Stealth automation', description: 'Selenium-based WhatsApp bot with Groq/Llama 3 responses and anti-bot detection bypass.', metrics: 'Stealth mode · Llama 3 LLM · Persistent session', stack: 'Python · Groq AI · Selenium · Llama 3' },
  { name: 'ReelGenius AI', proof: 'Live · GitHub', type: 'Client-side AI video', description: 'Browser-side AI video creator producing a synced MP4 reel from lyrics and music, zero server.', metrics: 'Gemini Flash AI · MP4 export · Zero server', stack: 'React · TypeScript · Gemini AI · Web Audio API · Canvas API · MediaRecorder' },
]

const additionalProjects = [
  { name: 'HippoClouds Website', type: 'Enterprise SaaS', proof: 'Live', stack: 'React, Framer Motion' },
  { name: 'JY Defence Academy', type: 'Educational portal', proof: 'Live', stack: 'React, TypeScript' },
  { name: 'CineVerse PWA', type: 'Discovery PWA', proof: 'Live', stack: 'React, Supabase' },
  { name: 'Patala Pustakam Bookstore', type: 'Hybrid e-commerce', proof: 'Live', stack: 'Next.js, CF Workers' },
  { name: 'Telugu News Aggregator', type: 'Serverless pipeline', proof: 'GitHub', stack: 'Svelte, Firebase' },
  { name: 'Vaji News Platform', type: 'SSR aggregator', proof: 'GitHub', stack: 'Next.js, Prisma' },
  { name: 'HippoCloud Elevate 3D', type: 'WebGL portal', proof: 'GitHub', stack: 'Three.js, R3F' },
  { name: 'SMS Interceptor App', type: 'Android native', proof: 'APK', stack: 'RN CLI, Kotlin' },
  { name: 'Bill Tracker', type: 'Expense tracker', proof: 'Live', stack: 'React, Node.js' },
  { name: 'AI Customer Support Bot', type: 'Chatbot', proof: 'GitHub', stack: 'Node.js, GPT, Redis' },
]

const skills = {
  languages: 'TypeScript · JavaScript · Python · Kotlin · HTML/CSS · SQL',
  frontend: 'React · Next.js · Svelte · Tailwind CSS · shadcn/ui · Framer Motion · Three.js / R3F · TanStack Router · Canvas API · Web Audio API',
  mobile: 'React Native CLI · Kotlin (Android native modules) · Broadcast Receivers · SDUI architecture',
  backend: 'Node.js · NestJS · Express · Prisma ORM · Socket.io · WebSocket · REST · Cloudflare Workers',
  data: 'PostgreSQL · Supabase · Redis · Firebase · Cloudinary',
  ai: 'Gemini AI (Flash) · Groq / Llama 3 · OpenAI GPT · Prompt engineering · LLM session memory · AI chatbot integration',
  automation: 'Selenium · Playwright · GitHub Actions · Netlify Functions · Cron pipelines · Browser automation · Anti-bot techniques',
  devops: 'Docker · AWS · Cloudflare (Workers, Pages, R2) · Vercel · Render · Netlify · Grafana · TurboRepo · CI/CD pipelines',
  architecture: 'Monorepo design (TurboRepo) · Server-Driven UI · Finite State Machines · Edge + origin hybrid · Dual-layer failover · Event-driven systems',
}

const achievements = [
  '20+ production systems architected and shipped independently',
  '10 live deployments publicly accessible',
  '9 public GitHub repositories',
  '2 shipped Android APKs (Movie Mandir, SMS Interceptor)',
  '1 public Grafana dashboard (live trading metrics)',
  'Sub-500ms crash recovery on HFT engine',
  'Sub-150ms UI latency on SDUI mobile app',
  '3 concurrent trading strategies running in parallel',
  '3 synchronized client apps in single monorepo',
  '20+ news sources scraped in one serverless pipeline',
  '−60% GLTF size via automated compression',
  'Millisecond-precision (10:00:00.005) automation accuracy',
  '15+ independent freelance deliveries 2022–Present',
]

const suggestedBullets = {
  automation: 'Designed and shipped a dual-layer automation system (Cloudflare Worker + Playwright) achieving millisecond-level (10:00:00.005) execution precision with automatic failover.',
  fintech: 'Built a crash-proof HFT engine handling 3 concurrent strategies across NSE/BSE/MCX with sub-500ms state recovery and public Grafana observability.',
  ai: 'Integrated Gemini Flash, Groq/Llama 3, and GPT into production features — including browser-side AI video generation with zero server dependency.',
  fullstack: 'Architected a 3-app e-commerce monorepo (Admin/Customer/Rider) with NestJS gateway, Socket.io real-time sync, and a centralized order-lifecycle finite state machine.',
  mobile: 'Engineered a Server-Driven UI streaming app in React Native CLI — entire UI rendered from remote JSON schema with sub-150ms latency and automated GitHub Actions APK releases.',
  devops: 'Automated full mobile release pipeline via GitHub Actions — from code commit to published APK with zero manual steps.',
  cloud: 'Deployed hybrid edge + origin architectures (Cloudflare Workers + Express) for cost-efficient, low-latency content delivery.',
  lead: 'Sole end-to-end owner of 20+ production systems — scoping, architecture, implementation, deployment, and monitoring across fintech, AI, mobile, and web.',
}

export { inventorySections, jobTitles, featuredProjects, additionalProjects, skills, achievements, suggestedBullets }

