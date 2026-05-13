/**
 * Re-run AI assessments for all cases that have stale/fallback summaries.
 * Usage: node src/seeders/refreshAISummaries.js
 */
require('dotenv').config();

const { sequelize } = require('../config/db');

// Load models + associations
const { Case, AISummary } = require('../models');
const aiService = require('../services/aiService');

async function refresh() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    const cases = await Case.findAll({ include: [{ model: AISummary }] });
    console.log(`Found ${cases.length} case(s). Refreshing AI summaries...\n`);

    for (const c of cases) {
      const plain = c.toJSON();
      const caseId = plain.caseId;
      const text = plain.complaintText;

      console.log(`── Case ${caseId}: "${plain.title}"`);

      if (!text) {
        console.log('   ⚠ No complaint text — skipping.\n');
        continue;
      }

      try {
        const result = await aiService.assessComplaint(text);
        console.log(`   AI → ${result.recommendedCourt} (score: ${result.relevanceScore})`);
        console.log(`   Summary: ${result.parsedSummary.substring(0, 100)}...`);

        if (plain.AISummary) {
          // Update existing record
          await AISummary.update(
            {
              recommendedCourt: result.recommendedCourt,
              relevanceScore: result.relevanceScore,
              parsedSummary: result.parsedSummary,
              generatedAt: new Date(),
            },
            { where: { caseId } }
          );
          console.log('   ✓ Updated existing AI summary.\n');
        } else {
          // Create new record
          await AISummary.create({
            caseId,
            recommendedCourt: result.recommendedCourt,
            relevanceScore: result.relevanceScore,
            parsedSummary: result.parsedSummary,
          });
          console.log('   ✓ Created new AI summary.\n');
        }
      } catch (err) {
        console.error(`   ✗ Failed: ${err.message}\n`);
      }
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Fatal:', err.message);
    process.exit(1);
  }
}

refresh();
