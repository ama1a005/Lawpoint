const User = require('./User');
const Citizen = require('./Citizen');
const Admin = require('./Admin');
const Lawyer = require('./Lawyer');
const Case = require('./Case');
const AISummary = require('./AISummary');
const Hearing = require('./Hearing');
const Notification = require('./Notification');
const LawyerRequest = require('./LawyerRequest');
const LawyerMatchScore = require('./LawyerMatchScore');

// Set up associations
Case.hasOne(AISummary, { foreignKey: 'caseId', onDelete: 'CASCADE' });
AISummary.belongsTo(Case, { foreignKey: 'caseId' });

Case.hasMany(Hearing, { foreignKey: 'caseId', onDelete: 'CASCADE' });
Hearing.belongsTo(Case, { foreignKey: 'caseId' });

Case.hasMany(Notification, { foreignKey: 'caseId', onDelete: 'CASCADE' });
Notification.belongsTo(Case, { foreignKey: 'caseId' });

Case.hasMany(LawyerRequest, { foreignKey: 'caseId', onDelete: 'CASCADE' });
LawyerRequest.belongsTo(Case, { foreignKey: 'caseId' });

LawyerRequest.belongsTo(Lawyer, { foreignKey: 'lawyerId' });
Lawyer.hasMany(LawyerRequest, { foreignKey: 'lawyerId' });

Case.hasMany(LawyerMatchScore, { foreignKey: 'caseId', onDelete: 'CASCADE' });
LawyerMatchScore.belongsTo(Case, { foreignKey: 'caseId' });

Lawyer.hasMany(LawyerMatchScore, { foreignKey: 'lawyerId' });
LawyerMatchScore.belongsTo(Lawyer, { foreignKey: 'lawyerId' });

// Case belongs to a Lawyer (assigned)
Case.belongsTo(Lawyer, { foreignKey: 'lawyerId', as: 'assignedLawyer' });

module.exports = {
  User,
  Citizen,
  Admin,
  Lawyer,
  Case,
  AISummary,
  Hearing,
  Notification,
  LawyerRequest,
  LawyerMatchScore,
};
