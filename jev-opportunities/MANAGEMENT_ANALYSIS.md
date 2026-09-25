# Portfolio Management — Impressive Features & TypeSafe Jev Enhancement Plan

## Complete Inventory of Impressive Management Features

---

## 1. 📋 WorkInventory Management System

**File**: `src/components/ui/Inventory/WorkInventory.jsx` + `src/config/inventoryContent.js`

### What's Impressive
- **Dynamic expandable rows** with `useState` toggle — 100+ portfolio items managed through collapsible sections
- **Multi-category inventory**: Job titles, featured projects, additional projects, skills, achievements, suggested bullet phrases
- **Data-driven rendering**: All content comes from `inventoryContent.js` config — zero hardcoded UI sections
- **Hierarchical structure**: 9 job roles with evidence lists, 5 featured projects with full metadata, 11 additional projects
- **Suggested bullet phrasings**: Role-specific resume bullets auto-generated from config
- **Skills grid**: 8 categories with 6-10 skills each, rendered as interactive tag groups

### Current Architecture
```js
const { inventorySections, jobTitles, featuredProjects, additionalProjects, skills, achievements, suggestedBullets } = inventoryContent.js

// WorkInventory.jsx maps these to CollapsedRow components
// Each CollapsedRow is independently expandable
// BulletList renders achievements and suggested bullets
```

### Jev Enhancement Opportunities

#### 1A: Smart Job Title Matching for Resume Search
**Problem**: When a recruiter searches for "fintech developer", the system currently does exact string matching. It can't find the `Fintech / Quantitative Developer` role from a query about "quant" or "trading".

**Jev Solution**: Use **Choice** primitive to classify job title queries into the 9 role categories.
```js
// State
{ query: "I need someone for trading", availableRoles: ["Automation Architect", "Full-Stack Engineer", "AI Integration Engineer", ...] }

// Questions
{
  best_role: {
    type: 'choice',
    instructions: 'Which job role best matches this search query?',
    criteria: Object.fromEntries(jobTitles.map(t => [t.title, t.title])),
  },
  relevance: { type: 'score', instructions: 'How relevant is this match?', criteria: ['No match', 'Somewhat relevant', 'Strong match'] }
}
```

#### 1B: Auto-Suggested Bullet Phrase Selection
**Problem**: `suggestedBullets` has 8 role-specific bullets. The system doesn't adapt to the visitor's interests or the job they're applying for.

**Jev Solution**: Use **Choice** to select the most impactful bullet for a given job posting, and **Score** to rank all bullets.
```js
// State
{ visitorRole: "fintech recruiter", jobDescription: "Looking for quant developer", allBullets: suggestedBullets }

// Questions
{
  top_bullet: { type: 'choice', criteria: Object.fromEntries(Object.entries(suggestedBullets).map(([k, v]) => [k, v])) },
  confidence: { type: 'noul', instructions: 'Is this bullet highly relevant to the job posting?' }
}
```

#### 1C: Achievement Priority Ranking
**Problem**: `achievements` array is static. All 14 achievements have equal weight regardless of the visitor's interests.

**Jev Solution**: Use **Score** to rank achievements by relevance to a specific job type.
```js
// State
{ jobType: "fintech", achievements: [...achievements array...] }

// Questions
{
  achievement_priority: { type: 'score', instructions: 'How relevant is this achievement to the target job?', criteria: ['Not relevant', 'Somewhat relevant', 'Highly relevant', 'Must-have'] }
}
```

#### 1D: Skill Gap Detection
**Problem**: The skills grid shows all skills equally. It doesn't highlight which skills match a specific job posting.

**Jev Solution**: Use **Noul** to detect skill relevance and **Choice** to highlight key skills.
```js
// Questions
{
  key_skills: { type: 'choice', instructions: 'Which skills are most important for this role?', criteria: Object.fromEntries(skillsEntries) },
  missing_skills: { type: 'noul', instructions: 'Does this person have gaps in skills needed for this role?' }
}
```

---

## 2. 🤖 Automation Management System

**File**: `src/components/ui/AutomationSection.jsx` + `src/config/githubContent.js`

### What's Impressive
- **40+ workflows across 8 repos** managed through `automationStats`
- **10 story beats** in a scroll-tracked vertical timeline with keyboard navigation
- **4 GitHub achievements** with badge images and metadata
- **4 featured agents** (PR autofix, judge bot, UX redesign, crash-to-issue)
- **Multi-kind support**: `agent`, `watch`, `ship`, `cron` event types
- **Animated scroll tracking**: `IntersectionObserver`-based progress through automation story
- **`StageVisual` component** handles 3 rendering modes: sheet frames, images, and panels

### Current Architecture
```js
const { achievements, storyBeats, automationStats, featuredAgents } = githubContent.js

// AutomationSection.jsx:
// - scroll-track with IntersectionObserver
// - StoryStage with keyboard navigation
// - AchievementsStrip with badge images
// - FeaturedAgents with proof links
```

### Jev Enhancement Opportunities

#### 2A: Story Beat Relevance Ranking
**Problem**: The 10 story beats are shown in a fixed order. Visitors see all beats equally regardless of their interests.

**Jev Solution**: Use **Score** to rank story beats by relevance to the visitor's role/interests.
```js
// State
{ visitorInterest: "automation", storyBeats: [10 beats], visitorRole: "devops engineer" }

// Questions
{
  beat_relevance: { type: 'score', instructions: 'How relevant is this automation story to this visitor?', criteria: ['Not relevant', 'Somewhat relevant', 'Very relevant', 'Must-see'] }
}
```

#### 2B: Agent Discovery & Priority
**Problem**: `featuredAgents` shows all 4 agents equally. A visitor interested in PR automation might want to see the PR autofix agent first.

**Jev Solution**: Use **Choice** to identify the most relevant agent, **Score** to rank all agents.
```js
// Questions
{
  priority_agent: { type: 'choice', instructions: 'Which agent is most relevant to this visitor?', criteria: Object.fromEntries(featuredAgents.map(a => [a.name, a.purpose])) },
  agent_interest: { type: 'noul', instructions: 'Is this agent worth investigating further?' }
}
```

#### 2C: Achievement Badge Relevance
**Problem**: All 4 GitHub achievements are shown equally. A visitor from fintech might care more about "Quickdraw" than "Pair Extraordinaire".

**Jev Solution**: Use **Score** to rank achievements by visitor role relevance.
```js
// Questions
{
  achievement_priority: { type: 'score', instructions: 'How impressive is this achievement for the visitor?', criteria: ['Not impressive', 'Somewhat', 'Very impressive', 'Exceptional'] }
}
```

#### 2D: Automation Workflow Health Classification
**Problem**: The system shows all workflows as successful. It doesn't classify which workflows might have issues or need attention.

**Jev Solution**: Use **Noul** to detect workflow health signals, **Score** to assess risk.
```js
// Questions
{
  workflow_health: { type: 'noul', instructions: 'Does this workflow show signs of instability or failure?' },
  workflow_risk: { type: 'score', instructions: 'What is the risk level of this workflow?', criteria: ['Healthy', 'Minor issues', 'At risk', 'Critical'] }
}
```

---

## 3. 🧭 Navigation & Section Management

**File**: `src/hooks/useScene.js` + `src/hooks/useActiveSection.js` + `src/context/SceneContext.jsx` + `src/components/ui/NavigationUI.jsx`

### What's Impressive
- **IntersectionObserver-based section tracking**: Detects which section is visible with `rootMargin: '-38% 0px -48% 0px'`
- **Hash sync**: Syncs navigation state with URL hash for deep linking
- **Smooth scroll navigation**: `navigateTo()` with `prefers-reduced-motion` support
- **Active section highlighting**: Navigation links highlight based on current viewport section
- **Context-based state**: `SceneContext` provides `activeSection`, `setActiveSection`, `navigateTo`, `transitioning` to all components
- **Keyboard navigation**: Arrow keys for story beats

### Current Architecture
```js
// SceneContext.jsx: React Context with useState + useMemo
// useScene.js: useContext hook
// useActiveSection.js: IntersectionObserver with hash sync
// NavigationUI.jsx: Renders nav links with active state
```

### Jev Enhancement Opportunities

#### 3A: Visitor Intent Classification for Section Routing
**Problem**: The navigation shows all 5 sections in order. A visitor looking specifically for "automation" has to scroll through everything.

**Jev Solution**: Use **Choice** to classify visitor intent and route them to the most relevant section.
```js
// State
{ pageVisitDuration, sectionsViewed, referrer, visitorBehavior: { scrollDepth, timeOnPage } }

// Questions
{
  primary_intent: { type: 'choice', instructions: 'What is the visitor primarily looking for?', criteria: { work: 'Viewing projects', automation: 'Interested in automation', about: 'Learning about the person', contact: 'Wanting to connect', home: 'Exploring the portfolio' } },
  urgency: { type: 'noul', instructions: 'Is this visitor ready to take action (contact/hire)?' }
}
```

#### 3B: Section Priority for Personalization
**Problem**: Sections are shown in a fixed order. Personalizing the order based on visitor type could improve engagement.

**Jev Solution**: Use **Score** to rank sections by visitor relevance.
```js
// Questions
{
  section_priority: { type: 'score', instructions: 'How should this section be prioritized for this visitor?', criteria: ['Low priority', 'Somewhat relevant', 'Very relevant', 'Must-see first'] }
}
```

#### 3C: User Engagement Prediction
**Problem**: The portfolio doesn't predict what the visitor will do next based on their current behavior.

**Jev Solution**: Use **Noul** to predict engagement and **Choice** to predict next action.
```js
// Questions
{
  next_action: { type: 'choice', instructions: 'What is the visitor most likely to do next?', criteria: { scroll_to_work: 'Looking at projects', scroll_to_automation: 'Interested in automation', scroll_to_contact: 'Ready to connect', stay: 'Still browsing', leave: 'About to leave' } },
  engagement_score: { type: 'score', instructions: 'How engaged is this visitor?', criteria: ['Low engagement', 'Browsing', 'Actively exploring', 'Highly engaged'] }
}
```

---

## 4. 🎨 Art & Visual Asset Management

**File**: `src/config/illustrationAssets.js` + `src/config/artPrompts.js` + `src/components/dom/ArtworkReveal.jsx` + `src/components/dom/HandwrittenNote.jsx`

### What's Impressive
- **Illustration asset mapping**: `illustrationAssets.js` maps art categories to sketch/painted image paths
- **ArtworkReveal component**: Interactive reveal on hover with Three.js canvas rendering
- **HandwrittenNote component**: Uses `vara` library for hand-drawn text rendering with animation
- **Art prompts configuration**: 8 prompts for different art styles (sketch, paint, fun, work inventory)
- **Responsive artwork**: `prefers-reduced-motion` support, lazy loading
- **Fallback system**: SVG fallbacks when images fail to load

### Current Architecture
```js
// illustrationAssets.js: { hero: { sketch, painted, aspectRatio }, about: {...}, contact: {...} }
// artPrompts.js: AI prompt configuration for generating art assets
// ArtworkReveal.jsx: Three.js canvas with hover reveal
// HandwrittenNote.jsx: Vara library for handwritten text rendering
```

### Jev Enhancement Opportunities

#### 4A: Art Style Selection for Visitor Preference
**Problem**: Artwork is shown in the same style for all visitors. Some might prefer the sketch style, others the painted version.

**Jev Solution**: Use **Choice** to classify visitor art preference.
```js
// Questions
{
  art_preference: { type: 'choice', instructions: 'What art style best matches this visitor's aesthetic preference?', criteria: { sketch: 'Hand-drawn pencil style', painted: 'Colored pencil/marker style', dynamic: 'Animated/3D style', minimal: 'Minimal clean style' } },
  engagement_prediction: { type: 'noul', instructions: 'Will this visitor engage with the artwork?' }
}
```

#### 4B: Handwritten Note Content Selection
**Problem**: `HandwrittenNote` shows static text. The note content could be personalized based on visitor behavior.

**Jev Solution**: Use **Choice** to select the most appropriate handwritten note for the current context.
```js
// State
{ visitorSection: 'work', visitorType: 'recruiter', currentTime: '2026-09' }

// Questions
{
  note_content: { type: 'choice', instructions: 'What handwritten note would be most appropriate for this visitor?', criteria: { portfolio_intro: 'About the portfolio', availability: 'Currently open to work', project_focus: 'Current project focus', personal_note: 'A personal touch' } }
}
```

---

## 5. 📊 Content & Data Management

**File**: `src/config/portfolioContent.js` + `src/config/platformsContent.js` + `src/config/inventoryContent.js` + `src/config/githubContent.js` + `src/config/illustrationAssets.js`

### What's Impressive
- **Modular config architecture**: 5 separate config files with distinct concerns (profile, platforms, inventory, GitHub, illustrations)
- **Platform management**: 25+ platforms with IDs, names, proofs, and icons
- **Skills taxonomy**: 8 categories with 6-10 skills each
- **Project metadata**: Rich data including metrics, stack, links, images, overlays, gallery
- **Job title evidence mapping**: 9 roles with evidence arrays linking to specific projects
- **Suggested bullets**: 8 role-specific resume bullet phrases

### Current Architecture
```js
// All config files export plain objects/arrays
// Components import and render from config
// No dynamic filtering, sorting, or personalization
// Content is static — same for every visitor
```

### Jev Enhancement Opportunities

#### 5A: Platform Relevance Ranking
**Problem**: All 25+ platforms are shown in a marquee. A visitor from the fintech world cares more about `grafana` and `supabase` than about `docker`.

**Jev Solution**: Use **Score** to rank platforms by visitor relevance.
```js
// Questions
{
  platform_priority: { type: 'score', instructions: 'How relevant is this platform to this visitor?', criteria: ['Not relevant', 'Somewhat relevant', 'Very relevant', 'Essential'] }
}
```

#### 5B: Project Portfolio Personalization
**Problem**: The 5 featured projects + 11 additional projects are shown in a fixed order. A visitor should see the most relevant projects first.

**Jev Solution**: Use **Choice** to identify the top project, **Score** to rank all projects.
```js
// State
{ visitorInterest: "AI", visitorRole: "founder", allProjects: [...featuredProjects, ...additionalProjects] }

// Questions
{
  top_project: { type: 'choice', instructions: 'Which project would most interest this visitor?', criteria: Object.fromEntries(allProjects.map(p => [p.name, p.description])) },
  overall_interest: { type: 'score', instructions: 'How interested is this visitor in the portfolio?', criteria: ['Not interested', 'Browsing', 'Actively evaluating', 'Highly interested'] }
}
```

#### 5C: Skills Category Prioritization
**Problem**: Skills are shown in 8 fixed categories. A visitor looking for backend skills should see backend first.

**Jev Solution**: Use **Choice** to classify visitor skill interest, **Score** to rank categories.
```js
// Questions
{
  skill_category_priority: { type: 'choice', instructions: 'Which skill category is most important for this visitor?', criteria: Object.fromEntries(Object.entries(skills).map(([cat, items]) => [cat, `${cat}: ${items.join(', ')}`])) },
  skill_match: { type: 'noul', instructions: 'Does this category match the visitor's skill needs?' }
}
```

#### 5D: Content Freshness Detection
**Problem**: The portfolio content is static. Visitors can't tell what's new or recently updated.

**Jev Solution**: Use **Noul** to detect recently updated content, **Score** to assess content freshness.
```js
// Questions
{
  content_freshness: { type: 'score', instructions: 'How recently updated is this content?', criteria: ['Outdated', 'Somewhat current', 'Recently updated', 'Brand new'] }
}
```

---

## 6. 🔄 State & Scene Management

**File**: `src/context/SceneContext.jsx` + `src/components/dom/SceneTransition.jsx` + `src/components/canvas/Experience.jsx`

### What's Impressive
- **React Context-based state management**: `SceneContext` provides global state
- **Scene transition animations**: `SceneTransition` component handles section transitions
- **Three.js canvas**: `Experience.jsx` renders a 3D stickman with custom shader materials
- **PaintRevealMaterial**: Custom shader for paint reveal effect
- **Smooth scrolling**: `useActiveSection` with `IntersectionObserver` and hash sync
- **Reduced motion support**: `prefers-reduced-motion` respected throughout

### Current Architecture
```js
// SceneContext.jsx: createContext + useState + useMemo
// useScene.js: useContext hook
// useActiveSection.js: IntersectionObserver + hash sync
// SceneTransition.jsx: Animation between scenes
// Experience.jsx: Three.js canvas with R3F
```

### Jev Enhancement Opportunities

#### 6A: Scene Transition Prediction
**Problem**: Scene transitions happen based on scroll position. The system doesn't predict where the visitor wants to go.

**Jev Solution**: Use **Choice** to predict the next section based on scroll behavior.
```js
// Questions
{
  next_section: { type: 'choice', instructions: 'Which section is this visitor most likely to navigate to next?', criteria: { work: 'Featured work', automation: 'Automation', about: 'About', contact: 'Contact', home: 'Home' } },
  scroll_intent: { type: 'noul', instructions: 'Is the visitor actively scrolling or just browsing?' }
}
```

#### 6B: 3D Canvas Engagement Prediction
**Problem**: The 3D stickman canvas is always rendered. The system doesn't adapt based on visitor engagement with it.

**Jev Solution**: Use **Noul** to predict canvas engagement, **Score** to assess visual appeal.
```js
// Questions
{
  canvas_engagement: { type: 'noul', instructions: 'Is this visitor engaged with the 3D canvas?' },
  visual_interest: { type: 'score', instructions: 'How visually engaged is this visitor?', criteria: ['Not interested', 'Briefly glanced', 'Actively exploring', 'Deeply fascinated'] }
}
```

---

## 7. 🏗️ Architecture & Infrastructure Management

**File**: `server/index.js` + `server/jev-client.js` + `server/jev-client.test.js` + `server/live-test.js` + `scripts/jev.js`

### What's Impressive
- **Vite middleware architecture**: `server/index.js` provides `/api/jev/*` proxy
- **Typed client**: `server/jev-client.js` with `callSystemone`, `getModels`, `checkLayaModel`
- **Comprehensive error handling**: Maps 401/402/422/429/502/503/504 to human-readable errors
- **Test suite**: 12 tests with mock fetch, covering success and error cases
- **CLI tool**: `scripts/jev.js` for quick Jev calls from terminal
- **Live test**: `server/live-test.js` for manual verification
- **Type-safe**: All responses typed, `checkLayaModel` validates model connectivity

### Current Architecture
```js
// server/index.js: Vite plugin with configureServer
// server/jev-client.js: HTTP client with error handling
// server/jev-client.test.js: 12 tests
// scripts/jev.js: CLI interface
// server/live-test.js: Manual verification script
```

### Jev Enhancement Opportunities

#### 7A: Server Health Classification
**Problem**: The server infrastructure is monitored manually. There's no automated classification of server issues.

**Jev Solution**: Use **Noul** to detect server issues, **Score** to assess severity.
```js
// Questions
{
  server_health: { type: 'noul', instructions: 'Is the server showing signs of instability?' },
  issue_severity: { type: 'score', instructions: 'What is the severity of this issue?', criteria: ['Healthy', 'Minor degradation', 'At risk', 'Critical failure'] }
}
```

#### 7B: API Response Quality Assessment
**Problem**: API responses are used as-is. There's no assessment of response quality or confidence.

**Jev Solution**: Use **Noul** to verify API response quality, **Score** to assess reliability.
```js
// Questions
{
  response_quality: { type: 'noul', instructions: 'Is this API response of high quality and trustworthy?' },
  response_reliability: { type: 'score', instructions: 'How reliable is this response?', criteria: ['Unreliable', 'Questionable', 'Reliable', 'Highly reliable'] }
}
```

---

## 8. 📱 Project Management (AAGAM E-Commerce)

**File**: `src/config/portfolioContent.js` (featuredProjects[1]) + AAGAM monorepo automations

### What's Impressive
- **3-app monorepo**: Admin, Customer, Rider in TurboRepo
- **FSM order lifecycle**: Centralized finite state machine
- **Socket.io real-time sync**: Cross-app state synchronization
- **5 automations**: PR autofix, judge bot, crash-issue, APK pipeline, CI/CD deploy
- **40+ workflows across 8 repos**: Full automation management
- **E2E type safety**: TypeScript across all apps

### Jev Enhancement Opportunities (already documented in IMPLEMENTATION_PLAN.md)
- Order state machine classification
- Customer support intent routing
- PR review triage
- Product listing classification
- Return/refund classification
- Invoice/payment parsing
- State conflict resolution
- Review sentiment/fraud detection

---

## Implementation Priority Matrix

| Priority | Feature | Primitive | Complexity | Impact |
|----------|---------|-----------|------------|--------|
| 🔴 Critical | Visitor intent classification (Section 3A) | Choice + Noul | Low | Navigation personalization |
| 🔴 Critical | Order state machine (AAGAM) | Choice + Score | Medium | Core business logic |
| 🔴 Critical | PR review triage (AAGAM) | Noul + Score | Medium | Automation quality |
| 🟠 High | Project portfolio personalization (Section 5B) | Choice + Score | Low | Engagement |
| 🟠 High | Job title matching (Section 1A) | Choice + Score | Low | Resume effectiveness |
| 🟠 High | Story beat relevance (Section 2A) | Score | Low | Automation section impact |
| 🟡 Medium | Skill gap detection (Section 1D) | Choice + Noul | Low | Career page value |
| 🟡 Medium | Platform relevance (Section 5A) | Score | Low | Platform strip impact |
| 🟡 Medium | Auto-suggested bullets (Section 1B) | Choice | Medium | Resume customization |
| 🟢 Lower | Art style selection (Section 4A) | Choice | Low | Visual experience |
| 🟢 Lower | Scene transition prediction (Section 6A) | Choice | Low | UX improvement |
| 🟢 Lower | Content freshness (Section 5D) | Score | Low | Content management |

---

## Code Reuse Strategy

All Jev integration should reuse the existing infrastructure:
- `server/jev-client.js` → `callSystemone()` for all judgment calls
- `server/index.js` → `/api/jev/*` middleware proxy
- `server/jev-client.test.js` → Test pattern with `mockFetch`/`resolveResponse`
- `scripts/jev.js` → CLI pattern for quick calls
- `JEV_AI_API_KEY` → Kept server-side via `.env`

New judgment methods should be added to `server/aagaam-jev.js` following the same patterns. Tests should extend `server/jev-client.test.js` following the same mock pattern.
