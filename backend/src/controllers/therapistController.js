const Therapist = require('../models/Therapist');
const Availability = require('../models/Availability');
const Client = require('../models/Client');
const Session = require('../models/Session');
const SessionNote = require('../models/SessionNote');

const getProfile = async (req, res, next) => {
  try {
    const therapist = await Therapist.findById(req.user.id);
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist profile not found' });
    }
    res.status(200).json({ success: true, therapist });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      title,
      bio,
      phone,
      languages,
      specializations,
      hourlyRate,
      experienceYears,
      qualification,
      profileImageUrl,
      clinicAddress,
      slug
    } = req.body;

    const therapist = await Therapist.findById(req.user.id);
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }

    // Check slug uniqueness if changed
    if (slug && slug.toLowerCase() !== therapist.slug) {
      const existingSlug = await Therapist.findOne({
        slug: slug.toLowerCase(),
        _id: { $ne: therapist._id }
      });
      if (existingSlug) {
        return res.status(409).json({ success: false, message: 'This slug is already in use.' });
      }
      therapist.slug = slug.toLowerCase();
    }

    if (name) therapist.name = name;
    if (title !== undefined) therapist.title = title;
    if (bio !== undefined) therapist.bio = bio;
    if (phone !== undefined) therapist.phone = phone;
    if (languages) therapist.languages = languages;
    if (specializations) therapist.specializations = specializations;
    if (hourlyRate !== undefined) therapist.hourlyRate = Number(hourlyRate);
    if (experienceYears !== undefined) therapist.experienceYears = Number(experienceYears);
    if (qualification !== undefined) therapist.qualification = qualification;
    if (profileImageUrl !== undefined) therapist.profileImageUrl = profileImageUrl;
    if (clinicAddress !== undefined) therapist.clinicAddress = clinicAddress;

    await therapist.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      therapist
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardOverview = async (req, res, next) => {
  try {
    const therapistId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const [
      totalClients,
      todaySessions,
      upcomingSessionsCount,
      pendingNotesCount
    ] = await Promise.all([
      Client.countDocuments({ therapistId, status: { $ne: 'archived' } }),
      Session.find({ therapistId, date: today, status: { $ne: 'cancelled' } }).populate('clientId', 'name email phone'),
      Session.countDocuments({ therapistId, date: { $gte: today }, status: 'scheduled' }),
      Session.countDocuments({ therapistId, status: 'completed', notesId: { $exists: false } })
    ]);

    res.status(200).json({
      success: true,
      overview: {
        totalClients,
        todaySessionsCount: todaySessions.length,
        todaySessions,
        upcomingSessionsCount,
        pendingNotesCount
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAvailability = async (req, res, next) => {
  try {
    let availability = await Availability.findOne({ therapistId: req.user.id });
    if (!availability) {
      availability = await Availability.create({ therapistId: req.user.id });
    }
    res.status(200).json({ success: true, availability });
  } catch (error) {
    next(error);
  }
};

const updateAvailability = async (req, res, next) => {
  try {
    const { weeklySchedule, blockedSlots, timezone, slotDurationMinutes, bufferMinutes } = req.body;

    let availability = await Availability.findOne({ therapistId: req.user.id });
    if (!availability) {
      availability = new Availability({ therapistId: req.user.id });
    }

    if (weeklySchedule) availability.weeklySchedule = weeklySchedule;
    if (blockedSlots) availability.blockedSlots = blockedSlots;
    if (timezone) availability.timezone = timezone;
    if (slotDurationMinutes) availability.slotDurationMinutes = slotDurationMinutes;
    if (bufferMinutes) availability.bufferMinutes = bufferMinutes;

    await availability.save();

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      availability
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getDashboardOverview,
  getAvailability,
  updateAvailability
};
