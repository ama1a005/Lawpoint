const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LawyerMatchScore = sequelize.define('LawyerMatchScore', {
  scoreId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  caseId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  lawyerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  matchReason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  scoredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'lawyer_match_scores',
  timestamps: false,
});

module.exports = LawyerMatchScore;
