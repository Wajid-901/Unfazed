const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const { requireClientQuota } = require('../middleware/entitlement');
const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  archiveClient,
  resendInvite
} = require('../controllers/clientController');

router.use(authenticate, authorize('THERAPIST'));

router.get('/', getClients);
router.post('/', requireClientQuota, createClient);
router.get('/:id', getClientById);
router.put('/:id', updateClient);
router.delete('/:id', archiveClient);
router.post('/:id/resend-invite', resendInvite);

module.exports = router;
