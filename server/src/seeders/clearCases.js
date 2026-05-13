/**
 * Clears all case-related data from the database.
 * Preserves: Users, Citizens, Admins, Lawyers
 * Deletes:   Notifications, Hearings, AISummaries, LawyerRequests, Cases
 *
 * Usage: node src/seeders/clearCases.js
 */
require('dotenv').config();
const { sequelize } = require('../config/db');
require('../models');
const { Case, AISummary, Hearing, Notification, LawyerRequest } = require('../models');

async function clearCases() {
  // Retry connection up to 3 times (Neon free-tier wakes slowly)
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Connection attempt ${attempt}...`);
      await sequelize.authenticate({ retry: { max: 3 } });
      console.log('✓ Database connected\n');
      break;
    } catch (err) {
      if (attempt === 3) {
        console.error('Failed to connect after 3 attempts:', err.message);
        process.exit(1);
      }
      console.log(`  Retrying in 5s...`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  try {
    // Delete in dependency order (children first)
    let count;

    count = await Notification.destroy({ where: {} });
    console.log(`  Deleted ${count} Notification(s)`);

    count = await Hearing.destroy({ where: {} });
    console.log(`  Deleted ${count} Hearing(s)`);

    count = await AISummary.destroy({ where: {} });
    console.log(`  Deleted ${count} AISummary(ies)`);

    count = await LawyerRequest.destroy({ where: {} });
    console.log(`  Deleted ${count} LawyerRequest(s)`);

    count = await Case.destroy({ where: {} });
    console.log(`  Deleted ${count} Case(s)`);

    console.log('\n✅ All case data cleared. Users and lawyers are untouched.');
    process.exit(0);
  } catch (err) {
    console.error('Error deleting data:', err.message);
    process.exit(1);
  }
}

clearCases();
