require('dotenv').config();

/**
 * AI provider configuration.
 * The system prefers OpenAI if OPENAI_API_KEY is set, falls back to Gemini.
 * All calls use Node 18+ native fetch — no additional SDK required.
 */
const AI_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || null,
    baseURL: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || null,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    model: 'gemini-2.5-flash',
  },
};

module.exports = AI_CONFIG;
