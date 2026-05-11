const { Sequelize } = require('sequelize');
require('dotenv').config();

// Connect to PostgreSQL database
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
});

// Test connection
sequelize.authenticate()
  .then(() => console.log('✓ Database connected'))
  .catch(err => console.error('Database connection failed:', err));

module.exports = { sequelize };
