const express = require('express');
const authMiddleware = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { fileComplaint, getCase, getMyCases, getPendingCases, getAllCases, approveCase, rejectCase, closeCase, reviewDraft, refineDraft } = require('../controllers/caseController');

const router = express.Router();

// Citizen routes
router.post('/draft-review', authMiddleware, rbac('citizen'), reviewDraft);
router.post('/draft-refine', authMiddleware, rbac('citizen'), refineDraft);
router.post('/', authMiddleware, rbac('citizen'), fileComplaint);
router.get('/my/cases', authMiddleware, rbac('citizen', 'lawyer'), getMyCases);

// Admin routes
router.get('/pending', authMiddleware, rbac('admin'), getPendingCases);
router.get('/all', authMiddleware, rbac('admin'), getAllCases);
router.patch('/:id/approve', authMiddleware, rbac('admin'), approveCase);
router.patch('/:id/reject', authMiddleware, rbac('admin'), rejectCase);
router.patch('/:id/close', authMiddleware, rbac('admin'), closeCase);

// Dev/Admin utility — clear all case data
router.delete('/clear-all', authMiddleware, rbac('admin'), async (req, res) => {
  try {
    const { Notification, Hearing, AISummary, LawyerRequest, Case } = require('../models');
    await Notification.destroy({ where: {} });
    await Hearing.destroy({ where: {} });
    await AISummary.destroy({ where: {} });
    await LawyerRequest.destroy({ where: {} });
    const count = await Case.destroy({ where: {} });
    res.json({ success: true, message: `Cleared ${count} case(s) and all related data.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Protected routes (citizen/lawyer/admin)
router.get('/:id', authMiddleware, getCase);

module.exports = router;
