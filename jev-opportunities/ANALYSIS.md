# Jev AI Intelligent Judgment Opportunities — Portfolio-Stickman

## Executive Summary

This project already has a working Jev AI integration (`server/jev-client.js`, `server/index.js`, `scripts/jev.js`, `server/jev-client.test.js`), but currently only uses a single `noul` (urgency check) via the CLI script. This analysis identifies **8 concrete opportunities** to replace complex parsing logic with Jev intelligent judgments across the **AAGAM E-Commerce Monorepo** and the broader portfolio project.

## Current State of Jev Integration

- `server/jev-client.js`: Full typed client (`callSystemone`, `getModels`, `checkLayaModel`) with error handling
- `server/index.js`: Vite middleware proxying `/api/jev/systemone` and `/api/jev/models`
- `scripts/jev.js`: CLI script using one `noul` question
- `server/jev-client.test.js`: 11 tests covering success/error cases
- **Gap**: No application of Jev judgments to any real project logic — only a demo script exists

## Opportunities Ranked by Impact

### 1. Order State Machine Classification (AAGAM Core)
**Impact**: 🔴 High — Core business logic for all 3 apps
**Problem**: FSM order lifecycle (PLACED→CONFIRMED→PROCESSING→SHIPPED→DELIVERED→RETURNED→CANCELLED) receives unstructured customer messages via WhatsApp, email, chat. Regex-based parsing breaks on varied formats.
**Jev Pattern**: Choice + Score primitives
**State**: `{ orderId, rawMessage, currentFsmState, availableTransitions }`
**Questions**:
```js
{
  intent: { type: 'choice', instructions: 'What is the customer trying to do?', criteria: { place_order: '...', cancel: '...', return: '...', track: '...', complaint: '...' } },
  state_confidence: { type: 'score', instructions: 'How confident is this about the current FSM state?', criteria: ['Definitely this state', 'Likely this state', 'Unclear'] },
  urgency: { type: 'noul', instructions: 'Does this need immediate attention?' }
}
```
**Replaces**: Regex patterns for order status detection, manual state transition logic

### 2. Customer Support Intent Routing (All 3 Apps)
**Impact**: 🔴 High — Customer-facing automation across Admin, Customer, Rider
**Problem**: Messages arrive via multiple channels with varying formats. Keyword-based routing misclassifies nuanced requests.
**Jev Pattern**: Intent Routing ([docs](https://docs.typesafe.ai/patterns/intent-routing.md))
**State**: `{ message, channel, customerId, orderContext }`
**Questions**:
```js
{
  intent: { type: 'choice', criteria: { order_status: '...', product_question: '...', return_exchange: '...', complaint: '...', shipping: '...' } },
  complexity: { type: 'score', criteria: ['Simple lookup', 'Requires judgment', 'Escalation needed'] }
}
```
**Replaces**: If/else keyword chains, hardcoded routing tables
**Routing logic**: `if intent.confidence < 0.5 → human agent; else route to handler`

### 3. PR Review Triage Automation (AAGAM `bot-review-triage.json`)
**Impact**: 🟠 Medium-High — Existing automation that needs intelligence
**Problem**: CodeRabbit/Qodo/Copilot findings need classification as real bugs vs false alarms.
**Jev Pattern**: SDE Cascade with per-field Noul verification ([docs](https://docs.typesafe.ai/cookbooks/sde_cascade.md))
**State**: `{ finding, codeSnippet, toolSource, originalReport, file, line }`
**Questions**:
```js
{
  is_real_bug: { type: 'noul', instructions: 'Does this finding describe an actual bug?', criteria: { true: 'It is a real bug', false: 'It is a false alarm' } },
  severity: { type: 'score', criteria: ['No impact', 'Minor issue', 'Significant bug', 'Critical failure'] }
}
```
**Replaces**: Keyword-based false positive detection, hardcoded severity thresholds
**Gate**: If `P(is_real_bug) > 0.7` → auto-fix; else → flag for human review

### 4. Product Listing Classification & Normalization (AAGAM Catalog)
**Impact**: 🟠 Medium — Admin app catalog management
**Problem**: Seller product listings have inconsistent formats, categories, and attributes.
**Jev Pattern**: Choice + Score (E-commerce use case from TypeSafe docs)
**State**: `{ rawTitle, rawDescription, sellerId, existingCategory }`
**Questions**:
```js
{
  category: { type: 'choice', criteria: { electronics: '...', clothing: '...', 'home-kitchen': '...', ... } },
  is_prohibited: { type: 'noul', criteria: { true: 'Violates marketplace policy', false: 'Complies' } },
  listing_quality: { type: 'score', criteria: ['Poor description', 'Adequate', 'Well-formed', 'Excellent'] }
}
```

### 5. Return/Refund Request Classification (Customer App)
**Impact**: 🟠 Medium — Customer app workflow automation
**Problem**: Return requests arrive in varied natural language; extracting orderId, reason, eligibility from unstructured text is fragile.
**Jev Pattern**: SDE Cascade with hallucination detection ([docs](https://docs.typesafe.ai/cookbooks/sde_cascade.md))
**State**: `{ rawReturnRequest, orderContext, extractedFields }`
**Questions**: Per-field `hallucinated: Noul`, `is_eligible: Noul`, `refund_amount: Score`
**Replaces**: Regex extraction of order IDs, manual eligibility rules

### 6. Invoice/Payment Parsing (Admin App)
**Impact**: 🟡 Medium — Admin financial operations
**Problem**: Payment confirmations arrive in varied formats; extracting amount, order ID, payment method requires regex gymnastics.
**Jev Pattern**: Pre-parsed value extraction ([docs](https://docs.typesafe.ai/cookbooks/pre_parsed_value_extraction_cookbook.md))
**State**: `{ rawInvoiceText, knownOrderIds, extractedCandidates }`
**Replaces**: Regex fishing for amounts, manual format normalization

### 7. Multi-App Synchronization Conflict Resolution (Monorepo)
**Impact**: 🟡 Medium — Core monorepo architecture
**Problem**: Admin, Customer, and Rider apps can have conflicting Socket.io state; heuristics determine authoritative state.
**Jev Pattern**: Score primitive to rank state credibility
**State**: `{ appSource, stateDelta, timestamp, sessionContext }`

### 8. Customer Review Sentiment & Fraud Detection (Customer/Rider Apps)
**Impact**: 🟡 Medium — Quality assurance
**Problem**: Reviews need classification (genuine/spam/fraud) and sentiment scoring.
**Jev Pattern**: Choice + Score + Noul
**Replaces**: Keyword-based spam detection, simple sentiment scoring

## Architecture: How Jev Fits the Existing Stack

```
┌─────────────────────────────────────────────┐
│           Browser / React App               │
│  (ProjectGallery, AboutPanel, ContactPanel) │
└──────────────────┬──────────────────────────┘
                   │ fetch('/api/jev/*')
                   ▼
┌─────────────────────────────────────────────┐
│         server/index.js (Vite middleware)    │
│         /api/jev/systemone (POST)            │
│         /api/jev/models (GET)                │
└──────────────────┬──────────────────────────┘
                   │ proxies to jev-ai.pro
                   ▼
┌─────────────────────────────────────────────┐
│         server/jev-client.js                 │
│         callSystemone() → { answers, ... }   │
│         getModels()                          │
│         checkLayaModel()                     │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         TypeSafe System One API              │
│         Jev model → typed judgments          │
│         Choice / Score / Noul                │
└─────────────────────────────────────────────┘
```

**Key principle**: Code owns control flow; Jev supplies semantic decisions where ordinary code needs understanding.

## Existing Code to Preserve

The `server/` directory is already well-structured:
- `server/jev-client.js` — needs no changes; it's the client
- `server/index.js` — needs no changes; it's the middleware
- `server/jev-client.test.js` — needs new test cases for each new judgment type
- `scripts/jev.js` — can be extended with more question types
- `server/live-test.js` — can add new test scenarios

## Confidence-Gated Behavior

Per the TypeSafe docs, confidence should control system behavior:
- **Choice confidence < 0.5**: Route to human agent (uncertain classification)
- **Noul near 0.5**: Equal probability; escalate to human
- **Score**: Use probability-weighted position for ranking
- **Max-style gate**: Any field flag > threshold triggers escalation (not averaging)
