const { Case, AISummary, Hearing, Notification, LawyerRequest, Lawyer, User } = require('../models');
const aiService = require('../services/aiService');
const notificationService = require('../services/notificationService');

// ── Helper: create a DB notification record then send ──────────────────────
const createAndSend = async (caseId, recipientContact, channel, message, sendFn) => {
  const notif = await Notification.create({ caseId, recipientContact, channel, message, status: 'pending' });
  sendFn()
    .then((result) => notif.update({ status: result.success ? 'sent' : 'failed', sentAt: new Date() }))
    .catch(() => notif.update({ status: 'failed' }));
};

// ── File Complaint ─────────────────────────────────────────────────────────
const fileComplaint = async (req, res) => {
  try {
    const { title, complaintText, accusedContact } = req.body;

    if (!title || !complaintText || !accusedContact) {
      return res.status(400).json({ success: false, message: 'title, complaintText, and accusedContact are required.' });
    }

    const newCase = await Case.create({
      citizenId: req.user.userId,
      title,
      complaintText,
      accusedPartyContact: accusedContact,
      status: 'pending',
    });

    // Respond immediately — AI runs in background so citizen isn't blocked
    res.status(201).json({ success: true, message: 'Complaint filed successfully. AI assessment is in progress.', case: newCase });

    // ── Background: AI Assessment (Phase 2) ─────────────────────────────
    aiService.assessComplaint(complaintText)
      .then(async (result) => {
        await AISummary.create({
          caseId: newCase.caseId,
          recommendedCourt: result.recommendedCourt,
          relevanceScore: result.relevanceScore,
          parsedSummary: result.parsedSummary,
        });
        console.log(`[AI] Assessment stored for case ${newCase.caseId} → ${result.recommendedCourt}`);
      })
      .catch((err) => console.error(`[AI] Failed to store assessment for case ${newCase.caseId}:`, err.message));

  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to file complaint', error: err.message });
  }
};

// ── Get Single Case (with full timeline) ──────────────────────────────────
const getCase = async (req, res) => {
  try {
    const caseData = await Case.findByPk(req.params.id, {
      include: [
        { model: AISummary },
        { model: Hearing },
        { model: Notification },
        { model: LawyerRequest, include: [{ model: Lawyer }] },
      ],
    });

    if (!caseData) return res.status(404).json({ success: false, message: 'Case not found' });

    // Normalize keys for the frontend (Sequelize uses model names by default)
    const plain = caseData.toJSON();
    plain.aiSummary = plain.AISummary || null;
    plain.hearings = plain.Hearings || [];
    plain.notifications = plain.Notifications || [];
    plain.lawyerRequests = plain.LawyerRequests || [];
    delete plain.AISummary;
    delete plain.Hearings;
    delete plain.Notifications;
    delete plain.LawyerRequests;

    res.json({ success: true, case: plain });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch case', error: err.message });
  }
};

// ── Get My Cases (citizen or lawyer) ──────────────────────────────────────
const getMyCases = async (req, res) => {
  try {
    // Citizens see cases they filed; lawyers see cases assigned to them
    const where = req.user.role === 'lawyer'
      ? { lawyerId: req.user.userId }
      : { citizenId: req.user.userId };

    // For lawyers, try matching by Lawyer record's lawyerId rather than userId
    if (req.user.role === 'lawyer') {
      const lawyer = await Lawyer.findOne({ where: { userId: req.user.userId } });
      if (lawyer) {
        where.lawyerId = lawyer.lawyerId;
      }
    }

    const cases = await Case.findAll({
      where,
      include: [{ model: AISummary }],
      order: [['filedAt', 'DESC']],
    });

    // Normalize keys for the frontend
    const normalizedCases = cases.map((c) => {
      const plain = c.toJSON();
      plain.aiSummary = plain.AISummary || null;
      delete plain.AISummary;
      return plain;
    });

    res.json({ success: true, cases: normalizedCases });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch cases', error: err.message });
  }
};

// ── Get Pending Cases (admin) ──────────────────────────────────────────────
const getPendingCases = async (req, res) => {
  try {
    const cases = await Case.findAll({
      where: { status: 'pending' },
      include: [{ model: AISummary }],
      order: [['filedAt', 'ASC']],
    });

    // Normalize keys for the frontend
    const normalizedCases = cases.map((c) => {
      const plain = c.toJSON();
      plain.aiSummary = plain.AISummary || null;
      delete plain.AISummary;
      return plain;
    });

    res.json({ success: true, cases: normalizedCases });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending cases', error: err.message });
  }
};

// ── Get All Cases (admin) ──────────────────────────────────────────────────
const getAllCases = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const cases = await Case.findAll({
      where,
      include: [{ model: AISummary }],
      order: [['filedAt', 'DESC']],
    });

    const normalizedCases = cases.map((c) => {
      const plain = c.toJSON();
      plain.aiSummary = plain.AISummary || null;
      delete plain.AISummary;
      return plain;
    });

    res.json({ success: true, cases: normalizedCases });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch cases', error: err.message });
  }
};

// ── Approve Case ───────────────────────────────────────────────────────────
const approveCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { courtType } = req.body;

    const caseData = await Case.findByPk(id);
    if (!caseData) return res.status(404).json({ success: false, message: 'Case not found' });
    if (caseData.status !== 'pending') return res.status(400).json({ success: false, message: `Case is already ${caseData.status}` });

    // Resolve court type: admin override > AI recommendation
    let finalCourtType = courtType;
    if (!finalCourtType) {
      const aiSummary = await AISummary.findOne({ where: { caseId: id } });
      finalCourtType = aiSummary?.recommendedCourt;
    }
    if (!finalCourtType) return res.status(400).json({ success: false, message: 'courtType is required when no AI summary exists.' });

    await caseData.update({ status: 'approved', courtType: finalCourtType });

    // Phase 4 — Notify accused party (only case ref, never complaint text)
    const contact = caseData.accusedPartyContact;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const message = `You have been named in a legal case. Reference: ${caseData.caseId}. Contact your nearest court for details.`;

    if (isEmail) {
      await createAndSend(
        caseData.caseId,
        contact,
        'email',
        message,
        () => notificationService.notifyAccused(contact, caseData.caseId),
      );
    } else {
      // Phone number or other contact — log notification as SMS/manual
      await createAndSend(
        caseData.caseId,
        contact,
        'sms',
        message,
        () => notificationService.sendSMS(contact, message),
      );
    }

    res.json({ success: true, message: 'Case approved and accused notified.', case: caseData });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to approve case', error: err.message });
  }
};

// ── Reject Case ────────────────────────────────────────────────────────────
const rejectCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionNote } = req.body;

    const caseData = await Case.findByPk(id);
    if (!caseData) return res.status(404).json({ success: false, message: 'Case not found' });
    if (caseData.status !== 'pending') return res.status(400).json({ success: false, message: `Case is already ${caseData.status}` });

    await caseData.update({ status: 'rejected', rejectionNote });

    // Notify citizen of rejection
    const citizen = await User.findByPk(caseData.citizenId);
    if (citizen) {
      const message = `Your complaint (Case ${caseData.caseId}) has been rejected. Reason: ${rejectionNote || 'No reason provided.'}`;
      await createAndSend(
        caseData.caseId,
        citizen.email,
        'email',
        message,
        () => notificationService.notifyCitizenRejection(citizen.email, caseData.caseId, rejectionNote),
      );
    }

    res.json({ success: true, message: 'Case rejected.', case: caseData });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reject case', error: err.message });
  }
};

// ── Close Case ─────────────────────────────────────────────────────────────
const closeCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { outcomeNote } = req.body;

    const caseData = await Case.findByPk(id);
    if (!caseData) return res.status(404).json({ success: false, message: 'Case not found' });
    if (caseData.status === 'closed') return res.status(400).json({ success: false, message: 'Case is already closed.' });

    await caseData.update({ status: 'closed', closedAt: new Date(), outcome: outcomeNote });

    res.json({ success: true, message: 'Case closed.', case: caseData });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to close case', error: err.message });
  }
};

module.exports = { fileComplaint, getCase, getMyCases, getPendingCases, getAllCases, approveCase, rejectCase, closeCase };
