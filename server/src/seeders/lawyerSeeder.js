require('dotenv').config();
const { Lawyer } = require('../models');
const { sequelize } = require('../config/db');

const seedLawyers = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Sync models so tables exist before seeding
    await sequelize.sync({ alter: true });
    console.log('✓ Database synced');

    // Check if lawyers already exist
    const count = await Lawyer.count();
    if (count > 0) {
      console.log('✓ Lawyers already seeded, skipping...');
      process.exit(0);
    }

    const lawyers = [
      // Criminal lawyers
      {
        name: 'Rajesh Kumar', barId: 'CRI001', specialisation: 'Criminal Defense', courtType: 'criminal',
        casesHandled: 87, wins: 62, losses: 25,
        recentCaseTypes: ['theft', 'assault', 'fraud', 'robbery', 'cybercrime', 'extortion', 'theft', 'assault', 'cheating', 'stalking'],
      },
      {
        name: 'Priya Sharma', barId: 'CRI002', specialisation: 'Criminal Law', courtType: 'criminal',
        casesHandled: 54, wins: 35, losses: 19,
        recentCaseTypes: ['murder', 'assault', 'forgery', 'harassment', 'fraud', 'robbery', 'extortion', 'cybercrime', 'cheating', 'assault'],
      },
      {
        name: 'Amit Verma', barId: 'CRI003', specialisation: 'Criminal Prosecution', courtType: 'criminal',
        casesHandled: 112, wins: 89, losses: 23,
        recentCaseTypes: ['fraud', 'forgery', 'cheating', 'cybercrime', 'extortion', 'theft', 'fraud', 'money laundering', 'forgery', 'cheating'],
      },

      // Civil lawyers
      {
        name: 'Neha Gupta', barId: 'CIV001', specialisation: 'Contract Law', courtType: 'civil',
        casesHandled: 68, wins: 48, losses: 20,
        recentCaseTypes: ['contract breach', 'money recovery', 'business dispute', 'contract breach', 'injunction', 'defamation', 'contract breach', 'tort claim', 'money recovery', 'business dispute'],
      },
      {
        name: 'Arjun Singh', barId: 'CIV002', specialisation: 'Property Law', courtType: 'civil',
        casesHandled: 93, wins: 71, losses: 22,
        recentCaseTypes: ['property dispute', 'land dispute', 'landlord-tenant', 'property dispute', 'encroachment', 'property dispute', 'land dispute', 'title dispute', 'eviction', 'property dispute'],
      },
      {
        name: 'Deepika Patel', barId: 'CIV003', specialisation: 'Commercial Law', courtType: 'civil',
        casesHandled: 45, wins: 28, losses: 17,
        recentCaseTypes: ['defamation', 'tort claim', 'commercial dispute', 'money recovery', 'contract breach', 'injunction', 'defamation', 'business dispute', 'tort claim', 'commercial dispute'],
      },

      // Family lawyers
      {
        name: 'Sanjay Reddy', barId: 'FAM001', specialisation: 'Divorce Law', courtType: 'family',
        casesHandled: 76, wins: 52, losses: 24,
        recentCaseTypes: ['divorce', 'alimony', 'divorce', 'maintenance', 'divorce', 'property settlement', 'divorce', 'alimony', 'mutual consent divorce', 'divorce'],
      },
      {
        name: 'Anjali Desai', barId: 'FAM002', specialisation: 'Child Custody', courtType: 'family',
        casesHandled: 61, wins: 45, losses: 16,
        recentCaseTypes: ['child custody', 'guardianship', 'child custody', 'visitation rights', 'adoption', 'child custody', 'guardianship', 'child custody', 'adoption', 'child welfare'],
      },
      {
        name: 'Vikram Nair', barId: 'FAM003', specialisation: 'Marriage Law', courtType: 'family',
        casesHandled: 38, wins: 22, losses: 16,
        recentCaseTypes: ['domestic violence', 'inheritance', 'domestic violence', 'maintenance', 'inheritance', 'domestic violence', 'dowry harassment', 'domestic violence', 'inheritance', 'maintenance'],
      },
    ];

    // Create lawyers — Sequelize auto-generates lawyerId via defaultValue: DataTypes.UUIDV4
    const createdLawyers = await Promise.all(
      lawyers.map(lawyer =>
        Lawyer.create({ ...lawyer, isAvailable: true })
      )
    );

    console.log(`✓ Successfully seeded ${createdLawyers.length} lawyers with case history`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding lawyers:', err);
    process.exit(1);
  }
};

seedLawyers();
