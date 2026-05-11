const { Lawyer, LawyerRequest, Case, Notification, User } = require('../models');
const notificationService = require('../services/notificationService');

// ── Helper ─────────────────────────────────────────────────────────────────
const createAndSend = async (caseId, recipientContact, channel, message, sendFn) => {
  const notif = await Notification.create({ caseId, recipientContact, channel, message, status: 'pending' });
  sendFn()
    .then((result) => notif.update({ status: result.success ? 'sent' : 'failed', sentAt: new Date() }))
    .catch(() => notif.update({ status: 'failed' }));
};

// ── Get Lawyers ────────────────────────────────────────────────────────────
const getLawyers = async (req, res) => {
  try {
    const { courtType } = req.query;
    const where = { isAvailable: true };
    if (courtType) where.courtType = courtType;

    const lawyers = await Lawyer.findAll({
      where,
      attributes: ['lawyerId', 'name', 'barId', 'specialisation', 'courtType', 'isAvailable'],
    });

    res.json({ success: true, lawyers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch lawyers', error: err.message });
  }
};

// ── Send Lawyer Request (citizen) ──────────────────────────────────────────
const sendRequest = async (req, res) => {
  try {
    const { caseId, lawyerId } = req.body;
    if (!caseId || !lawyerId) return res.status(400).json({ success: false, message: 'caseId and lawyerId are required.' });

    const caseData = await Case.findByPk(caseId);
    if (!caseData) return res.status(404).json({ success: false, message: 'Case not found' });
    if (caseData.citizenId !== req.user.userId) return res.status(403).json({ success: false, message: 'You can only request lawyers for your own cases.' });
    if (!['approved', 'active'].includes(caseData.status)) return res.status(400).json({ success: false, message: 'Lawyer requests can only be made for approved or active cases.' });

    const lawyer = await Lawyer.findByPk(lawyerId);
    if (!lawyer) return res.status(404).json({ success: false, message: 'Lawyer not found' });
    if (!lawyer.isAvailable) return res.status(400).json({ success: false, message: 'Lawyer is currently unavailable.' });

    // Guard: no duplicate pending request for same case+lawyer
    const existing = await LawyerRequest.findOne({ where: { caseId, lawyerId, status: 'pending' } });
    if (existing) return res.status(409).json({ success: false, message: 'A pending request already exists for this lawyer.' });

    const request = await LawyerRequest.create({ caseId, lawyerId, status: 'pending' });

    res.status(201).json({ success: true, message: 'Request sent to lawyer.', request });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send request', error: err.message });
  }
};

// ── Accept Request (lawyer) ────────────────────────────────────────────────
const acceptRequest = async (req, res) => {
  try {
    const request = await LawyerRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    const lawyer = await Lawyer.findOne({ where: { userId: req.user.userId } });
    if (!lawyer || lawyer.lawyerId !== request.lawyerId) return res.status(403).json({ success: false, message: 'Unauthorized' });
    if (request.status !== 'pending') return res.status(400).json({ success: false, message: `Request is already ${request.status}` });

    await request.update({ status: 'accepted', respondedAt: new Date() });
    await Case.update({ status: 'active', lawyerId: request.lawyerId }, { where: { caseId: request.caseId } });

    // Notify citizen
    const caseData = await Case.findByPk(request.caseId);
    const citizen = await User.findByPk(caseData.citizenId);
    if (citizen) {
      const message = `Your lawyer request for Case ${request.caseId} has been accepted by ${lawyer.name}. Your case is now active.`;
      await createAndSend(request.caseId, citizen.email, 'email', message,
        () => notificationService.notifyCitizenLawyerAccepted(citizen.email, request.caseId, lawyer.name));
    }

    res.json({ success: true, message: 'Request accepted. Case is now active.', request });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to accept request', error: err.message });
  }
};

// ── Decline Request (lawyer) ───────────────────────────────────────────────
const declineRequest = async (req, res) => {
  try {
    const request = await LawyerRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    const lawyer = await Lawyer.findOne({ where: { userId: req.user.userId } });
    if (!lawyer || lawyer.lawyerId !== request.lawyerId) return res.status(403).json({ success: false, message: 'Unauthorized' });
    if (request.status !== 'pending') return res.status(400).json({ success: false, message: `Request is already ${request.status}` });

    await request.update({ status: 'declined', respondedAt: new Date() });

    // Notify citizen so they can re-select
    const caseData = await Case.findByPk(request.caseId);
    const citizen = await User.findByPk(caseData.citizenId);
    if (citizen) {
      const message = `Your lawyer request for Case ${request.caseId} was declined. Please log in to select another lawyer.`;
      await createAndSend(request.caseId, citizen.email, 'email', message,
        () => notificationService.notifyCitizenLawyerDeclined(citizen.email, request.caseId));
    }

    res.json({ success: true, message: 'Request declined.', request });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to decline request', error: err.message });
  }
};

// ── Incoming Requests (lawyer) ─────────────────────────────────────────────
const getIncomingRequests = async (req, res) => {
  try {
    const lawyer = await Lawyer.findOne({ where: { userId: req.user.userId } });
    if (!lawyer) return res.status(404).json({ success: false, message: 'Lawyer profile not found' });

    const requests = await LawyerRequest.findAll({
      where: { lawyerId: lawyer.lawyerId },
      include: [{ model: Case }],
      order: [['requestedAt', 'DESC']],
    });

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch requests', error: err.message });
  }
};

module.exports = { getLawyers, sendRequest, acceptRequest, declineRequest, getIncomingRequests };
