require('dotenv').config();
const { sequelize } = require('../config/db');
const { User, Lawyer, Admin } = require('../models');

const createTestUsers = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('✓ Database connected & synced');

    // ── 1. Create Admin user ──────────────────────────────────────────────
    const [adminUser, adminCreated] = await User.findOrCreate({
      where: { email: 'admin@lawpoint.com' },
      defaults: {
        name: 'Admin User',
        email: 'admin@lawpoint.com',
        passwordHash: 'admin1234',   // hashed by beforeCreate hook
        role: 'admin',
      },
    });

    if (adminCreated) {
      await Admin.findOrCreate({
        where: { userId: adminUser.userId },
        defaults: {
          userId: adminUser.userId,
          employeeId: 'EMP-ADMIN-001',
          courtType: 'criminal',
        },
      });
      console.log('✓ Admin created  → email: admin@lawpoint.com  password: admin1234');
    } else {
      console.log('✓ Admin already exists');
    }

    // ── 2. Create Lawyer user accounts ──────────────────────────────────
    const lawyerAccounts = [
      // Criminal court
      { email: 'rajesh@lawpoint.com', name: 'Rajesh Kumar',   password: 'lawyer1234', barId: 'CRI001' },
      { email: 'priya@lawpoint.com',  name: 'Priya Sharma',   password: 'lawyer1234', barId: 'CRI002' },
      { email: 'amit@lawpoint.com',   name: 'Amit Verma',     password: 'lawyer1234', barId: 'CRI003' },
      // Civil court
      { email: 'neha@lawpoint.com',   name: 'Neha Gupta',     password: 'lawyer1234', barId: 'CIV001' },
      { email: 'arjun@lawpoint.com',  name: 'Arjun Singh',    password: 'lawyer1234', barId: 'CIV002' },
      { email: 'deepika@lawpoint.com', name: 'Deepika Patel', password: 'lawyer1234', barId: 'CIV003' },
      // Family court
      { email: 'sanjay@lawpoint.com', name: 'Sanjay Reddy',   password: 'lawyer1234', barId: 'FAM001' },
      { email: 'anjali@lawpoint.com', name: 'Anjali Desai',   password: 'lawyer1234', barId: 'FAM002' },
      { email: 'vikram@lawpoint.com', name: 'Vikram Nair',    password: 'lawyer1234', barId: 'FAM003' },
    ];

    for (const acc of lawyerAccounts) {
      // Find the existing lawyer profile by barId
      const lawyerProfile = await Lawyer.findOne({ where: { barId: acc.barId } });
      if (!lawyerProfile) {
        console.log(`⚠ Lawyer profile with barId ${acc.barId} not found — run "npm run seed" first`);
        continue;
      }

      // Create the User account if it doesn't exist
      const [userRecord, userCreated] = await User.findOrCreate({
        where: { email: acc.email },
        defaults: {
          name: acc.name,
          email: acc.email,
          passwordHash: acc.password,
          role: 'lawyer',
        },
      });

      // Link the User to the Lawyer profile
      if (userCreated || !lawyerProfile.userId) {
        await lawyerProfile.update({ userId: userRecord.userId });
        console.log(`✓ Lawyer account → email: ${acc.email}  password: ${acc.password}  (${lawyerProfile.courtType} court)`);
      } else {
        console.log(`✓ Lawyer ${acc.email} already exists`);
      }
    }

    console.log('\n✅ Done! You can now log in with these test accounts.');
    process.exit(0);
  } catch (err) {
    console.error('Error creating test users:', err.message);
    process.exit(1);
  }
};

createTestUsers();
