const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AISummary = sequelize.define('AISummary', {
  summaryId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  caseId: {
    type: DataTypes.UUID,
    unique: true,
    allowNull: false,
  },
  recommendedCourt: {
    type: DataTypes.ENUM('criminal', 'civil', 'family'),
    allowNull: false,
  },
  relevanceScore: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  parsedSummary: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  generatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
});

module.exports = AISummary;
