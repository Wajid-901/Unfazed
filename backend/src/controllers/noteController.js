const SessionNote = require('../models/SessionNote');
const Session = require('../models/Session');
const Client = require('../models/Client');

const getNotes = async (req, res, next) => {
  try {
    const { clientId, sessionId } = req.query;
    const query = { therapistId: req.user.id };

    if (clientId) query.clientId = clientId;
    if (sessionId) query.sessionId = sessionId;

    const notes = await SessionNote.find(query)
      .populate('clientId', 'name email')
      .populate('sessionId', 'date startTime status')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, notes });
  } catch (error) {
    next(error);
  }
};

const getNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const note = await SessionNote.findOne({ _id: id, therapistId: req.user.id })
      .populate('clientId', 'name email')
      .populate('sessionId', 'date startTime status');

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.status(200).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

const createNote = async (req, res, next) => {
  try {
    const { sessionId, clientId, type, title, soap, dap, body, visibility } = req.body;

    const note = await SessionNote.create({
      sessionId,
      clientId,
      therapistId: req.user.id,
      type: type || 'SOAP',
      title: title || 'Clinical Session Note',
      soap: soap || {},
      dap: dap || {},
      body: body || '',
      visibility: visibility === 'SHARED' ? 'SHARED' : 'PRIVATE'
    });

    res.status(201).json({
      success: true,
      message: 'Note saved successfully',
      note
    });
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, soap, dap, body, visibility } = req.body;

    const note = await SessionNote.findOne({ _id: id, therapistId: req.user.id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (title) note.title = title;
    if (soap) note.soap = { ...note.soap, ...soap };
    if (dap) note.dap = { ...note.dap, ...dap };
    if (body !== undefined) note.body = body;
    if (visibility) note.visibility = visibility;

    await note.save();

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const note = await SessionNote.findOneAndDelete({ _id: id, therapistId: req.user.id });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Returns only SHARED notes for the authenticated client — private notes excluded
const getClientSharedNotes = async (req, res, next) => {
  try {
    const notes = await SessionNote.find({
      clientId: req.user.id,
      visibility: 'SHARED'
    })
      .select('title body createdAt updatedAt sessionId')
      .populate('sessionId', 'date startTime')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notes
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getClientSharedNotes
};
