const { Hearing, Case, Notification, Lawyer, User } = require('../models');
const notificationService = require('../services/notificationService');

// ── Helper ─────────────────────────────────────────────────────────────────
const createAndSend = async (caseId, recipientContact, channel, message, sendFn) => {
  const notif = await Notification.create({ caseId, recipientContact, channel, message, status: 'pending' });
  sendFn()
    .then((result) => notif.update({ status: result.success ? 'sent' : 'failed', sentAt: new Date() }))
    .catch(() => notif.update({ status: 'failed' }));
};

// ── Create Hearing (admin) ─────────────────────────────────────────────────
const createHearing = async (req, res) => {
  try {
    const { caseId, scheduledDate, notes } = req.body;
    if (!caseId || !scheduledDate) return res.status(400).json({ success: false, message: 'caseId and scheduledDate are required.' });

    const caseData = await Case.findByPk(caseId);
    if (!caseData) return res.status(404).json({ success: false, message: 'Case not found' });

    const hearing = await Hearing.create({ caseId, scheduledDate, notes });

    // Notify citizen and assigned lawyer
    const citizen = await User.findByPk(caseData.citizenId);
    const notifyParty = async (email) => {
      if (!email) return;
      const message = `A hearing has been scheduled for Case ${caseId} on ${new Date(scheduledDate).toDateString()}.`;
      await createAndSend(caseId, email, 'email', message,
        () => notificationService.notifyHearingScheduled(email, caseId, scheduledDate));
    };

    if (citizen) await notifyParty(citizen.email);

    if (caseData.lawyerId) {
      const lawyer = await Lawyer.findByPk(caseData.lawyerId);
      if (lawyer?.userId) {
        const lawyerUser = await User.findByPk(lawyer.userId);
        if (lawyerUser) await notifyParty(lawyerUser.email);
      }
    }

    res.status(201).json({ success: true, message: 'Hearing scheduled.', hearing });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to schedule hearing', error: err.message });
  }
};

// ── Update Hearing Outcome (admin) ─────────────────────────────────────────
const updateHearing = async (req, res) => {
  try {
    const { outcome, nextDate } = req.body;

    const hearing = await Hearing.findByPk(req.params.id);
    if (!hearing) return res.status(404).json({ success: false, message: 'Hearing not found' });

    const updateData = { outcome };
    if (nextDate) updateData.scheduledDate = nextDate;
    await hearing.update(updateData);

    res.json({ success: true, message: 'Hearing updated.', hearing });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update hearing', error: err.message });
  }
};

// ── Get Hearings for a Case ────────────────────────────────────────────────
const getHearings = async (req, res) => {
  try {
    const hearings = await Hearing.findAll({
      where: { caseId: req.params.caseId },
      order: [['scheduledDate', 'ASC']],
    });
    res.json({ success: true, hearings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch hearings', error: err.message });
  }
};

module.exports = { createHearing, updateHearing, getHearings };
