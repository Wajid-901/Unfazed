const Therapist = require('../models/Therapist');
const TherapistReview = require('../models/TherapistReview');
const Availability = require('../models/Availability');
const Session = require('../models/Session');
const Client = require('../models/Client');

// Helper to generate time slot intervals
const generateSlots = (startStr, endStr, durationMins, bufferMins) => {
  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);

  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;

  const slots = [];
  let current = startTotal;

  while (current + durationMins <= endTotal) {
    const slotStartH = String(Math.floor(current / 60)).padStart(2, '0');
    const slotStartM = String(current % 60).padStart(2, '0');

    const slotEndMin = current + durationMins;
    const slotEndH = String(Math.floor(slotEndMin / 60)).padStart(2, '0');
    const slotEndM = String(slotEndMin % 60).padStart(2, '0');

    slots.push({
      start: `${slotStartH}:${slotStartM}`,
      end: `${slotEndH}:${slotEndM}`
    });

    current += durationMins + bufferMins;
  }

  return slots;
};

const getPublicProfile = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const therapist = await Therapist.findOne({ slug: slug.toLowerCase() }).select(
      'name title slug bio languages specializations hourlyRate currency experienceYears qualification profileImageUrl clinicAddress'
    );

    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }

    res.status(200).json({ success: true, therapist });
  } catch (error) {
    next(error);
  }
};

const getPublicSlots = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { date } = req.query; // YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date parameter (YYYY-MM-DD) is required' });
    }

    const therapist = await Therapist.findOne({ slug: slug.toLowerCase() });
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }

    const availability = await Availability.findOne({ therapistId: therapist._id });
    if (!availability) {
      return res.status(200).json({ success: true, availableSlots: [] });
    }

    // Determine day of week in therapist's timezone
    const targetDate = new Date(`${date}T00:00:00Z`);
    const dayOfWeek = targetDate.getUTCDay();

    const daySchedule = availability.weeklySchedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (!daySchedule || !daySchedule.isActive || !daySchedule.slots.length) {
      return res.status(200).json({ success: true, availableSlots: [] });
    }

    // Generate potential slots based on therapist's working hours
    const duration = availability.slotDurationMinutes || 50;
    const buffer = availability.bufferMinutes || 10;
    let allSlots = [];

    for (const range of daySchedule.slots) {
      const generated = generateSlots(range.start, range.end, duration, buffer);
      allSlots = allSlots.concat(generated);
    }

    // Find already booked sessions on this date (include pending so slot is locked while awaiting approval)
    const bookedSessions = await Session.find({
      therapistId: therapist._id,
      date,
      status: { $in: ['pending_approval', 'scheduled', 'in_progress'] }
    }).select('startTime endTime');

    const bookedStarts = new Set(bookedSessions.map((s) => s.startTime));

    // Find blocked slots on this date
    const blockedForDate = availability.blockedSlots.filter((b) => b.date === date);
    const blockedStarts = new Set(blockedForDate.map((b) => b.start));

    // Filter available slots
    const availableSlots = allSlots.filter((s) => !bookedStarts.has(s.start) && !blockedStarts.has(s.start));

    res.status(200).json({
      success: true,
      date,
      timezone: availability.timezone,
      availableSlots
    });
  } catch (error) {
    next(error);
  }
};

const publicBookSession = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { clientName, clientEmail, clientPhone, date, startTime, presentingConcern } = req.body;

    if (!clientName || !clientEmail || !date || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, date, and start time are required for booking'
      });
    }

    const therapist = await Therapist.findOne({ slug: slug.toLowerCase() });
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }

    const availability = await Availability.findOne({ therapistId: therapist._id });
    const duration = availability?.slotDurationMinutes || 50;

    // Calculate endTime
    const [h, m] = startTime.split(':').map(Number);
    const endMinutes = h * 60 + m + duration;
    const endH = String(Math.floor(endMinutes / 60)).padStart(2, '0');
    const endM = String(endMinutes % 60).padStart(2, '0');
    const endTime = `${endH}:${endM}`;

    // Find or create Client under this therapist
    let client = await Client.findOne({
      therapistId: therapist._id,
      email: clientEmail.toLowerCase().trim()
    });

    if (!client) {
      client = await Client.create({
        therapistId: therapist._id,
        name: clientName.trim(),
        email: clientEmail.toLowerCase().trim(),
        phone: clientPhone || '',
        tags: ['Web Lead'],
        intakeData: { presentingConcerns: presentingConcern || '' }
      });
    }

    // Atomic session creation; duplicate compound index will trigger error if slot is taken
    const session = await Session.create({
      therapistId: therapist._id,
      clientId: client._id,
      date,
      startTime,
      endTime,
      duration,
      amount: therapist.hourlyRate || 1500,
      currency: therapist.currency || 'INR',
      status: 'pending_approval',
      paymentStatus: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Booking request submitted. Awaiting therapist confirmation.',
      pendingApproval: true,
      booking: {
        sessionId: session._id,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
        amount: session.amount,
        currency: session.currency,
        status: session.status,
        therapist: {
          name: therapist.name,
          title: therapist.title,
          clinicAddress: therapist.clinicAddress
        },
        client: {
          name: client.name,
          email: client.email
        }
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This appointment slot has just been booked by another client. Please choose another time.'
      });
    }
    next(error);
  }
};

const submitFeedback = async (req, res, next) => {
  try {
    const { type, name, email, category, severity, subject, message, stepsToReproduce, pageUrl, userAgent, userId } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are required.'
      });
    }

    const Feedback = require('../models/Feedback');
    const feedback = await Feedback.create({
      type: type || 'support',
      name: name.trim(),
      email: email.toLowerCase().trim(),
      category: category || 'General Inquiry',
      severity: severity || 'Medium',
      subject: subject.trim(),
      message: message.trim(),
      stepsToReproduce: stepsToReproduce || '',
      pageUrl: pageUrl || '',
      userAgent: userAgent || '',
      userId: userId || null
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      feedbackId: feedback._id
    });
  } catch (error) {
    next(error);
  }
};

// Public therapist directory — search, filter, paginate
const getPublicTherapists = async (req, res, next) => {
  try {
    const {
      q,
      specialization,
      language,
      minRate,
      maxRate,
      minExperience,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    // Build filter — only show verified therapists
    const filter = { isEmailVerified: true };

    // Text search across name, title, bio
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { name: regex },
        { title: regex },
        { bio: regex },
        { specializations: regex }
      ];
    }

    // Specialization filter
    if (specialization) {
      filter.specializations = { $in: [new RegExp(specialization.trim(), 'i')] };
    }

    // Language filter
    if (language) {
      filter.languages = { $in: [new RegExp(language.trim(), 'i')] };
    }

    // Rate range filter
    if (minRate || maxRate) {
      filter.hourlyRate = {};
      if (minRate) filter.hourlyRate.$gte = Number(minRate);
      if (maxRate) filter.hourlyRate.$lte = Number(maxRate);
    }

    // Experience filter
    if (minExperience) {
      filter.experienceYears = { $gte: Number(minExperience) };
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // newest
    if (sort === 'rate_low') sortOption = { hourlyRate: 1 };
    else if (sort === 'rate_high') sortOption = { hourlyRate: -1 };
    else if (sort === 'experience') sortOption = { experienceYears: -1 };
    else if (sort === 'name') sortOption = { name: 1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [therapists, total] = await Promise.all([
      Therapist.find(filter)
        .select('name title slug bio specializations languages hourlyRate currency experienceYears qualification profileImageUrl clinicAddress createdAt')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Therapist.countDocuments(filter)
    ]);

    // Aggregate ratings for returned therapists
    const therapistIds = therapists.map((t) => t._id);
    const ratings = await TherapistReview.aggregate([
      { $match: { therapistId: { $in: therapistIds }, status: 'approved' } },
      {
        $group: {
          _id: '$therapistId',
          avgRating: { $avg: '$rating' },
          reviewsCount: { $sum: 1 }
        }
      }
    ]);

    const ratingsMap = {};
    ratings.forEach((r) => {
      ratingsMap[r._id.toString()] = {
        rating: Math.round(r.avgRating * 10) / 10,
        reviewsCount: r.reviewsCount
      };
    });

    // Enrich therapist data with ratings
    const enriched = therapists.map((t) => {
      const ratingData = ratingsMap[t._id.toString()] || { rating: 0, reviewsCount: 0 };
      return {
        ...t,
        rating: ratingData.rating,
        reviewsCount: ratingData.reviewsCount
      };
    });

    res.status(200).json({
      success: true,
      therapists: enriched,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicTherapists,
  getPublicProfile,
  getPublicSlots,
  publicBookSession,
  submitFeedback
};

