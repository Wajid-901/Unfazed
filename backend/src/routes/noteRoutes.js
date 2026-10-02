const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getClientSharedNotes
} = require('../controllers/noteController');

// Client portal route: ONLY shared notes
router.get('/shared', authenticate, authorize('CLIENT'), getClientSharedNotes);

// Therapist routes: full clinical note management
router.get('/', authenticate, authorize('THERAPIST'), getNotes);
router.get('/:id', authenticate, authorize('THERAPIST'), getNoteById);
router.post('/', authenticate, authorize('THERAPIST'), createNote);
router.put('/:id', authenticate, authorize('THERAPIST'), updateNote);
router.delete('/:id', authenticate, authorize('THERAPIST'), deleteNote);

module.exports = router;
