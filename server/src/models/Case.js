const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Case = sequelize.define('Case', {
  caseId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  citizenId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  courtType: {
    type: DataTypes.ENUM('criminal', 'civil', 'family'),
    allowNull: true, // Set after AI assessment
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'active', 'closed'),
    defaultValue: 'pending',
  },
  complaintText: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  accusedPartyName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  accusedPartyContact: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  lawyerId: {
    type: DataTypes.UUID,
    allowNull: true, // Assigned after lawyer accepts
  },
  closedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  outcome: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  rejectionNote: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  caseOutcome: {
    type: DataTypes.ENUM('won', 'lost', 'settlement', 'dismissed'),
    allowNull: true,
  },
}, {
  timestamps: false,
});

module.exports = Case;
