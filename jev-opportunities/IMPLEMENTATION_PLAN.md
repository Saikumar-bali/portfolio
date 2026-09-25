# Jev AI Integration — Implementation Plan

## Prerequisites
- `JEV_AI_API_KEY` configured in `.env` (already have `.env.example`)
- `npm run dev` to start Vite dev server with Jev middleware
- `npm test` to run existing and new tests
- `server/aagaam-jev.js` already written with all 8 judgment methods
- `server/jev-client.test.js` already extended with 13 new tests (25/25 passing)

---

## Phase 1: Core Customer-Facing Intelligence (Week 1)
**Goal**: Replace regex-based customer message parsing with Jev judgment
**Priority**: Critical — affects all 3 client apps

### 1.1: Integrate `classifyOrderIntent` into Customer App
**File**: `src/components/ui/CustomerApp.jsx` (or wherever the message handler lives)

**Steps**:
1. Import `classifyOrderIntent` from `../../server/aagaam-jev.js` (or the proxied API endpoint)
2. Replace the existing regex-based order status detection:
   ```js
   // BEFORE: brittle regex
   const status = orderStatusRegex(message);
   
   // AFTER: Jev judgment
   const classification = await classifyOrderIntent({
     rawMessage: message,
     currentFsmState: currentOrderState,
     availableTransitions: getValidTransitions(currentOrderState),
   });
   // Use classification.intent to determine next FSM action
   ```
3. Add confidence-based fallback:
   ```js
   if (classification.intentProbability < 0.5) {
     // Route to human agent
     return { action: 'human_escalation', reason: 'Low confidence intent classification' };
   }
   ```
4. Log `classification.intentProbability` and `classification.urgency` for monitoring

**Test**: Verify that a customer message "I want to return my order #12345" routes to `intent: 'return'` with `urgency > 0.5`

### 1.2: Integrate `routeCustomerSupport` into Support Ticket System
**File**: `src/components/ui/SupportTicketHandler.jsx`

**Steps**:
1. Import `routeCustomerSupport`
2. Replace keyword-based routing chain:
   ```js
   // BEFORE: keyword matching
   if (message.includes('order')) handleOrderStatus(message);
   else if (message.includes('return')) handleReturn(message);
   // ... 7+ if/else branches
   
   // AFTER: Jev judgment
   const route = await routeCustomerSupport({
     message, channel: 'chat', customerId, orderContext,
   });
   if (route.needsHuman) return escalateToAgent(message);
   // route.handler determines the next action
   ```
3. Add confidence gate in code:
   ```js
   if (route.intentConfidence < 0.5) return escalateToAgent(message);
   ```

**Deliverable**: Working prototype that classifies 7 intent categories with confidence thresholds

### 1.3: Add Confidence Logging Middleware
**File**: `server/aagaam-jev.js` (add logging utility)

**Steps**:
1. Create a `judgmentLogger` that records:
   - Judgment type
   - Input state hash
   - Answer + confidence
   - Timestamp
2. Log when confidence < 0.5 (escalation events)
3. Export logger from `aagaam-jev.js`

**Deliverable**: Monitoring capability to track when Jev gates fire vs. when code handles deterministically

---

## Phase 2: Automation Intelligence (Week 2)
**Goal**: Wire Jev judgment into the monorepo's automation pipeline
**Priority**: High — existing automation needs intelligence

### 2.1: Integrate `triageReviewFinding` into `bot-review-triage.json`
**File**: `AAGAM_E-commerce/automations/bot-review-triage.json`

**Steps**:
1. Add a new step in the automation workflow:
   ```json
   {
     "step": "jev-triage",
     "type": "systemone_judgment",
     "method": "triageReviewFinding",
     "threshold": 0.7,
     "fallback": "human_review"
   }
   ```
2. Replace the existing keyword-based false positive detection with:
   ```js
   const triage = await triageReviewFinding({
     finding: comment.body,
     codeSnippet: getCodeAtLine(file, line),
     toolSource: 'CodeRabbit',
     file,
     line,
   });
   if (triage.isRealBug && triage.realBugProbability > 0.7) {
     autoFix(triage); // Proceed with auto-fix
   } else if (triage.needsHumanReview) {
     flagForHuman(triage); // Uncertain — escalate
   } else {
     dismiss(triage); // False positive
   }
   ```

**Deliverable**: PR review automation that auto-fixes real bugs and dismisses false alarms

### 2.2: Integrate `classifyReview` into Customer/Rider App Review System
**File**: `src/components/ui/ReviewModeration.jsx`

**Steps**:
1. Import `classifyReview`
2. Add pre-moderation step before reviews are published:
   ```js
   const classification = await classifyReview({
     reviewText, customerId, orderContext,
   });
   if (classification.isFraudulent && classification.fraudProbability > 0.6) {
     holdForReview(review); // Suspicious review
   } else {
     publish(review);
   }
   ```

**Deliverable**: Automated review moderation that catches spam and fraudulent reviews

---

## Phase 3: Admin/Operational Intelligence (Week 3)
**Goal**: Add product classification and invoice parsing to the admin app
**Priority**: Medium — operational efficiency

### 3.1: Deploy `classifyProductListing` in Admin Catalog
**File**: `src/components/ui/Admin/CatalogManager.jsx`

**Steps**:
1. Import `classifyProductListing`
2. Replace hardcoded category regex:
   ```js
   // BEFORE:
   const category = productCategoryRegex(title, description);
   
   // AFTER:
   const result = await classifyProductListing({
     rawTitle: product.title,
     rawDescription: product.description,
     sellerId: product.seller.id,
   });
   if (result.isProhibited) {
     flagListing(product, 'Policy violation');
   } else {
     product.category = result.category;
     product.qualityScore = result.quality;
   }
   ```
3. Add approval workflow for low-quality listings (`result.quality < 1.5`)

### 3.2: Deploy `parseInvoicePayment` in Admin Finance
**File**: `src/components/ui/Admin/FinanceDashboard.jsx`

**Steps**:
1. Import `parseInvoicePayment`
2. Replace manual invoice parsing:
   ```js
   const result = await parseInvoicePayment({
     rawText: invoice.text,
     knownOrderIds: allOrderIds,
   });
   invoice.orderId = result.orderId;
   invoice.confidence = result.confidence;
   if (result.confidence < 0.5) {
     flagForManualReview(invoice);
   }
   ```

---

## Phase 4: Advanced Workflows (Week 4)
**Goal**: Return classification, state conflict resolution, and batch operations
**Priority**: Lower — nice-to-have improvements

### 4.1: Deploy `classifyReturnRequest` in Customer App
**File**: `src/components/ui/Customer/ReturnRequestForm.jsx`

**Steps**:
1. Import `classifyReturnRequest`
2. Replace manual eligibility determination:
   ```js
   const result = await classifyReturnRequest({
     rawRequest: customerMessage,
     orderContext: { orderId, status, purchaseDate },
   });
   if (result.isEligible && result.orderIdVerified) {
     initiateReturn(result);
   } else if (result.isFraudulent) {
     flagForFraudInvestigation(result);
   } else {
     rejectWithReason(result);
   }
   ```

### 4.2: Deploy `resolveStateConflict` in Socket.io Sync
**File**: `shared/socket/stateSync.js`

**Steps**:
1. Import `resolveStateConflict`
2. When Admin/Customer/Rider states diverge:
   ```js
   const result = await resolveStateConflict({
     adminState, customerState, riderState,
   });
   if (result.needsHumanReview) {
     requestManualSync();
   } else {
     applyState(result.authoritativeSource);
   }
   ```

### 4.3: Batch Operations for Performance
**File**: `server/aagaam-jev.js` (batch methods already written)

**Steps**:
1. Use `batchClassifyReviews` for bulk review moderation
2. Use `batchTriageFindings` for bulk PR review triage
3. Add concurrency control (max 5 parallel calls to avoid rate limits)

---

## Testing & Verification Plan

### Unit Tests (Already Done)
- ✅ 25 tests in `server/jev-client.test.js`
- ✅ Covers all 8 judgment methods + existing `callSystemone`, `getModels`, `checkLayaModel`
- ✅ All tests passing

### Integration Tests (To Create)
**File**: `server/integration.test.js`

```js
describe('Jev Integration — End-to-End', () => {
  it('classifies a real customer message through the full pipeline', async () => {
    // Test: message → classifyOrderIntent → routeCustomerSupport → action
  });

  it('triage filters PR review findings correctly', async () => {
    // Test: PR finding → triageReviewFinding → auto-fix/dismiss/escalate
  });

  it('confidence-gated routing works at < 0.5 threshold', async () => {
    // Test: low confidence → human escalation
  });

  it('batch operations complete within acceptable latency', async () => {
    // Test: 10 items → batchClassifyReviews → all processed in < 2s
  });
});
```

### Manual Verification
```bash
# 1. Start dev server
npm run dev

# 2. Test order classification
curl -X POST http://localhost:5173/api/jev/systemone \
  -H "Content-Type: application/json" \
  -d '{
    "model": "jev-latest",
    "state": "Customer wants to return order #12345",
    "questions": {
      "intent": {"type": "choice", "instructions": "What is the customer trying to do?", 
        "criteria": {"place_order": "...", "cancel": "...", "return": "...", "track": "...", "complaint": "..."}},
      "urgency": {"type": "noul", "instructions": "Does this need immediate attention?"}
    }
  }'

# 3. Test PR triage
curl -X POST http://localhost:5173/api/jev/systemone \
  -H "Content-Type: application/json" \
  -d '{
    "model": "jev-latest",
    "state": "Null pointer exception in auth handler at src/auth.ts:42",
    "questions": {
      "is_real_bug": {"type": "noul", "instructions": "Does this finding describe an actual bug?"},
      "is_false_positive": {"type": "noul", "instructions": "Is this finding a false positive?"}
    }
  }'
```

---

## Monitoring & Observability Plan

### Metrics to Track
| Metric | Source | Alert Threshold |
|--------|--------|----------------|
| Intent classification confidence | `result.intentProbability` | < 0.5 → log warning |
| Urgency probability | `result.urgency.noul` | > 0.8 → alert team |
| PR false positive rate | `result.is_false_positive.noul` | > 0.5 → investigate |
| Review fraud probability | `result.fraudProbability` | > 0.6 → hold for review |
| Return fraud detection | `result.isFraudulent.noul` | > 0.7 → investigate |
| Average latency per judgment | `result.usage.input_tokens` | > 5s → investigate |
| Escalation rate | Count of confidence < 0.5 events | > 30% → re-evaluate model |

### Logging Configuration
Add to `server/aagaam-jev.js`:
```js
const judgmentLogger = {
  log: (judgmentType, state, answer, confidence) => {
    console.log(`[JEV] ${judgmentType} | confidence=${confidence} | intent=${answer.intent || answer.choice}`);
  },
  logEscalation: (judgmentType, state, answer) => {
    console.warn(`[JEV ESCALATION] ${judgmentType} | P(${answer.intent || answer.choice})=${confidence}`);
  }
};
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Jev API rate limits | Batch operations with concurrency control; fallback to deterministic rules if API fails |
| Low confidence on edge cases | Confidence gate routes to human; never auto-execute below threshold |
| Latency impact on user experience | Cache common classifications; use `laya-english` model (512 tokens) for faster responses |
| Cost of excessive API calls | Only use Jev for uncertain cases; deterministic code handles clear cases |
| Model hallucination in extraction | SDE cascade verifies each field; escalate if any field flags P(wrong) > 0.7 |

---

## Timeline Summary

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1 | Phase 1 | Customer-facing intelligence working in dev |
| 2 | Phase 2 | Automation pipeline integrated with Jev triage |
| 3 | Phase 3 | Admin operational intelligence deployed |
| 4 | Phase 4 | Advanced workflows + batch operations + monitoring |
| Ongoing | Testing | Integration tests, monitoring, confidence tuning |

---

## Quick Start Commands

```bash
# Run all tests
npm test

# Start dev server with Jev middleware
npm run dev

# Test Jev call from CLI
node scripts/jev.js "I want to return my order" --model=jev-latest --question="What is the intent?"

# Test systemone directly
curl -X POST http://localhost:5173/api/jev/systemone \
  -H "Content-Type: application/json" \
  -d '{"model":"jev-latest","state":"test","questions":{"urgent":{"type":"noul","instructions":"urgent?"}}}'

# Check connected models
curl http://localhost:5173/api/jev/models
```
