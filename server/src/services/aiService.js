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
 * Assess a complaint and recommend a court type.
 * Raw LLM output never leaves this function — only validated schema fields are returned.
 *
 * @param {string} complaintText - Raw complaint text (may contain PII).
 * @returns {{ recommendedCourt: string, relevanceScore: number, parsedSummary: string }}
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

module.exports = { assessComplaint };
