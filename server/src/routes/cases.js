const express = require('express');
const authMiddleware = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { fileComplaint, getCase, getMyCases, getPendingCases, approveCase, rejectCase, closeCase } = require('../controllers/caseController');

const router = express.Router();

// Citizen routes
router.post('/', authMiddleware, rbac('citizen'), fileComplaint);
router.get('/my/cases', authMiddleware, rbac('citizen'), getMyCases);

// Admin routes
router.get('/pending', authMiddleware, rbac('admin'), getPendingCases);
router.patch('/:id/approve', authMiddleware, rbac('admin'), approveCase);
router.patch('/:id/reject', authMiddleware, rbac('admin'), rejectCase);
router.patch('/:id/close', authMiddleware, rbac('admin'), closeCase);

// Protected routes (citizen/lawyer/admin)
router.get('/:id', authMiddleware, getCase);

module.exports = router;
