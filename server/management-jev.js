/**
 * Portfolio Management — TypeSafe Jev Judgment Methods
 * 
 * Extends the existing server infrastructure with intelligent
 * judgment methods for all management features in the portfolio project.
 * 
 * Reuses server/jev-client.js callSystemone() throughout.
 */

import { callSystemone } from './jev-client.js'

// ──────────────────────────────────────────────
// SECTION 1: WORK INVENTORY MANAGEMENT
// ──────────────────────────────────────────────

/**
 * Match a job search query to the best job role.
 * Replaces exact string matching with semantic classification.
 * 
 * @param {Object} params
 * @param {string} params.query - Visitor's search query
 * @param {string[]} params.availableRoles - List of job roles
 * @returns {Promise<{bestRole: string, relevance: number}>}
 */
export async function matchJobTitle(query, availableRoles) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ query, availableRoles }),
    questions: {
      best_role: {
        type: 'choice',
        instructions: 'Which job role best matches this search query?',
        criteria: Object.fromEntries(availableRoles.map(role => [role, role])),
      },
      relevance: {
        type: 'score',
        instructions: 'How relevant is this match?',
        criteria: ['No match', 'Somewhat relevant', 'Strong match'],
      },
    },
  })

  return {
    bestRole: result.answers.best_role.choice,
    relevance: result.answers.relevance.score,
    confidence: result.answers.best_role.distribution?.[result.answers.best_role.choice] ?? 0,
  }
}

/**
 * Select the most impactful resume bullet for a given job posting.
 * 
 * @param {Object} params
 * @param {string} params.jobDescription - The target job posting description
 * @param {Object} params.allBullets - Suggested bullets from inventoryContent
 * @returns {Promise<{topBullet: string, confidence: number}>}
 */
export async function selectResumeBullet(jobDescription, allBullets) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ jobDescription, allBullets }),
    questions: {
      top_bullet: {
        type: 'choice',
        instructions: 'Which resume bullet is most impactful for this job posting?',
        criteria: Object.fromEntries(Object.entries(allBullets).map(([key, text]) => [key, text])),
      },
      confidence: {
        type: 'noul',
        instructions: 'Is this bullet highly relevant to the job posting?',
        criteria: { true: 'Highly relevant', false: 'Not as relevant' },
      },
    },
  })

  return {
    topBullet: result.answers.top_bullet.choice,
    confidence: result.answers.confidence.noul,
    bulletProbability: result.answers.top_bullet.distribution?.[result.answers.top_bullet.choice] ?? 0,
  }
}

/**
 * Rank achievements by relevance to a specific job type.
 * 
 * @param {Object} params
 * @param {string} params.jobType - Target job type
 * @param {string[]} params.achievements - List of achievements
 * @returns {Promise<{ranked: Array<{achievement: string, score: number}>}>}
 */
export async function rankAchievements(jobType, achievements) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ jobType, achievements }),
    questions: {
      achievement_priority: {
        type: 'score',
        instructions: 'How relevant is this achievement to the target job type?',
        criteria: ['Not relevant', 'Somewhat relevant', 'Highly relevant', 'Must-have'],
      },
    },
  })

  return {
    ranked: result.answers.achievement_priority.scores.map((score, index) => ({
      achievement: achievements[index],
      score,
    })),
  }
}

/**
 * Detect skill gaps for a specific role.
 * 
 * @param {Object} params
 * @param {string} params.skillCategory - Category of skills to evaluate
 * @param {string[]} params.skillItems - Skills in that category
 * @param {string} params.targetRole - The target role
 * @returns {Promise<{keySkills: string[], hasGaps: boolean}>}
 */
export async function detectSkillGaps(skillCategory, skillItems, targetRole) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ skillCategory, skillItems, targetRole }),
    questions: {
      key_skills: {
        type: 'choice',
        instructions: 'Which skills are most important for this role?',
        criteria: Object.fromEntries(skillItems.map(skill => [skill, skill])),
      },
      has_gaps: {
        type: 'noul',
        instructions: 'Does this person have gaps in skills needed for this role?',
        criteria: { true: 'There are skill gaps', false: 'Skills are sufficient' },
      },
    },
  })

  return {
    keySkills: result.answers.key_skills.choice,
    hasGaps: result.answers.has_gaps.noul > 0.5,
    gapProbability: result.answers.has_gaps.noul,
  }
}

// ──────────────────────────────────────────────
// SECTION 2: AUTOMATION MANAGEMENT
// ──────────────────────────────────────────────

/**
 * Rank story beats by relevance to a visitor's interests.
 * 
 * @param {Object} params
 * @param {string} params.visitorInterest - Visitor's primary interest
 * @param {Array} params.storyBeats - Array of story beat objects
 * @returns {Promise<{ranked: Array<{id: string, relevance: number}>}>}
 */
export async function rankStoryBeats(visitorInterest, storyBeats) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ visitorInterest, storyBeats }),
    questions: {
      beat_relevance: {
        type: 'score',
        instructions: 'How relevant is this automation story to this visitor?',
        criteria: ['Not relevant', 'Somewhat relevant', 'Very relevant', 'Must-see'],
      },
    },
  })

  return {
    ranked: storyBeats.map((beat, index) => ({
      id: beat.id,
      relevance: result.answers.beat_relevance.scores[index] ?? 0,
    })),
  }
}

/**
 * Identify the most relevant featured agent for a visitor.
 * 
 * @param {Object} params
 * @param {string} params.visitorInterest - Visitor's interest area
 * @param {Array} params.featuredAgents - Array of agent objects
 * @returns {Promise<{priorityAgent: string, interestScore: number}>}
 */
export async function identifyPriorityAgent(visitorInterest, featuredAgents) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ visitorInterest, featuredAgents }),
    questions: {
      priority_agent: {
        type: 'choice',
        instructions: 'Which agent is most relevant to this visitor?',
        criteria: Object.fromEntries(featuredAgents.map(agent => [agent.name, agent.purpose])),
      },
      interest_score: {
        type: 'noul',
        instructions: 'Is this agent worth investigating further?',
        criteria: { true: 'Definitely worth investigating', false: 'Not as relevant' },
      },
    },
  })

  return {
    priorityAgent: result.answers.priority_agent.choice,
    interestScore: result.answers.interest_score.noul,
    agentProbability: result.answers.priority_agent.distribution?.[result.answers.priority_agent.choice] ?? 0,
  }
}

/**
 * Rank GitHub achievement badges by visitor relevance.
 * 
 * @param {Object} params
 * @param {Array} params.achievements - Array of achievement objects
 * @param {string} params.visitorRole - Visitor's professional role
 * @returns {Promise<{ranked: Array<{name: string, score: number}>}>}
 */
export async function rankAchievementBadges(achievements, visitorRole) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ achievements, visitorRole }),
    questions: {
      achievement_priority: {
        type: 'score',
        instructions: 'How impressive is this achievement for a visitor in this role?',
        criteria: ['Not impressive', 'Somewhat impressive', 'Very impressive', 'Exceptional'],
      },
    },
  })

  return {
    ranked: achievements.map((achievement, index) => ({
      name: achievement.name,
      score: result.answers.achievement_priority.scores[index] ?? 0,
    })),
  }
}

/**
 * Classify automation workflow health.
 * 
 * @param {Object} params
 * @param {string} params.workflowName - Name of the workflow
 * @param {string} params.workflowStatus - Current status
 * @returns {Promise<{isHealthy: boolean, riskLevel: string}>}
 */
export async function classifyWorkflowHealth(workflowName, workflowStatus) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ workflowName, workflowStatus }),
    questions: {
      workflow_health: {
        type: 'noul',
        instructions: 'Does this workflow show signs of instability or failure?',
        criteria: { true: 'Shows signs of instability', false: 'Running healthy' },
      },
      risk_level: {
        type: 'score',
        instructions: 'What is the risk level of this workflow?',
        criteria: ['Healthy', 'Minor issues', 'At risk', 'Critical'],
      },
    },
  })

  return {
    isHealthy: result.answers.workflow_health.noul < 0.5,
    riskLevel: result.answers.risk_level.score,
    healthProbability: result.answers.workflow_health.noul,
  }
}

// ──────────────────────────────────────────────
// SECTION 3: NAVIGATION & VISITOR MANAGEMENT
// ──────────────────────────────────────────────

/**
 * Classify visitor intent to route to the most relevant portfolio section.
 * 
 * @param {Object} params
 * @param {string} params.pageVisitDuration - How long they've been on the page
 * @param {string[]} params.sectionsViewed - Sections they've already seen
 * @param {string} params.referrer - Where they came from
 * @returns {Promise<{primaryIntent: string, isActionReady: boolean}>}
 */
export async function classifyVisitorIntent(pageVisitDuration, sectionsViewed, referrer) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ pageVisitDuration, sectionsViewed, referrer }),
    questions: {
      primary_intent: {
        type: 'choice',
        instructions: 'What is the visitor primarily looking for?',
        criteria: {
          work: 'Viewing projects and case studies',
          automation: 'Interested in automation and DevOps',
          about: 'Learning about the person',
          contact: 'Ready to connect or hire',
          home: 'Exploring the portfolio generally',
        },
      },
      is_action_ready: {
        type: 'noul',
        instructions: 'Is this visitor ready to take action (contact or hire)?',
        criteria: { true: 'Ready to contact or hire', false: 'Still browsing' },
      },
    },
  })

  return {
    primaryIntent: result.answers.primary_intent.choice,
    isActionReady: result.answers.is_action_ready.noul > 0.5,
    actionProbability: result.answers.is_action_ready.noul,
    intentProbability: result.answers.primary_intent.distribution?.[result.answers.primary_intent.choice] ?? 0,
  }
}

/**
 * Rank portfolio sections by visitor relevance.
 * 
 * @param {Object} params
 * @param {string} params.visitorRole - Visitor's professional role
 * @param {string[]} params.sections - List of sections
 * @returns {Promise<{ranked: Array<{section: string, priority: number}>}>}
 */
export async function rankSections(visitorRole, sections) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ visitorRole, sections }),
    questions: {
      section_priority: {
        type: 'score',
        instructions: 'How should this section be prioritized for this visitor?',
        criteria: ['Low priority', 'Somewhat relevant', 'Very relevant', 'Must-see first'],
      },
    },
  })

  return {
    ranked: sections.map((section, index) => ({
      section,
      priority: result.answers.section_priority.scores[index] ?? 0,
    })),
  }
}

/**
 * Predict the visitor's next action.
 * 
 * @param {Object} params
 * @param {string} params.currentSection - Current section being viewed
 * @param {number} params.timeOnPage - Time spent on page
 * @param {boolean} params.hasScrolled - Whether they've scrolled
 * @returns {Promise<{nextAction: string, engagementScore: number}>}
 */
export async function predictNextAction(currentSection, timeOnPage, hasScrolled) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ currentSection, timeOnPage, hasScrolled }),
    questions: {
      next_action: {
        type: 'choice',
        instructions: 'What is the visitor most likely to do next?',
        criteria: {
          scroll_to_work: 'Looking at projects',
          scroll_to_automation: 'Interested in automation',
          scroll_to_contact: 'Ready to connect',
          stay: 'Still browsing',
          leave: 'About to leave',
        },
      },
      engagement_score: {
        type: 'score',
        instructions: 'How engaged is this visitor?',
        criteria: ['Low engagement', 'Browsing', 'Actively exploring', 'Highly engaged'],
      },
    },
  })

  return {
    nextAction: result.answers.next_action.choice,
    engagementScore: result.answers.engagement_score.score,
    nextActionProbability: result.answers.next_action.distribution?.[result.answers.next_action.choice] ?? 0,
  }
}

// ──────────────────────────────────────────────
// SECTION 4: PROJECT & PLATFORM MANAGEMENT
// ──────────────────────────────────────────────

/**
 * Rank projects by visitor relevance.
 * 
 * @param {Object} params
 * @param {string} params.visitorInterest - Visitor's primary interest
 * @param {Array} params.projects - Array of project objects
 * @returns {Promise<{ranked: Array<{name: string, relevance: number}>}>}
 */
export async function rankProjects(visitorInterest, projects) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ visitorInterest, projects }),
    questions: {
      top_project: {
        type: 'choice',
        instructions: 'Which project would most interest this visitor?',
        criteria: Object.fromEntries(projects.map(p => [p.name, p.description])),
      },
      overall_interest: {
        type: 'score',
        instructions: 'How interested is this visitor in the portfolio?',
        criteria: ['Not interested', 'Browsing', 'Actively evaluating', 'Highly interested'],
      },
    },
  })

  return {
    topProject: result.answers.top_project.choice,
    overallInterest: result.answers.overall_interest.score,
    projects: projects.map((project, index) => ({
      name: project.name,
      relevance: result.answers.top_project.distribution?.[project.name] ?? 0,
    })),
  }
}

/**
 * Rank platforms by visitor relevance.
 * 
 * @param {Object} params
 * @param {string} params.visitorIndustry - Visitor's industry
 * @param {Array} params.platforms - Array of platform objects
 * @returns {Promise<{ranked: Array<{name: string, priority: number}>}>}
 */
export async function rankPlatforms(visitorIndustry, platforms) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ visitorIndustry, platforms }),
    questions: {
      platform_priority: {
        type: 'score',
        instructions: 'How relevant is this platform to this visitor?',
        criteria: ['Not relevant', 'Somewhat relevant', 'Very relevant', 'Essential'],
      },
    },
  })

  return {
    ranked: platforms.map((platform, index) => ({
      name: platform.name,
      priority: result.answers.platform_priority.scores[index] ?? 0,
    })),
  }
}

/**
 * Classify skill category priority for a visitor.
 * 
 * @param {Object} params
 * @param {string} params.visitorRole - Visitor's target role
 * @param {Object} params.skills - Skills object from config
 * @returns {Promise<{topCategory: string, hasMatch: boolean}>}
 */
export async function classifySkillPriority(visitorRole, skills) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ visitorRole, skills }),
    questions: {
      skill_category_priority: {
        type: 'choice',
        instructions: 'Which skill category is most important for this visitor?',
        criteria: Object.fromEntries(Object.entries(skills).map(([cat, items]) => [cat, `${cat}: ${items}`])),
      },
      has_match: {
        type: 'noul',
        instructions: "Does this category match the visitor's skill needs?",
        criteria: { true: 'Matches perfectly', false: 'Partial match or no match' },
      },
    },
  })

  return {
    topCategory: result.answers.skill_category_priority.choice,
    hasMatch: result.answers.has_match.noul > 0.5,
    matchProbability: result.answers.has_match.noul,
    categoryProbability: result.answers.skill_category_priority.distribution?.[result.answers.skill_category_priority.choice] ?? 0,
  }
}

// ──────────────────────────────────────────────
// SECTION 5: VISUAL & ART MANAGEMENT
// ──────────────────────────────────────────────

/**
 * Select the best art style preference for a visitor.
 * 
 * @param {Object} params
 * @param {string} params.visitorBehavior - How they interact with the site
 * @returns {Promise<{preferredStyle: string, engagementPrediction: boolean}>}
 */
export async function selectArtStyle(visitorBehavior) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ visitorBehavior }),
    questions: {
      art_preference: {
        type: 'choice',
        instructions: "What art style best matches this visitor's aesthetic preference?",
        criteria: {
          sketch: 'Hand-drawn pencil style',
          painted: 'Colored pencil/marker style',
          dynamic: 'Animated/3D style',
          minimal: 'Minimal clean style',
        },
      },
      will_engage: {
        type: 'noul',
        instructions: 'Will this visitor engage with the artwork?',
        criteria: { true: 'Will engage', false: 'Will not engage' },
      },
    },
  })

  return {
    preferredStyle: result.answers.art_preference.choice,
    willEngage: result.answers.will_engage.noul > 0.5,
    engagementProbability: result.answers.will_engage.noul,
    styleProbability: result.answers.art_preference.distribution?.[result.answers.art_preference.choice] ?? 0,
  }
}

/**
 * Select the most appropriate handwritten note for the current context.
 * 
 * @param {Object} params
 * @param {string} params.currentSection - Current section the visitor is on
 * @param {string} params.visitorType - Type of visitor (recruiter, client, peer)
 * @returns {Promise<{noteContent: string, confidence: number}>}
 */
export async function selectHandwrittenNote(currentSection, visitorType) {
  const result = await callSystemone({
    model: 'jev-latest',
    state: JSON.stringify({ currentSection, visitorType }),
    questions: {
      note_content: {
        type: 'choice',
        instructions: 'What handwritten note would be most appropriate for this visitor?',
        criteria: {
          portfolio_intro: 'About the portfolio',
          availability: 'Currently open to work',
          project_focus: 'Current project focus',
          personal_note: 'A personal touch',
        },
      },
    },
  })

  return {
    noteContent: result.answers.note_content.choice,
    confidence: result.answers.note_content.distribution?.[result.answers.note_content.choice] ?? 0,
  }
}

// ──────────────────────────────────────────────
// SECTION 6: BATCH OPERATIONS
// ──────────────────────────────────────────────

/**
 * Batch rank projects for multiple visitor profiles.
 */
export async function batchRankProjects(visitorProfiles, projects) {
  const results = await Promise.all(
    visitorProfiles.map((profile) => rankProjects(profile.interest, projects))
  )
  return results
}

/**
 * Batch classify visitor intents for multiple sessions.
 */
export async function batchClassifyVisitorIntents(sessions) {
  const results = await Promise.all(
    sessions.map((session) => classifyVisitorIntent(session.duration, session.sections, session.referrer))
  )
  return results
}

/**
 * Batch rank story beats for multiple visitor interests.
 */
export async function batchRankStoryBeats(visitorInterests, storyBeats) {
  const results = await Promise.all(
    visitorInterests.map((interest) => rankStoryBeats(interest, storyBeats))
  )
  return results
}
