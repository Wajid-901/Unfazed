const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const upload = require('../middleware/upload');
const {
  getProfile,
  updateProfile,
  getDashboardOverview,
  getAvailability,
  updateAvailability,
  uploadAvatar
} = require('../controllers/therapistController');
const { profileUpdateValidator } = require('../validators/authValidators');

// Protect all therapist routes with auth + therapist role
router.use(authenticate, authorize('THERAPIST'));

router.get('/profile', getProfile);
router.put('/profile', profileUpdateValidator, updateProfile);
router.post('/profile/avatar', upload.single('avatar'), uploadAvatar);
router.get('/dashboard', getDashboardOverview);
router.get('/availability', getAvailability);
router.put('/availability', updateAvailability);

module.exports = router;
