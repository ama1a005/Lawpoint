const { Lawyer, LawyerRequest, LawyerMatchScore, Case, AISummary, Notification, User } = require('../models');
const { scoreLawyersForCase } = require('../services/aiService');
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
    const where = {};
    if (courtType) where.courtType = courtType;

    const lawyers = await Lawyer.findAll({
      where,
      attributes: ['lawyerId', 'name', 'barId', 'specialisation', 'courtType', 'isAvailable'],
      include: [{ model: User, attributes: ['email'] }],
    });

    // Normalize: Sequelize returns 'User', frontend expects 'user'
    const normalized = lawyers.map((l) => {
      const plain = l.toJSON();
      plain.user = plain.User || null;
      delete plain.User;
      return plain;
    });

    res.json({ success: true, lawyers: normalized });
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
      include: [{
        model: Case,
        include: [{ model: AISummary }],
      }],
      order: [['requestedAt', 'DESC']],
    });

    // Normalize: attach citizenName and flatten aiSummary inside case
    const normalized = await Promise.all(requests.map(async (r) => {
      const plain = r.toJSON();

      // Flatten Case keys
      if (plain.Case) {
        plain.Case.aiSummary = plain.Case.AISummary || null;
        delete plain.Case.AISummary;

        // Fetch citizen name
        const citizen = await User.findByPk(plain.Case.citizenId, { attributes: ['name', 'email'] });
        plain.citizenName = citizen?.name || 'Unknown';
        plain.citizenEmail = citizen?.email || '';
      }

      return plain;
    }));

    res.json({ success: true, requests: normalized });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch requests', error: err.message });
  }
};

// ── Get Ranked Lawyers (citizen) ───────────────────────────────────────────
const getRankedLawyers = async (req, res) => {
  try {
    const { caseId } = req.query;
    if (!caseId) {
      return res.status(400).json({ success: false, message: 'caseId is required' });
    }

    const caseRecord = await Case.findByPk(caseId);
    if (!caseRecord) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const lawyers = await Lawyer.findAll({
      where: {
        courtType: caseRecord.courtType,
        isAvailable: true,
      },
      include: [{ model: User, attributes: ['email'] }],
    });

    if (lawyers.length === 0) {
      return res.json({ success: true, lawyers: [] });
    }

    // Check if scores already cached for this case
    const existingScores = await LawyerMatchScore.findAll({ where: { caseId } });
    let scoreMap = {};

    if (existingScores.length >= lawyers.length) {
      existingScores.forEach(s => {
        scoreMap[s.lawyerId] = { score: s.score, matchReason: s.matchReason };
      });
    } else {
      // Sanitise PII before sending to AI
      const sanitisedText = caseRecord.complaintText
        .replace(/\b\d{10}\b/g, '[PHONE]')
        .replace(/\S+@\S+\.\S+/g, '[EMAIL]');

      const aiScores = await scoreLawyersForCase(sanitisedText, lawyers);

      // Persist scores
      for (const entry of aiScores) {
        await LawyerMatchScore.findOrCreate({
          where: { caseId, lawyerId: entry.lawyerId },
          defaults: {
            caseId,
            lawyerId: entry.lawyerId,
            score: entry.score,
            matchReason: entry.matchReason,
          },
        });
        scoreMap[entry.lawyerId] = { score: entry.score, matchReason: entry.matchReason };
      }
    }

    // Merge scores into lawyer objects and sort
    const rankedLawyers = lawyers
      .map(l => {
        const plain = l.toJSON();
        return {
          lawyerId:       plain.lawyerId,
          name:           plain.name,
          barId:          plain.barId,
          specialisation: plain.specialisation,
          courtType:      plain.courtType,
          isAvailable:    plain.isAvailable,
          casesHandled:   plain.casesHandled || 0,
          wins:           plain.wins || 0,
          losses:         plain.losses || 0,
          recentCaseTypes: plain.recentCaseTypes || [],
          user:           plain.User ? { email: plain.User.email } : null,
          matchScore:     scoreMap[plain.lawyerId]?.score ?? 0,
          matchReason:    scoreMap[plain.lawyerId]?.matchReason ?? 'No score available',
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    return res.json({ success: true, lawyers: rankedLawyers });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to rank lawyers', error: err.message });
  }
};

module.exports = { getLawyers, sendRequest, acceptRequest, declineRequest, getIncomingRequests, getRankedLawyers };
