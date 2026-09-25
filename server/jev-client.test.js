import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { callSystemone, getModels, checkLayaModel } from './jev-client.js';
import {
  classifyOrderIntent,
  routeCustomerSupport,
  triageReviewFinding,
  classifyProductListing,
  classifyReturnRequest,
  parseInvoicePayment,
  resolveStateConflict,
  classifyReview,
  batchClassifyReviews,
  batchTriageFindings,
  getAAGAMDetails,
} from './aagaam-jev.js';
import {
  matchJobTitle,
  selectResumeBullet,
  rankAchievements,
  detectSkillGaps,
  rankStoryBeats,
  identifyPriorityAgent,
  rankAchievementBadges,
  classifyWorkflowHealth,
  classifyVisitorIntent,
  rankSections,
  predictNextAction,
  rankProjects,
  rankPlatforms,
  classifySkillPriority,
  selectArtStyle,
  selectHandwrittenNote,
  batchRankProjects,
  batchClassifyVisitorIntents,
} from './management-jev.js';

const originalFetch = global.fetch;
const originalKey = process.env.JEV_AI_API_KEY;

let lastFetchOpts = null;

function mockFetch(resolve) {
  global.fetch = async (url, opts = {}) => {
    lastFetchOpts = { url, opts };
    return resolve();
  };
}

function restore() {
  global.fetch = originalFetch;
  process.env.JEV_AI_API_KEY = originalKey;
  lastFetchOpts = null;
}

beforeEach(() => {
  process.env.JEV_AI_API_KEY = 'test-key';
});
afterEach(() => {
  restore();
});

function makeResponse(status, body = {}, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
  });
}

async function resolveResponse(opts = {}) {
  const { status, body, headers } = opts;
  return makeResponse(status, body, headers);
}

describe('callSystemone', () => {
  it('POSTs to systemone and returns answers/usage', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { urgent: { noul: 0.92 } }, usage: { input_tokens: 136 } } }));
    const result = await callSystemone({ model: 'jev-latest', state: 'My payment failed.', questions: { urgent: { type: 'noul', instructions: 'Does this message need urgent support?' } } });
    expect(lastFetchOpts.opts.method).toBe('POST');
    expect(lastFetchOpts.opts.body).toContain('"noul"');
    expect(result.answers.urgent.noul).toBe(0.92);
    expect(result.usage.input_tokens).toBe(136);
  });

  it('includes runId from X-Jev-Run-Id header', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: {}, usage: {} }, headers: { 'x-jev-run-id': 'run-abc' } }));
    const result = await callSystemone({ state: 'hi', questions: { q: { type: 'noul', instructions: 'q?' } } });
    expect(result.runId).toBe('run-abc');
  });

  it('throws on 401', async () => {
    mockFetch(() => resolveResponse({ status: 401, body: { error: 'unauthorized' } }));
    await expect(callSystemone({ state: 'hi', questions: { q: { type: 'noul', instructions: 'q?' } } })).rejects.toThrow('Jev 401');
  });

  it('throws on 402', async () => {
    mockFetch(() => resolveResponse({ status: 402, body: {} }));
    await expect(callSystemone({ state: 'hi', questions: { q: { type: 'noul', instructions: 'q?' } } })).rejects.toThrow('Jev 402');
  });

  it('throws on 422 without retrying', async () => {
    mockFetch(() => resolveResponse({ status: 422, body: { error: 'invalid' } }));
    await expect(callSystemone({ state: 'hi', questions: { q: { type: 'noul', instructions: 'q?' } } })).rejects.toThrow('Jev 422');
  });

  it('throws on 429 and includes Retry-After', async () => {
    mockFetch(() => resolveResponse({ status: 429, body: {}, headers: { 'retry-after': '5' } }));
    await expect(callSystemone({ state: 'hi', questions: { q: { type: 'noul', instructions: 'q?' } } })).rejects.toThrow('Retry after 5');
  });

  it('throws on 502', async () => {
    mockFetch(() => resolveResponse({ status: 502, body: {} }));
    await expect(callSystemone({ state: 'hi', questions: { q: { type: 'noul', instructions: 'q?' } } })).rejects.toThrow('Jev 502');
  });

  it('throws on 504', async () => {
    mockFetch(() => resolveResponse({ status: 504, body: {} }));
    await expect(callSystemone({ state: 'hi', questions: { q: { type: 'noul', instructions: 'q?' } } })).rejects.toThrow('Jev 504');
  });

  it('throws when JEV_AI_API_KEY is missing', async () => {
    delete process.env.JEV_AI_API_KEY;
    await expect(callSystemone({ state: 'hi', questions: {} })).rejects.toThrow('JEV_AI_API_KEY is not configured');
  });
});

describe('getModels', () => {
  it('returns models array', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { models: [{ name: 'jev-latest' }, { name: 'laya-english' }] } }));
    const models = await getModels();
    expect(models).toEqual([{ name: 'jev-latest' }, { name: 'laya-english' }]);
  });
});

describe('checkLayaModel', () => {
  it('throws if laya model is not connected', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { models: [{ name: 'jev-latest' }] } }));
    await expect(checkLayaModel('laya-english')).rejects.toThrow('not connected');
  });

  it('returns model info when connected', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { models: [{ name: 'laya-english', description: 'Laya English' }] } }));
    const m = await checkLayaModel('laya-english');
    expect(m.name).toBe('laya-english');
  });
});

// ──────────────────────────────────────────────
// AAGAM E-COMMERCE JUDGMENT TESTS
// ──────────────────────────────────────────────

describe('classifyOrderIntent', () => {
  it('classifies order intent from customer message', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { intent: { choice: 'return', distribution: { return: 0.92 } }, state_confidence: { score: 0.85 }, urgency: { noul: 0.3 } }, usage: { input_tokens: 200 } } }));
    const result = await classifyOrderIntent({ rawMessage: 'I want to return my order', currentFsmState: 'DELIVERED', availableTransitions: ['RETURN_REQUESTED'] });
    expect(result.intent).toBe('return');
    expect(result.intentProbability).toBe(0.92);
    expect(result.stateConfidence).toBe(0.85);
    expect(result.urgency).toBe(0.3);
  });

  it('returns fallback probability when distribution is empty', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { intent: { choice: 'complaint', distribution: {} }, state_confidence: { score: 0.5 }, urgency: { noul: 0.8 } }, usage: { input_tokens: 100 } } }));
    const result = await classifyOrderIntent({ rawMessage: 'test', currentFsmState: 'PLACED', availableTransitions: [] });
    expect(result.intentProbability).toBe(0);
  });
});

describe('routeCustomerSupport', () => {
  it('routes order status query to order-handler', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { intent: { choice: 'order_status', distribution: { order_status: 0.9 } }, complexity: { score: 0 } }, usage: { input_tokens: 150 } } }));
    const result = await routeCustomerSupport({ message: 'Where is my order?', channel: 'whatsapp', customerId: 'cust-1', orderContext: {} });
    expect(result.handler).toBe('order-handler');
    expect(result.needsHuman).toBe(false);
    expect(result.action).toBe('order_status');
  });

  it('escalates to human when confidence is low', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { intent: { choice: 'complaint', distribution: { complaint: 0.3 } }, complexity: { score: 2 } }, usage: { input_tokens: 150 } } }));
    const result = await routeCustomerSupport({ message: 'test', channel: 'email', customerId: 'cust-2', orderContext: {} });
    expect(result.needsHuman).toBe(true);
  });
});

describe('triageReviewFinding', () => {
  it('identifies real bugs', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { is_real_bug: { noul: 0.85 }, is_false_positive: { noul: 0.1 } }, usage: { input_tokens: 300 } } }));
    const result = await triageReviewFinding({ finding: 'Null pointer', codeSnippet: 'code', toolSource: 'CodeRabbit', file: 'src/auth.ts', line: 42 });
    expect(result.isRealBug).toBe(true);
    expect(result.realBugProbability).toBe(0.85);
    expect(result.needsHumanReview).toBe(false);
  });

  it('flags uncertain cases for human review', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { is_real_bug: { noul: 0.45 }, is_false_positive: { noul: 0.4 } }, usage: { input_tokens: 300 } } }));
    const result = await triageReviewFinding({ finding: 'test', codeSnippet: 'test', toolSource: 'Copilot', file: 'test.ts', line: 1 });
    expect(result.isRealBug).toBe(false);
    expect(result.needsHumanReview).toBe(true);
  });
});

describe('classifyProductListing', () => {
  it('classifies product category', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { category: { choice: 'electronics', distribution: { electronics: 0.88 } }, is_prohibited: { noul: 0.02 }, listing_quality: { score: 2.5 } }, usage: { input_tokens: 250 } } }));
    const result = await classifyProductListing({ rawTitle: 'Wireless Headphones', rawDescription: 'Premium', sellerId: 'seller-1' });
    expect(result.category).toBe('electronics');
    expect(result.isProhibited).toBe(false);
    expect(result.quality).toBe(2.5);
  });
});

describe('classifyReturnRequest', () => {
  it('verifies return eligibility', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { order_id_match: { noul: 0.9 }, is_eligible: { noul: 0.75 }, is_fraudulent: { noul: 0.1 }, refund_amount_valid: { score: 2 } }, usage: { input_tokens: 200 } } }));
    const result = await classifyReturnRequest({ rawRequest: 'Return order #12345', orderContext: { orderId: '#12345', status: 'DELIVERED' } });
    expect(result.orderIdVerified).toBe(true);
    expect(result.isEligible).toBe(true);
    expect(result.isFraudulent).toBe(false);
  });
});

describe('parseInvoicePayment', () => {
  it('extracts order ID from invoice text', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { order_id: { choice: 'ORD-2026-001', distribution: { 'ORD-2026-001': 0.95 } } }, usage: { input_tokens: 180 } } }));
    const result = await parseInvoicePayment({ rawText: 'Payment for ORD-2026-001', knownOrderIds: ['ORD-2026-001', 'ORD-2026-002'] });
    expect(result.orderId).toBe('ORD-2026-001');
    expect(result.orderIdConfidence).toBe(0.95);
  });
});

describe('resolveStateConflict', () => {
  it('determines authoritative state source', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { authoritative_source: { choice: 'admin', distribution: { admin: 0.8 } }, conflict_confidence: { score: 0.9 } }, usage: { input_tokens: 160 } } }));
    const result = await resolveStateConflict({ adminState: { status: 'CONFIRMED' }, customerState: { status: 'PROCESSING' }, riderState: { status: 'CONFIRMED' } });
    expect(result.authoritativeSource).toBe('admin');
    expect(result.confidence).toBe(0.9);
    expect(result.needsHumanReview).toBe(false);
  });
});

describe('classifyReview', () => {
  it('classifies genuine positive review', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { category: { choice: 'genuine', distribution: { genuine: 0.9 } }, sentiment: { score: 0 }, is_fraudulent: { noul: 0.05 } }, usage: { input_tokens: 200 } } }));
    const result = await classifyReview({ reviewText: 'Great product!', customerId: 'cust-1', orderContext: {} });
    expect(result.category).toBe('genuine');
    expect(result.sentiment).toBe(0);
    expect(result.needsReview).toBe(false);
  });
});

describe('batchClassifyReviews', () => {
  it('processes multiple reviews in parallel', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { category: { choice: 'genuine', distribution: { genuine: 0.9 } }, sentiment: { score: 0 }, is_fraudulent: { noul: 0.05 } }, usage: { input_tokens: 200 } } }));
    const results = await batchClassifyReviews([{ reviewText: 'Good', customerId: '1', orderContext: {} }, { reviewText: 'Bad', customerId: '2', orderContext: {} }]);
    expect(results).toHaveLength(2);
    expect(results[0].category).toBe('genuine');
  });
});

describe('batchTriageFindings', () => {
  it('processes multiple findings in parallel', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { is_real_bug: { noul: 0.8 }, is_false_positive: { noul: 0.1 } }, usage: { input_tokens: 300 } } }));
    const results = await batchTriageFindings([{ finding: 'Bug 1', codeSnippet: 'code', toolSource: 'Qodo', file: 'a.ts', line: 1 }]);
    expect(results).toHaveLength(1);
    expect(results[0].isRealBug).toBe(true);
  });
});

describe('getAAGAMDetails', () => {
  it('returns AAGAM project details with server architecture', () => {
    const details = getAAGAMDetails()
    expect(details.projectId).toBe('aagam-ecommerce')
    expect(details.liveServer.host).toBe('3.24.42.4')
    expect(details.liveServer.nginx).toBe('1.28.3')
    expect(details.liveServer.database).toBe('PostgreSQL 18 (port 5432)')
    expect(details.liveServer.ports).toContain(80)
    expect(details.liveServer.ports).toContain(443)
    expect(details.liveServer.ports).toContain(5432)
    expect(details.liveServer.ports).toContain(3005)
    expect(details.liveServer.ports).toContain(3001)
    expect(details.architecture.webApps).toContain('Next.js')
    expect(details.architecture.apiServer).toContain('NestJS')
    expect(details.details.overview).toBeDefined()
    expect(details.details.overview.liveUrl).toBe('https://aagaam.in')
  })
})

// ──────────────────────────────────────────────
// MANAGEMENT JUDGMENT TESTS
// ──────────────────────────────────────────────

describe('matchJobTitle', () => {
  it('matches a query to the best role', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { best_role: { choice: 'Fintech / Quantitative Developer', distribution: { 'Fintech / Quantitative Developer': 0.91 } }, relevance: { score: 2.5 } }, usage: { input_tokens: 150 } } }));
    const result = await matchJobTitle('Looking for a quant developer', ['Automation Architect', 'Fintech / Quantitative Developer', 'Full-Stack Engineer']);
    expect(result.bestRole).toBe('Fintech / Quantitative Developer');
    expect(result.relevance).toBe(2.5);
  });
});

describe('selectResumeBullet', () => {
  it('selects the most impactful bullet', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { top_bullet: { choice: 'fintech', distribution: { fintech: 0.88 } }, confidence: { noul: 0.9 } }, usage: { input_tokens: 200 } } }));
    const result = await selectResumeBullet('Hiring a quant developer', { fintech: 'Built a crash-proof HFT engine', fullstack: 'Architected a 3-app e-commerce monorepo' });
    expect(result.topBullet).toBe('fintech');
    expect(result.confidence).toBe(0.9);
  });
});

describe('rankAchievements', () => {
  it('ranks achievements by relevance', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { achievement_priority: { scores: [3, 1, 2, 0] } }, usage: { input_tokens: 180 } } }));
    const result = await rankAchievements('fintech', ['20+ production systems', 'Sub-500ms crash recovery', '10 live deployments', '2 shipped APKs']);
    expect(result.ranked.length).toBe(4);
  });
});

describe('detectSkillGaps', () => {
  it('detects skill gaps', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { key_skills: { choice: 'Node.js' }, has_gaps: { noul: 0.7 } }, usage: { input_tokens: 160 } } }));
    const result = await detectSkillGaps('Backend', ['Node.js', 'Prisma', 'Socket.io'], 'Full-Stack Engineer');
    expect(result.hasGaps).toBe(true);
    expect(result.gapProbability).toBe(0.7);
  });
});

describe('rankStoryBeats', () => {
  it('ranks story beats by relevance', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { beat_relevance: { scores: [3, 4, 2, 1, 0, 2, 3, 1, 4, 2] } }, usage: { input_tokens: 200 } } }));
    const result = await rankStoryBeats('automation', [{ id: 'pr-autofix' }, { id: 'judge' }]);
    expect(result.ranked.length).toBe(2);
  });
});

describe('identifyPriorityAgent', () => {
  it('identifies the most relevant agent', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { priority_agent: { choice: 'PR review + autofix', distribution: { 'PR review + autofix': 0.9 } }, interest_score: { noul: 0.85 } }, usage: { input_tokens: 180 } } }));
    const result = await identifyPriorityAgent('automation', [{ name: 'PR review + autofix', purpose: 'Catches bugs early' }]);
    expect(result.priorityAgent).toBe('PR review + autofix');
    expect(result.interestScore).toBe(0.85);
  });
});

describe('rankAchievementBadges', () => {
  it('ranks badges by relevance', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { achievement_priority: { scores: [3, 4, 1, 2] } }, usage: { input_tokens: 160 } } }));
    const result = await rankAchievementBadges([{ name: 'Pair Extraordinaire' }, { name: 'Pull Shark' }], 'software engineer');
    expect(result.ranked.length).toBe(2);
  });
});

describe('classifyWorkflowHealth', () => {
  it('classifies workflow as healthy', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { workflow_health: { noul: 0.1 }, risk_level: { score: 0 } }, usage: { input_tokens: 140 } } }));
    const result = await classifyWorkflowHealth('ci.yml', 'passing');
    expect(result.isHealthy).toBe(true);
    expect(result.riskLevel).toBe(0);
  });
});

describe('classifyVisitorIntent', () => {
  it('classifies visitor intent as work', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { primary_intent: { choice: 'work', distribution: { work: 0.92 } }, is_action_ready: { noul: 0.7 } }, usage: { input_tokens: 160 } } }));
    const result = await classifyVisitorIntent('60s', ['home'], 'google.com');
    expect(result.primaryIntent).toBe('work');
    expect(result.isActionReady).toBe(true);
  });
});

describe('rankSections', () => {
  it('ranks sections by priority', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { section_priority: { scores: [0, 3, 1, 2, 0] } }, usage: { input_tokens: 150 } } }));
    const result = await rankSections('developer', ['home', 'work', 'automation', 'about', 'contact']);
    expect(result.ranked.length).toBe(5);
    expect(result.ranked[1].section).toBe('work');
  });
});

describe('predictNextAction', () => {
  it('predicts next action', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { next_action: { choice: 'scroll_to_work', distribution: { 'scroll_to_work': 0.85 } }, engagement_score: { score: 2 } }, usage: { input_tokens: 140 } } }));
    const result = await predictNextAction('home', 45, true);
    expect(result.nextAction).toBe('scroll_to_work');
    expect(result.engagementScore).toBe(2);
  });
});

describe('rankProjects', () => {
  it('ranks projects by relevance', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { top_project: { choice: 'AAGAM E-Commerce Monorepo', distribution: { 'AAGAM E-Commerce Monorepo': 0.88 } }, overall_interest: { score: 3 } }, usage: { input_tokens: 200 } } }));
    const result = await rankProjects('e-commerce', [{ name: 'AAGAM E-Commerce Monorepo', description: 'Full-featured e-commerce platform' }]);
    expect(result.topProject).toBe('AAGAM E-Commerce Monorepo');
  });
});

describe('rankPlatforms', () => {
  it('ranks platforms by priority', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { platform_priority: { scores: [2, 3, 1] } }, usage: { input_tokens: 140 } } }));
    const result = await rankPlatforms('fintech', [{ name: 'AWS' }, { name: 'Grafana' }, { name: 'Vercel' }]);
    expect(result.ranked.length).toBe(3);
  });
});

describe('classifySkillPriority', () => {
  it('classifies skill category priority', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { skill_category_priority: { choice: 'Backend', distribution: { Backend: 0.9 } }, has_match: { noul: 0.8 } }, usage: { input_tokens: 160 } } }));
    const result = await classifySkillPriority('developer', { backend: ['Node.js', 'NestJS'], frontend: ['React', 'Next.js'] });
    expect(result.topCategory).toBe('Backend');
    expect(result.hasMatch).toBe(true);
  });
});

describe('selectArtStyle', () => {
  it('selects art style preference', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { art_preference: { choice: 'sketch', distribution: { sketch: 0.85 } }, will_engage: { noul: 0.8 } }, usage: { input_tokens: 140 } } }));
    const result = await selectArtStyle({ scrollDepth: 0.8, timeOnArt: 10000 });
    expect(result.preferredStyle).toBe('sketch');
    expect(result.willEngage).toBe(true);
  });
});

describe('selectHandwrittenNote', () => {
  it('selects an appropriate note', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { note_content: { choice: 'availability', distribution: { availability: 0.9 } } }, usage: { input_tokens: 120 } } }));
    const result = await selectHandwrittenNote('contact', 'recruiter');
    expect(result.noteContent).toBe('availability');
    expect(result.confidence).toBe(0.9);
  });
});

describe('batchRankProjects', () => {
  it('batch ranks projects for multiple profiles', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { top_project: { choice: 'AAGAM' }, overall_interest: { score: 3 }, top_project: { choice: 'HFT' }, overall_interest: { score: 4 } }, usage: { input_tokens: 200 } } }));
    const results = await batchRankProjects([{ interest: 'e-commerce' }, { interest: 'fintech' }], [{ name: 'AAGAM' }, { name: 'HFT' }]);
    expect(results).toHaveLength(2);
  });
});

describe('batchClassifyVisitorIntents', () => {
  it('batch classifies multiple visitor sessions', async () => {
    mockFetch(() => resolveResponse({ status: 200, body: { model: 'jev-latest', answers: { primary_intent: { choice: 'work' }, is_action_ready: { noul: 0.7 } }, usage: { input_tokens: 160 } } }));
    const results = await batchClassifyVisitorIntents([{ duration: '60s', sections: ['home'], referrer: 'google.com' }]);
    expect(results).toHaveLength(1);
  });
});
