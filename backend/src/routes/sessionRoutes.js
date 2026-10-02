const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const {
  getSessions,
  createSession,
  updateSessionStatus
} = require('../controllers/sessionController');

router.use(authenticate, authorize('THERAPIST'));

router.get('/', getSessions);
router.post('/', createSession);
router.put('/:id', updateSessionStatus);

module.exports = router;
