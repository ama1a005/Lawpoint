const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Lawyer = sequelize.define('Lawyer', {
  lawyerId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'userId',
    },
    allowNull: true, // Pre-seeded lawyers may not have users yet
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  barId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  specialisation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  courtType: {
    type: DataTypes.ENUM('criminal', 'civil', 'family'),
    allowNull: false,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  casesHandled: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  wins: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  losses: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  recentCaseTypes: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  timestamps: false,
});

Lawyer.belongsTo(User, { foreignKey: 'userId', allowNull: true });

module.exports = Lawyer;
