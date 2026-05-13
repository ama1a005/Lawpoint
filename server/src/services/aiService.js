require('dotenv').config();
const AI_CONFIG = require('../config/ai');

// ── PII Sanitisation ───────────────────────────────────────────────────────
// Strip identifiable info before sending complaint text to any external LLM.
const PII_PATTERNS = [
  { name: 'phone',   regex: /(\+91|0)?[6-9]\d{9}/g,              replace: '[PHONE]'   },
  { name: 'email',   regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replace: '[EMAIL]' },
  { name: 'aadhaar', regex: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,        replace: '[AADHAAR]' },
  { name: 'pan',     regex: /\b[A-Z]{5}\d{4}[A-Z]\b/g,           replace: '[PAN]'     },
];

const sanitiseText = (text) => {
  let sanitised = text;
  for (const { regex, replace } of PII_PATTERNS) {
    sanitised = sanitised.replace(regex, replace);
  }
  return sanitised;
};

// ── Prompt ─────────────────────────────────────────────────────────────────
const buildPrompt = (text) => `
You are a legal analyst for an Indian court case management system called LawPoint.
Analyse the complaint below and respond with ONLY a valid JSON object.

Complaint:
"""
${text}
"""

Required JSON format:
{
  "recommendedCourt": "<criminal | civil | family>",
  "relevanceScore": <float 0.0–1.0>,
  "parsedSummary": "<2–3 sentence factual case analysis for court administrators>"
}

Court classification rules:
- criminal : IPC offences — theft, robbery, assault, murder, fraud, forgery, harassment, stalking, cybercrime, extortion, cheating
- civil    : property disputes, contract breaches, money recovery, tort claims, defamation, landlord-tenant disputes, injunctions
- family   : divorce, child custody, maintenance/alimony, inheritance, domestic violence, adoption, guardianship

Relevance scoring guidelines:
- 1.0: Clear legal matter with specific incidents, dates, or evidence mentioned
- 0.7-0.9: Valid legal complaint but missing some specifics
- 0.4-0.6: Vague or borderline legal matter
- 0.0-0.3: Not a clear legal complaint or irrelevant content

For the parsedSummary: Write a concise factual analysis suitable for a court administrator. Focus on the nature of the dispute, parties involved, and recommended legal pathway. Do NOT include personal opinions.

Return ONLY the JSON object. No extra text, no markdown.
`.trim();

// ── Schema Validation ──────────────────────────────────────────────────────
const VALID_COURTS = ['criminal', 'civil', 'family'];

const parseAndValidate = (raw) => {
  const parsed = JSON.parse(raw);
  if (!VALID_COURTS.includes(parsed.recommendedCourt)) throw new Error('Invalid recommendedCourt');
  const score = parseFloat(parsed.relevanceScore);
  if (isNaN(score) || score < 0 || score > 1) throw new Error('Invalid relevanceScore');
  if (typeof parsed.parsedSummary !== 'string' || !parsed.parsedSummary.trim()) throw new Error('Invalid parsedSummary');
  return {
    recommendedCourt: parsed.recommendedCourt,
    relevanceScore: Math.round(score * 100) / 100,
    parsedSummary: parsed.parsedSummary.trim(),
  };
};

// ── OpenAI Call ────────────────────────────────────────────────────────────
const callOpenAI = async (prompt) => {
  const res = await fetch(AI_CONFIG.openai.baseURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_CONFIG.openai.apiKey}`,
    },
    body: JSON.stringify({
      model: AI_CONFIG.openai.model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
};

// ── Gemini Call ────────────────────────────────────────────────────────────
const callGemini = async (prompt) => {
  const url = `${AI_CONFIG.gemini.baseURL}?key=${AI_CONFIG.gemini.apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0, responseMimeType: 'application/json' },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
};

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Generic AI call helper — tries OpenAI first, falls back to Gemini.
 * Returns raw text response. Throws if neither key is configured.
 */
const callAI = async (prompt) => {
  if (AI_CONFIG.openai.apiKey) {
    return await callOpenAI(prompt);
  } else if (AI_CONFIG.gemini.apiKey) {
    return await callGemini(prompt);
  }
  throw new Error('No AI API key configured');
};

/**
 * Assess a complaint and recommend a court type.
 */
const assessComplaint = async (complaintText) => {
  const sanitised = sanitiseText(complaintText);
  const prompt = buildPrompt(sanitised);

  let rawResponse = null;

  try {
    if (AI_CONFIG.openai.apiKey) {
      rawResponse = await callOpenAI(prompt);
    } else if (AI_CONFIG.gemini.apiKey) {
      rawResponse = await callGemini(prompt);
    } else {
      console.warn('[aiService] No AI API key configured. Using fallback assessment.');
      return {
        recommendedCourt: 'civil',
        relevanceScore: 0.5,
        parsedSummary: 'Automated assessment unavailable — no AI API key configured. Admin must manually review and classify this complaint.',
      };
    }

    return parseAndValidate(rawResponse);
  } catch (err) {
    console.error('[aiService] Assessment failed:', err.message);
    return {
      recommendedCourt: 'civil',
      relevanceScore: 0.0,
      parsedSummary: 'Automated assessment failed. Admin must manually review and classify this complaint.',
    };
  }
};

/**
 * Score lawyers for a case based on their profiles and the complaint text.
 * @param {string} sanitisedText - PII-stripped complaint text
 * @param {Array} lawyers - Array of lawyer objects with stats
 * @returns {Array<{ lawyerId, score, matchReason }>}
 */
const scoreLawyersForCase = async (sanitisedText, lawyers) => {
  const lawyerProfiles = lawyers.map(l => ({
    lawyerId:       l.lawyerId,
    specialisation: l.specialisation,
    casesHandled:   l.casesHandled || 0,
    wins:           l.wins || 0,
    losses:         l.losses || 0,
    winRate:        (l.casesHandled || 0) > 0
                      ? Math.round(((l.wins || 0) / l.casesHandled) * 100)
                      : null,
    recentCaseTypes: l.recentCaseTypes || [],
  }));

  const prompt = `
You are a legal case matching assistant for the LawPoint court management system.

A citizen has filed the following complaint:
"${sanitisedText}"

Below is a list of available lawyers with their profiles:
${JSON.stringify(lawyerProfiles, null, 2)}

For each lawyer, return a match score from 0 to 100 and a one-sentence reason.

Scoring criteria:
- Higher score if their specialisation closely matches the complaint topic
- Higher score if their recent case types are similar to this complaint
- Higher score if their win rate is strong (above 60%)
- Lower score if they have very few cases handled (less experience)
- Lower score if their recent work is unrelated to this complaint

Respond ONLY with a JSON array, one object per lawyer:
[
  { "lawyerId": "copy-from-input", "score": 0-100, "matchReason": "one sentence for citizen" }
]

No extra text outside the JSON array.
  `.trim();

  try {
    const raw = await callAI(prompt);
    // Clean potential markdown code fences
    const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);

    for (const entry of parsed) {
      if (!entry.lawyerId || entry.score === undefined || !entry.matchReason) {
        throw new Error(`Incomplete score entry for lawyerId: ${entry.lawyerId}`);
      }
      entry.score = Math.max(0, Math.min(100, Math.round(entry.score)));
    }

    return parsed;
  } catch (err) {
    console.error('[aiService] Lawyer scoring failed:', err.message);
    // Return neutral scores as fallback
    return lawyers.map(l => ({
      lawyerId: l.lawyerId,
      score: 50,
      matchReason: 'AI scoring unavailable — default match score applied.',
    }));
  }
};

/**
 * Score a complaint draft for quality before submission.
 * @param {string} draftText - Raw complaint draft
 * @returns {{ score, grade, missingElements[], suggestions[], adminLikelyVerdict, verdictReason }}
 */
const scoreComplaintDraft = async (draftText) => {
  const sanitised = sanitiseText(draftText);

  const prompt = `
You are a legal complaint quality reviewer helping a citizen improve their complaint
before it is reviewed by a court administrator.

Analyse the following complaint draft:
"${sanitised}"

Evaluate it on these criteria:
1. Clarity — Is the problem clearly described?
2. Specificity — Are dates, locations, or specific incidents mentioned?
3. Evidence signals — Does the citizen reference any proof, witnesses, or documentation?
4. Legal relevance — Does the complaint describe an actionable grievance?
5. Completeness — Are there obvious gaps a court official would question?

Respond ONLY with a JSON object containing exactly these fields:

{
  "score": integer 0-100,
  "grade": "Strong" | "Moderate" | "Weak",
  "missingElements": ["specific things absent from the complaint"],
  "suggestions": ["concrete, actionable advice for the citizen"],
  "adminLikelyVerdict": "Likely to approve" | "May request changes" | "Likely to reject",
  "verdictReason": "one sentence explaining the prediction"
}

Be honest but constructive. Write suggestions in simple language.
Return ONLY the JSON object. No extra text, no markdown.
  `.trim();

  try {
    const raw = await callAI(prompt);
    const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const required = ['score', 'grade', 'missingElements', 'suggestions', 'adminLikelyVerdict', 'verdictReason'];
    for (const field of required) {
      if (!(field in parsed)) throw new Error(`Draft review missing field: ${field}`);
    }

    parsed.score = Math.max(0, Math.min(100, Math.round(parsed.score)));
    return parsed;
  } catch (err) {
    console.error('[aiService] Draft review failed:', err.message);
    return {
      score: 50,
      grade: 'Moderate',
      missingElements: ['AI review unavailable — could not analyse your complaint'],
      suggestions: ['Try adding specific dates, locations, and evidence to strengthen your complaint'],
      adminLikelyVerdict: 'May request changes',
      verdictReason: 'AI review unavailable — default assessment applied.',
    };
  }
};

/**
 * Refine/rewrite a complaint draft to improve its quality.
 * Preserves all original facts but improves clarity, structure, and legal relevance.
 * @param {string} draftText - Current complaint draft
 * @returns {{ refinedText: string, changesSummary: string }}
 */
const refineComplaintDraft = async (draftText) => {
  const sanitised = sanitiseText(draftText);

  const prompt = `
You are a legal writing assistant for a court complaint filing system.

A citizen has written the following complaint draft:
"${sanitised}"

Rewrite this complaint to make it stronger and more effective for court review. Follow these rules:

1. PRESERVE every fact, date, name, location, and detail from the original — do NOT invent or assume new facts
2. Improve clarity and structure — use clear paragraphs
3. Add formal legal tone while keeping it readable
4. Highlight key evidence and damages mentioned
5. Make the timeline of events clearer if dates are mentioned
6. Keep the length reasonable — don't make it excessively longer than the original
7. Write in first person as the citizen

Respond ONLY with a JSON object:
{
  "refinedText": "the improved complaint text",
  "changesSummary": "one sentence describing what you changed"
}

No extra text outside the JSON.
  `.trim();

  try {
    const raw = await callAI(prompt);
    const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.refinedText || !parsed.changesSummary) {
      throw new Error('Missing fields in refine response');
    }

    return parsed;
  } catch (err) {
    console.error('[aiService] Draft refine failed:', err.message);
    return {
      refinedText: draftText,
      changesSummary: 'AI refinement unavailable — original text preserved.',
    };
  }
};

module.exports = { assessComplaint, scoreLawyersForCase, scoreComplaintDraft, refineComplaintDraft };

