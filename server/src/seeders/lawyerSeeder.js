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
      { name: 'Rajesh Kumar',   barId: 'CRI001', specialisation: 'Criminal Defense',    courtType: 'criminal' },
      { name: 'Priya Sharma',   barId: 'CRI002', specialisation: 'Criminal Law',         courtType: 'criminal' },
      { name: 'Amit Verma',     barId: 'CRI003', specialisation: 'Criminal Prosecution', courtType: 'criminal' },

      // Civil lawyers
      { name: 'Neha Gupta',     barId: 'CIV001', specialisation: 'Contract Law',         courtType: 'civil' },
      { name: 'Arjun Singh',    barId: 'CIV002', specialisation: 'Property Law',         courtType: 'civil' },
      { name: 'Deepika Patel',  barId: 'CIV003', specialisation: 'Commercial Law',       courtType: 'civil' },

      // Family lawyers
      { name: 'Sanjay Reddy',   barId: 'FAM001', specialisation: 'Divorce Law',          courtType: 'family' },
      { name: 'Anjali Desai',   barId: 'FAM002', specialisation: 'Child Custody',        courtType: 'family' },
      { name: 'Vikram Nair',    barId: 'FAM003', specialisation: 'Marriage Law',         courtType: 'family' },
    ];

    // Create lawyers — Sequelize auto-generates lawyerId via defaultValue: DataTypes.UUIDV4
    const createdLawyers = await Promise.all(
      lawyers.map(lawyer =>
        Lawyer.create({ ...lawyer, isAvailable: true })
      )
    );

    console.log(`✓ Successfully seeded ${createdLawyers.length} lawyers`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding lawyers:', err);
    process.exit(1);
  }
};

seedLawyers();
