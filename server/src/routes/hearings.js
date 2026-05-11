const express = require('express');
const authMiddleware = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { createHearing, updateHearing, getHearings } = require('../controllers/hearingController');

const router = express.Router();

// Create hearing (admin)
router.post('/', authMiddleware, rbac('admin'), createHearing);

// Update hearing (admin)
router.patch('/:id', authMiddleware, rbac('admin'), updateHearing);

// Get hearings (all authenticated users)
router.get('/case/:caseId', authMiddleware, getHearings);

module.exports = router;
