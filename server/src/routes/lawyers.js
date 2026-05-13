const express = require('express');
const authMiddleware = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { getLawyers, sendRequest, acceptRequest, declineRequest, getIncomingRequests } = require('../controllers/lawyerController');

const router = express.Router();

// Get lawyers list (any authenticated user)
router.get('/', authMiddleware, getLawyers);

// Send request (citizen)
router.post('/request', authMiddleware, rbac('citizen'), sendRequest);

// Accept/Decline request (lawyer)
router.patch('/requests/:id/accept', authMiddleware, rbac('lawyer'), acceptRequest);
router.patch('/requests/:id/decline', authMiddleware, rbac('lawyer'), declineRequest);

// Get incoming requests (lawyer)
router.get('/requests/incoming', authMiddleware, rbac('lawyer'), getIncomingRequests);

module.exports = router;
