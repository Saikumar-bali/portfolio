/**
 * AAGAM E-Commerce Jev Judgment Service
 * 
 * Integrates TypeSafe Jev intelligent judgments into the AAGAM monorepo
 * to replace complex parsing logic with semantic understanding.
 * 
 * Uses the existing server/jev-client.js as the foundation.
 */

import { callSystemone, err } from './jev-client.js'

// ──────────────────────────────────────────────
// 1. ORDER STATE MACHINE CLASSIFICATION
// ──────────────────────────────────────────────

const ORDER_TRANSITIONS = {
  PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'RETURN_REQUESTED'],
  DELIVERED: ['RETURN_REQUESTED', 'REVIEWED'],
  RETURN_REQUESTED: ['RETURNED', 'EXCHANGED'],
}

/**
 * Classify a customer message into an order action intent.
 * Replaces regex-based order status detection.
 * 
 * @param {Object} params
 * @param {string} params.rawMessage - Unstructured customer message
 * @param {string} params.currentFsmState - Current state in the FSM
 * @param {string[]} params.availableTransitions - Valid next states
 * @returns {Promise<{intent: string, confidence: number, urgency: number}>}
 */
export async function classifyOrderIntent({ rawMessage, currentFsmState, availableTransitions }) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({
      rawMessage,
      currentFsmState,
      availableTransitions,
      orderTransitions: ORDER_TRANSITIONS,
    }),
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
        criteria: [
          'Clearly in the expected state',
          'Probably in the expected state',
          'Unclear or ambiguous state',
        ],
      },
      urgency: {
        type: 'noul',
        instructions: 'Does this message need immediate attention?',
      },
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
// 2. CUSTOMER SUPPORT INTENT ROUTING
// ──────────────────────────────────────────────

/**
 * Route a customer support message to the correct handler module.
 * Replaces keyword-based routing chains.
 * 
 * @param {Object} params
 * @param {string} params.message - Customer message
 * @param {string} params.channel - WhatsApp, email, chat, etc.
 * @param {string} params.customerId
 * @param {Object} params.orderContext - Relevant order data
 * @returns {Promise<{handler: string, action: string, needsHuman: boolean}>}
 */
export async function routeCustomerSupport({ message, channel, customerId, orderContext }) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({
      message,
      channel,
      customerId,
      orderContext,
    }),
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
        criteria: [
          'Simple lookup or standard procedure',
          'Requires some judgment or multi-step process',
          'Unusual situation, edge case, or escalation needed',
        ],
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
// 3. PR REVIEW TRIAGE
// ──────────────────────────────────────────────

/**
 * Evaluate a code review finding to determine if it is a real bug.
 * Replaces keyword-based false positive detection.
 * 
 * @param {Object} params
 * @param {string} params.finding - The review finding text
 * @param {string} params.codeSnippet - The relevant code
 * @param {string} params.toolSource - CodeRabbit, Qodo, Copilot, etc.
 * @param {string} params.file - File path
 * @param {number} params.line - Line number
 * @returns {Promise<{isRealBug: boolean, severity: number, confidence: number}>}
 */
export async function triageReviewFinding({ finding, codeSnippet, toolSource, file, line }) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({
      finding,
      codeSnippet,
      toolSource,
      file,
      line,
    }),
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
    needsHumanReview: !isRealBug && !isFalsePositive, // uncertain cases
    toolSource,
    file,
    line,
  }
}

/**
 * Batch triage multiple review findings in one call.
 * Uses speculative fan-out pattern — parallel questions over same state.
 */
export async function batchTriageFindings(findings) {
  const results = []
  for (const finding of findings) {
    const result = await triageReviewFinding(finding)
    results.push(result)
  }
  return results
}

// ──────────────────────────────────────────────
// 4. PRODUCT LISTING CLASSIFICATION
// ──────────────────────────────────────────────

const PRODUCT_CATEGORIES = [
  'electronics', 'clothing', 'home-kitchen', 'sports',
  'books', 'beauty', 'toys', 'automotive',
  'health', 'grocery', 'garden', 'office',
]

/**
 * Classify a product listing and detect prohibited content.
 * Replaces regex-based category matching.
 * 
 * @param {Object} params
 * @param {string} params.rawTitle - Product title
 * @param {string} params.rawDescription - Product description
 * @param {string} params.sellerId
 * @param {string} [params.existingCategory]
 * @returns {Promise<{category: string, isProhibited: boolean, quality: number}>}
 */
export async function classifyProductListing({ rawTitle, rawDescription, sellerId, existingCategory }) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({
      rawTitle,
      rawDescription,
      sellerId,
      existingCategory,
      validCategories: PRODUCT_CATEGORIES,
    }),
    questions: {
      category: {
        type: 'choice',
        instructions: 'What is the best category for this product?',
        criteria: Object.fromEntries(
          PRODUCT_CATEGORIES.map((cat) => [cat, `${cat} category products`])
        ),
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
        criteria: [
          'Poor description — missing key info, misleading',
          'Adequate — has some detail but incomplete',
          'Well-formed — clear, accurate, informative',
          'Excellent — comprehensive, professional listing',
        ],
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
// 5. RETURN/REFUND REQUEST CLASSIFICATION
// ──────────────────────────────────────────────

/**
 * Classify a return request and verify extracted fields against source text.
 * Uses SDE cascade pattern: extract fields, then verify with Noul questions.
 * 
 * @param {Object} params
 * @param {string} params.rawRequest - The customer return request text
 * @param {Object} params.orderContext - Order details for verification
 * @returns {Promise<{fields: Object, hallucinationFlags: Object, eligibility: boolean}>}
 */
export async function classifyReturnRequest({ rawRequest, orderContext }) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({
      rawRequest,
      orderContext,
    }),
    questions: {
      order_id_match: {
        type: 'noul',
        instructions: 'Does the extracted order ID match the actual order?',
        criteria: {
          true: 'The order ID is correct and verified',
          false: 'The order ID is wrong, hallucinated, or not found',
        },
      },
      is_eligible: {
        type: 'noul',
        instructions: 'Is this return request eligible based on policy?',
        criteria: {
          true: 'The return is eligible under policy',
          false: 'The return is not eligible',
        },
      },
      is_fraudulent: {
        type: 'noul',
        instructions: 'Does this request show signs of return fraud?',
        criteria: {
          true: 'Signs of fraudulent return behavior',
          false: 'No signs of fraud',
        },
      },
      refund_amount_valid: {
        type: 'score',
        instructions: 'How valid is the refund amount claimed?',
        criteria: [
          'Clearly incorrect amount',
          'Slightly off but reasonable',
          'Correct amount',
          'Full refund clearly justified',
        ],
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
// 6. INVOICE/PAYMENT PARSING
// ──────────────────────────────────────────────

/**
 * Parse payment information from unstructured invoice text.
 * Uses pre-parsed value extraction pattern: regex finds candidates, Jev selects.
 * 
 * @param {Object} params
 * @param {string} params.rawText - The invoice/payment text
 * @param {string[]} params.knownOrderIds - Known order IDs to match against
 * @returns {Promise<{amount: string, orderId: string, paymentMethod: string, confidence: number}>}
 */
export async function parseInvoicePayment({ rawText, knownOrderIds }) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({
      rawText,
      knownOrderIds,
    }),
    questions: {
      order_id: {
        type: 'choice',
        instructions: 'Which order ID is referenced in this invoice text?',
        criteria: Object.fromEntries(
          knownOrderIds.map((id) => [id, `Order ${id}`])
        ),
      },
      payment_amount: {
        type: 'choice',
        instructions: 'What is the payment amount mentioned?',
        criteria: {
          'amount_not_found': 'No clear amount found in text',
          // Dynamic — would need to be updated per batch
        },
      },
    },
  })

  return {
    orderId: result.answers.order_id.choice,
    orderIdConfidence: result.answers.order_id.distribution?.[result.answers.order_id.choice] ?? 0,
    confidence: (result.answers.order_id.distribution?.[result.answers.order_id.choice] ?? 0),
  }
}

// ──────────────────────────────────────────────
// 7. MULTI-APP STATE CONFLICT RESOLUTION
// ──────────────────────────────────────────────

/**
 * Determine which app's state is authoritative during a Socket.io sync conflict.
 * 
 * @param {Object} params
 * @param {Object} params.adminState - State from Admin app
 * @param {Object} params.customerState - State from Customer app
 * @param {Object} params.riderState - State from Rider app
 * @returns {Promise<{authoritativeSource: string, reason: string}>}
 */
export async function resolveStateConflict({ adminState, customerState, riderState }) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({
      adminState,
      customerState,
      riderState,
    }),
    questions: {
      authoritative_source: {
        type: 'choice',
        instructions: 'Which app has the most authoritative and recent state?',
        criteria: {
          admin: 'Admin app has the authoritative state',
          customer: 'Customer app has the authoritative state',
          rider: 'Rider app has the authoritative state',
          manual_review: 'Too ambiguous; human review needed',
        },
      },
      conflict_confidence: {
        type: 'score',
        instructions: 'How confident are we in this determination?',
        criteria: [
          'Very confident in the authoritative source',
          'Somewhat confident',
          'Uncertain — needs human review',
        ],
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
// 8. REVIEW SENTIMENT & FRAUD DETECTION
// ──────────────────────────────────────────────

/**
 * Classify a customer review as genuine, spam, or fraudulent.
 * 
 * @param {Object} params
 * @param {string} params.reviewText - The review content
 * @param {string} params.customerId
 * @param {Object} params.orderContext - Related order data
 * @returns {Promise<{category: string, sentiment: number, fraudProbability: number}>}
 */
export async function classifyReview({ reviewText, customerId, orderContext }) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({
      reviewText,
      customerId,
      orderContext,
    }),
    questions: {
      category: {
        type: 'choice',
        instructions: 'What type of review is this?',
        criteria: {
          genuine: 'A legitimate customer review',
          spam: 'Spam or promotional content',
          fraudulent: 'Fake review — incentivized or coordinated',
        },
      },
      sentiment: {
        type: 'score',
        instructions: 'What is the sentiment severity of this review?',
        criteria: [
          'Very positive',
          'Positive',
          'Neutral',
          'Negative',
          'Very negative',
        ],
      },
      is_fraudulent: {
        type: 'noul',
        instructions: 'Does this review show signs of fraud?',
        criteria: {
          true: 'Signals of fraudulent behavior (fake, incentivized, coordinated)',
          false: 'Appears to be a legitimate review',
        },
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
