const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Admin = sequelize.define('Admin', {
  adminId: {
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
    allowNull: false,
  },
  employeeId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  courtType: {
    type: DataTypes.ENUM('criminal', 'civil', 'family'),
    allowNull: false,
  },
}, {
  timestamps: false,
});

Admin.belongsTo(User, { foreignKey: 'userId' });

module.exports = Admin;
