/**
 * Extended Jev Client — AAGAM E-Commerce Judgment Methods
 * 
 * Extends the existing server/jev-client.js with domain-specific
 * judgment methods for the AAGAM monorepo.
 * 
 * All methods follow the existing pattern: callSystemone with
 * structured state and typed questions (Choice, Score, Noul).
 */

import { callSystemone, err } from './jev-client.js'

// ──────────────────────────────────────────────
// ORDER STATE MACHINE CLASSIFICATION
// ──────────────────────────────────────────────

const ORDER_TRANSITIONS = {
  PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'RETURN_REQUESTED'],
  DELIVERED: ['RETURN_REQUESTED', 'REVIEWED'],
  RETURN_REQUESTED: ['RETURNED', 'EXCHANGED'],
}

export async function classifyOrderIntent({ rawMessage, currentFsmState, availableTransitions }) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ rawMessage, currentFsmState, availableTransitions, orderTransitions: ORDER_TRANSITIONS }),
    questions: {
      intent: {
        type: 'choice',
        instructions: 'What is the customer trying to do based on this message?',
        criteria: {
          place_order: 'Customer wants to place a new order',
          cancel: 'Customer wants to cancel an order',
          return: 'Customer wants to return an item',
          track: 'Customer wants to track their order',
          complaint: 'Customer is unhappy and wants resolution',
          confirm: 'Customer is confirming or acknowledging',
          ship: 'Customer is asking about shipping',
          exchange: 'Customer wants to exchange an item',
        },
      },
      state_confidence: {
        type: 'score',
        instructions: 'How confident are we about identifying the correct FSM state?',
        criteria: ['Clearly in the expected state', 'Probably in the expected state', 'Unclear or ambiguous state'],
      },
      urgency: { type: 'noul', instructions: 'Does this message need immediate attention?' },
    },
  })

  return {
    intent: result.answers.intent.choice,
    intentProbability: result.answers.intent.distribution?.[result.answers.intent.choice] ?? 0,
    stateConfidence: result.answers.state_confidence.score,
    urgency: result.answers.urgency.noul,
  }
}

// ──────────────────────────────────────────────
// CUSTOMER SUPPORT INTENT ROUTING
// ──────────────────────────────────────────────

export async function routeCustomerSupport({ message, channel, customerId, orderContext }) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ message, channel, customerId, orderContext }),
    questions: {
      intent: {
        type: 'choice',
        instructions: 'What is the primary intent of this customer message?',
        criteria: {
          order_status: 'Asking about an existing order',
          product_question: 'Asking about a product before buying',
          return_exchange: 'Wants to return or exchange',
          complaint: 'Unhappy with experience, wants resolution',
          shipping: 'Asking about shipping or delivery',
          account: 'Asking about account details',
          general: 'General inquiry or greeting',
        },
      },
      complexity: {
        type: 'score',
        instructions: 'How complex is this request to resolve?',
        criteria: ['Simple lookup or standard procedure', 'Requires some judgment or multi-step process', 'Unusual situation, edge case, or escalation needed'],
      },
    },
  })

  const intent = result.answers.intent.choice
  const intentConfidence = result.answers.intent.distribution?.[intent] ?? 0
  const complexity = result.answers.complexity.score
  const needsHuman = intentConfidence < 0.5 || complexity > 1

  const handlerMap = {
    order_status: 'order-handler',
    product_question: 'product-specialist-llm',
    return_exchange: 'returns-specialist-llm',
    complaint: 'complaint-resolution-llm',
    shipping: 'shipping-handler',
    account: 'account-handler',
    general: 'general-greeting',
  }

  return {
    handler: handlerMap[intent] || 'human-agent',
    action: intent,
    needsHuman,
    intentConfidence,
    complexity,
  }
}

// ──────────────────────────────────────────────
// PR REVIEW TRIAGE
// ──────────────────────────────────────────────

export async function triageReviewFinding({ finding, codeSnippet, toolSource, file, line }) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ finding, codeSnippet, toolSource, file, line }),
    questions: {
      is_real_bug: {
        type: 'noul',
        instructions: 'Does this finding describe an actual bug or meaningful issue?',
        criteria: {
          true: 'It is a real bug or meaningful code issue',
          false: 'It is a false alarm, style preference, or already handled',
        },
      },
      is_false_positive: {
        type: 'noul',
        instructions: 'Is this finding a false positive?',
        criteria: {
          true: 'It is a false positive',
          false: 'It is a legitimate finding',
        },
      },
    },
  })

  const isRealBug = result.answers.is_real_bug.noul > 0.7
  const isFalsePositive = result.answers.is_false_positive.noul > 0.7

  return {
    isRealBug,
    isFalsePositive,
    realBugProbability: result.answers.is_real_bug.noul,
    falsePositiveProbability: result.answers.is_false_positive.noul,
    needsHumanReview: !isRealBug && !isFalsePositive,
    toolSource,
    file,
    line,
  }
}

// ──────────────────────────────────────────────
// PRODUCT LISTING CLASSIFICATION
// ──────────────────────────────────────────────

const PRODUCT_CATEGORIES = [
  'electronics', 'clothing', 'home-kitchen', 'sports',
  'books', 'beauty', 'toys', 'automotive',
  'health', 'grocery', 'garden', 'office',
]

export async function classifyProductListing({ rawTitle, rawDescription, sellerId, existingCategory }) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ rawTitle, rawDescription, sellerId, existingCategory, validCategories: PRODUCT_CATEGORIES }),
    questions: {
      category: {
        type: 'choice',
        instructions: 'What is the best category for this product?',
        criteria: Object.fromEntries(PRODUCT_CATEGORIES.map((cat) => [cat, `${cat} category products`])),
      },
      is_prohibited: {
        type: 'noul',
        instructions: 'Does this listing violate marketplace policy?',
        criteria: {
          true: 'It violates marketplace policy (counterfeit, prohibited, restricted)',
          false: 'It complies with marketplace policy',
        },
      },
      listing_quality: {
        type: 'score',
        instructions: 'How well-formed and informative is this listing?',
        criteria: ['Poor description — missing key info, misleading', 'Adequate — has some detail but incomplete', 'Well-formed — clear, accurate, informative', 'Excellent — comprehensive, professional listing'],
      },
    },
  })

  return {
    category: result.answers.category.choice,
    categoryProbability: result.answers.category.distribution?.[result.answers.category.choice] ?? 0,
    isProhibited: result.answers.is_prohibited.noul > 0.7,
    prohibitionProbability: result.answers.is_prohibited.noul,
    quality: result.answers.listing_quality.score,
  }
}

// ──────────────────────────────────────────────
// RETURN/REFUND REQUEST CLASSIFICATION
// ──────────────────────────────────────────────

export async function classifyReturnRequest({ rawRequest, orderContext }) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ rawRequest, orderContext }),
    questions: {
      order_id_match: {
        type: 'noul',
        instructions: 'Does the extracted order ID match the actual order?',
        criteria: { true: 'The order ID is correct and verified', false: 'The order ID is wrong, hallucinated, or not found' },
      },
      is_eligible: {
        type: 'noul',
        instructions: 'Is this return request eligible based on policy?',
        criteria: { true: 'The return is eligible under policy', false: 'The return is not eligible' },
      },
      is_fraudulent: {
        type: 'noul',
        instructions: 'Does this request show signs of return fraud?',
        criteria: { true: 'Signs of fraudulent return behavior', false: 'No signs of fraud' },
      },
      refund_amount_valid: {
        type: 'score',
        instructions: 'How valid is the refund amount claimed?',
        criteria: ['Clearly incorrect amount', 'Slightly off but reasonable', 'Correct amount', 'Full refund clearly justified'],
      },
    },
  })

  return {
    orderIdVerified: result.answers.order_id_match.noul > 0.7,
    orderIdProbability: result.answers.order_id_match.noul,
    isEligible: result.answers.is_eligible.noul > 0.5,
    eligibilityProbability: result.answers.is_eligible.noul,
    isFraudulent: result.answers.is_fraudulent.noul > 0.7,
    fraudProbability: result.answers.is_fraudulent.noul,
    refundAmountValidity: result.answers.refund_amount_valid.score,
  }
}

// ──────────────────────────────────────────────
// INVOICE/PAYMENT PARSING
// ──────────────────────────────────────────────

export async function parseInvoicePayment({ rawText, knownOrderIds }) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ rawText, knownOrderIds }),
    questions: {
      order_id: {
        type: 'choice',
        instructions: 'Which order ID is referenced in this invoice text?',
        criteria: Object.fromEntries(knownOrderIds.map((id) => [id, `Order ${id}`])),
      },
    },
  })

  return {
    orderId: result.answers.order_id.choice,
    orderIdConfidence: result.answers.order_id.distribution?.[result.answers.order_id.choice] ?? 0,
    confidence: result.answers.order_id.distribution?.[result.answers.order_id.choice] ?? 0,
  }
}

// ──────────────────────────────────────────────
// MULTI-APP STATE CONFLICT RESOLUTION
// ──────────────────────────────────────────────

export async function resolveStateConflict({ adminState, customerState, riderState }) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ adminState, customerState, riderState }),
    questions: {
      authoritative_source: {
        type: 'choice',
        instructions: 'Which app has the most authoritative and recent state?',
        criteria: { admin: 'Admin app has the authoritative state', customer: 'Customer app has the authoritative state', rider: 'Rider app has the authoritative state', manual_review: 'Too ambiguous; human review needed' },
      },
      conflict_confidence: {
        type: 'score',
        instructions: 'How confident are we in this determination?',
        criteria: ['Very confident in the authoritative source', 'Somewhat confident', 'Uncertain — needs human review'],
      },
    },
  })

  return {
    authoritativeSource: result.answers.authoritative_source.choice,
    confidence: result.answers.conflict_confidence.score,
    needsHumanReview: result.answers.conflict_confidence.score < 0.5,
  }
}

// ──────────────────────────────────────────────
// REVIEW SENTIMENT & FRAUD DETECTION
// ──────────────────────────────────────────────

export async function classifyReview({ reviewText, customerId, orderContext }) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ reviewText, customerId, orderContext }),
    questions: {
      category: {
        type: 'choice',
        instructions: 'What type of review is this?',
        criteria: { genuine: 'A legitimate customer review', spam: 'Spam or promotional content', fraudulent: 'Fake review — incentivized or coordinated' },
      },
      sentiment: {
        type: 'score',
        instructions: 'What is the sentiment severity of this review?',
        criteria: ['Very positive', 'Positive', 'Neutral', 'Negative', 'Very negative'],
      },
      is_fraudulent: {
        type: 'noul',
        instructions: 'Does this review show signs of fraud?',
        criteria: { true: 'Signals of fraudulent behavior (fake, incentivized, coordinated)', false: 'Appears to be a legitimate review' },
      },
    },
  })

  return {
    category: result.answers.category.choice,
    categoryProbability: result.answers.category.distribution?.[result.answers.category.choice] ?? 0,
    sentiment: result.answers.sentiment.score,
    fraudProbability: result.answers.is_fraudulent.noul,
    needsReview: result.answers.is_fraudulent.noul > 0.6,
  }
}

// ──────────────────────────────────────────────
// BATCH OPERATIONS — Speculative Fan-out Pattern
// ──────────────────────────────────────────────

/**
 * Process multiple items in parallel using speculative fan-out.
 * Each item gets its own callSystemone call over the same state structure.
 */
export async function batchClassifyReviews(reviews) {
  const results = await Promise.all(
    reviews.map((review) => classifyReview(review))
  )
  return results
}

/**
 * Batch triage PR findings — each finding processed independently.
 */
export async function batchTriageFindings(findings) {
  const results = await Promise.all(
    findings.map((finding) => triageReviewFinding(finding))
  )
  return results
}

/**
 * Get AAGAM project details enriched with server architecture data.
 * Returns the static project details from portfolioContent.js enhanced
 * with dynamic server-side information from the live deployment.
 * 
 * @param {string} projectId - The project identifier
 * @returns {Object} AAGAM project details with live server data
 */
export function getAAGAMDetails() {
  return {
    projectId: 'aagam-ecommerce',
    liveServer: {
      host: '3.24.42.4',
      os: 'Ubuntu 7.0.0 AWS',
      nginx: '1.28.3',
      nodeServer: '/opt/aagam:3005',
      nextServer: 'port 3001',
      database: 'PostgreSQL 18 (port 5432)',
      redis: 'port 6379',
      docker: '29.1.3 with containerd',
      infrastructure: 'AWS EC2',
      ports: [80, 443, 5432, 6379, 3005, 3001, 8080],
    },
    architecture: {
      webApps: 'Next.js on port 3001 (Admin + Customer)',
      apiServer: 'NestJS Node.js on port 3005',
      database: 'PostgreSQL 18 with connection pooling',
      cache: 'Redis for sessions and pub/sub',
      reverseProxy: 'nginx 1.28 with SSL termination',
      containerization: 'Docker containers on AWS EC2',
      monorepo: 'TurboRepo for 3-app suite',
    },
    details: {
      overview: {
        title: 'Project Overview',
        intro: 'AAGAM is a production-grade e-commerce monorepo hosted on AWS EC2 with nginx as reverse proxy, Docker containers, and automated CI/CD pipelines. Three synchronized applications share a single NestJS backend, PostgreSQL 18 database, and Redis-powered real-time state machine.',
        liveUrl: 'https://aagaam.in',
        githubUrl: 'https://github.com/saikumar-bali/AAGAM_E-commerce',
        deployment: 'AWS EC2 | nginx 1.28 | Docker | PostgreSQL 18 | Redis',
      },
    }
  }
}
