const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Report = require('../models/Report');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and doctor role check to all routes
router.use(authenticateToken);
router.use(authorizeRole('doctor'));

// Get doctor profile
router.get('/profile', async (req, res) => {
  try {
      const user = await User.findById(req.user._id);

      if (!user || user.role !== 'doctor') {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    res.json({
        doctor: {
            doctorId: user.doctorData.doctorId,
            licenseNumber: user.doctorData.licenseNumber,
            specialization: user.doctorData.specialization,
            qualifications: user.doctorData.qualifications,
            experience: user.doctorData.experience,
            consultationFee: user.doctorData.consultationFee,
            bio: user.doctorData.bio,
            languages: user.doctorData.languages,
            availability: user.doctorData.availability,
            holidays: user.doctorData.holidays,
            rating: user.doctorData.rating,
            isVerified: user.doctorData.isVerified,
            verificationDocuments: user.doctorData.verificationDocuments,
            consultationTypes: user.doctorData.consultationTypes,
            user: {
                id: user._id,
                email: user.email,
                profile: user.profile
            }
        }
    });
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({
      message: 'Failed to fetch doctor profile',
      error: error.message
    });
  }
});

// Update doctor profile
router.put('/profile', [
  body('specialization').optional().notEmpty(),
  body('consultationFee').optional().isNumeric(),
  body('bio').optional().isLength({ max: 1000 }),
  body('languages').optional().isArray(),
  body('qualifications').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'doctor') {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    const { specialization, consultationFee, bio, languages, qualifications } = req.body;

    if (specialization) user.doctorData.specialization = specialization;
    if (consultationFee !== undefined) user.doctorData.consultationFee = consultationFee;
    if (bio !== undefined) user.doctorData.bio = bio;
    if (languages) user.doctorData.languages = languages;
    if (qualifications) user.doctorData.qualifications = qualifications;

    await user.save();

    res.json({
      message: 'Doctor profile updated successfully',
      doctor: {
        doctorId: user.doctorData.doctorId,
        specialization: user.doctorData.specialization,
        consultationFee: user.doctorData.consultationFee,
        bio: user.doctorData.bio,
        languages: user.doctorData.languages,
        qualifications: user.doctorData.qualifications
      }
    });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({
      message: 'Failed to update doctor profile',
      error: error.message
    });
  }
});

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
      const user = await User.findById(req.user._id);
      if (!user || user.role !== 'doctor') {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

      const doctorId = user._id; // In the new structure, the user ID is the doctor ID

    const [
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      completedAppointments,
      totalPrescriptions,
      totalReviews,
        averageRating
    ] = await Promise.all([
        Appointment.countDocuments({doctorId: doctorId}),
      Appointment.countDocuments({
          doctorId: doctorId,
        appointmentDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
        Appointment.countDocuments({doctorId: doctorId, status: 'scheduled'}),
        Appointment.countDocuments({doctorId: doctorId, status: 'completed'}),
        Prescription.countDocuments({doctorId: doctorId}),
        Review.countDocuments({doctorId: doctorId, status: 'approved'}),
      Review.aggregate([
          {$match: {doctorId: doctorId, status: 'approved'}},
        { $group: { _id: null, averageRating: { $avg: '$rating' } } }
      ])
    ]);

      // Get recent and upcoming appointments separately to avoid complex Promise.all
      const recentAppointments = await Appointment.find({doctorId: doctorId})
          .populate('patientId', 'patientId')
          .sort({createdAt: -1})
          .limit(5);

      const upcomingAppointments = await Appointment.find({
          doctorId: doctorId,
          appointmentDate: {$gte: new Date()},
          status: {$in: ['scheduled', 'confirmed']}
      })
          .populate('patientId', 'patientId')
          .sort({appointmentDate: 1})
          .limit(5);

    res.json({
      statistics: {
        totalAppointments,
        todayAppointments,
        pendingAppointments,
        completedAppointments,
        totalPrescriptions,
        totalReviews,
        averageRating: averageRating[0]?.averageRating || 0,
          rating: user.doctorData.rating
      },
      recent: {
        appointments: recentAppointments,
        upcoming: upcomingAppointments
      }
    });
  } catch (error) {
    console.error('Doctor dashboard error:', error);
    res.status(500).json({
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// Get appointments
router.get('/appointments', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date, patientId } = req.query;
      const user = await User.findById(req.user._id);

      if (!user || user.role !== 'doctor') {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

      const query = {doctorId: user._id};
    
    if (status) query.status = status;
    if (patientId) query.patientId = patientId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.appointmentDate = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'patientId')
      .sort({ appointmentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
});

// Get single appointment
router.get('/appointments/:id', async (req, res) => {
  try {
      const user = await User.findById(req.user._id);
      if (!user || user.role !== 'doctor') {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
        doctorId: user._id
    })
      .populate('patientId', 'patientId')
      .populate('prescription');

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
        code: 'APPOINTMENT_NOT_FOUND'
      });
    }

    res.json({
      appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      message: 'Failed to fetch appointment',
      error: error.message
    });
  }
});

// Update appointment status
router.put('/appointments/:id/status', [
  body('status').isIn(['confirmed', 'in_progress', 'completed', 'cancelled']),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, notes } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user || user.role !== 'doctor') {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: user._id
    });

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
        code: 'APPOINTMENT_NOT_FOUND'
      });
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;

    await appointment.save();

    res.json({
      message: 'Appointment status updated successfully',
      appointment: {
        id: appointment._id,
        appointmentId: appointment.appointmentId,
        status: appointment.status
      }
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      message: 'Failed to update appointment status',
      error: error.message
    });
  }
});

// Get patients
router.get('/patients', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
      const user = await User.findById(req.user._id);

      if (!user || user.role !== 'doctor') {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    // Get patients who have appointments with this doctor
      const patientIds = await Appointment.distinct('patientId', {doctorId: user._id});

      const query = {_id: {$in: patientIds}, role: 'patient'};
    if (search) {
      query.$or = [
          {'patientData.patientId': {$regex: search, $options: 'i'}}
      ];
    }

      const patients = await User.find(query)
          .select('email profile patientData.patientId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

      const total = await User.countDocuments(query);

    res.json({
      patients,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get doctor patients error:', error);
    res.status(500).json({
      message: 'Failed to fetch patients',
      error: error.message
    });
  }
});

// Get patient details
router.get('/patients/:id', async (req, res) => {
  try {
      const user = await User.findById(req.user._id);
      if (!user || user.role !== 'doctor') {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

      const patient = await User.findById(req.params.id);

      if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        message: 'Patient not found',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    // Get patient's appointments with this doctor
    const appointments = await Appointment.find({
      patientId: patient._id,
        doctorId: user._id
    }).sort({ appointmentDate: -1 });

    // Get patient's prescriptions from this doctor
    const prescriptions = await Prescription.find({
      patientId: patient._id,
        doctorId: user._id
    }).sort({ createdAt: -1 });

    res.json({
        patient: {
            patientId: patient.patientData.patientId,
            emergencyContact: patient.patientData.emergencyContact,
            medicalHistory: patient.patientData.medicalHistory,
            allergies: patient.patientData.allergies,
            medications: patient.patientData.medications,
            insurance: patient.patientData.insurance,
            preferences: patient.patientData.preferences,
            user: {
                id: patient._id,
                email: patient.email,
                profile: patient.profile
            }
        },
      appointments,
      prescriptions
    });
  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({
      message: 'Failed to fetch patient details',
      error: error.message
    });
  }
});

// Get prescriptions
router.get('/prescriptions', async (req, res) => {
  try {
    const { page = 1, limit = 10, patientId, status } = req.query;
      const user = await User.findById(req.user._id);

      if (!user || user.role !== 'doctor') {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

      const query = {doctorId: user._id};
    if (patientId) query.patientId = patientId;
    if (status) query.status = status;

    const prescriptions = await Prescription.find(query)
      .populate('patientId', 'patientId')
      .populate('appointmentId', 'appointmentId appointmentDate')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Prescription.countDocuments(query);

    res.json({
      prescriptions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get doctor prescriptions error:', error);
    res.status(500).json({
      message: 'Failed to fetch prescriptions',
      error: error.message
    });
  }
});

// Get reviews
router.get('/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 10, rating } = req.query;
      const user = await User.findById(req.user._id);

      if (!user || user.role !== 'doctor') {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

      const query = {doctorId: user._id, status: 'approved'};
    if (rating) query.rating = parseInt(rating);

    const reviews = await Review.find(query)
      .populate('patientId', 'patientId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get doctor reviews error:', error);
    res.status(500).json({
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
});

// Respond to review
router.put('/reviews/:id/respond', [
  body('response').notEmpty().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { response } = req.body;
      const user = await User.findById(req.user._id);

      if (!user || user.role !== 'doctor') {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    const review = await Review.findOne({
      _id: req.params.id,
        doctorId: user._id
    });

    if (!review) {
      return res.status(404).json({
        message: 'Review not found',
        code: 'REVIEW_NOT_FOUND'
      });
    }

    review.doctorResponse = {
      response,
      respondedAt: new Date()
    };

    await review.save();

    res.json({
      message: 'Review response added successfully',
      review: {
        id: review._id,
        doctorResponse: review.doctorResponse
      }
    });
  } catch (error) {
    console.error('Respond to review error:', error);
    res.status(500).json({
      message: 'Failed to respond to review',
      error: error.message
    });
  }
});

// Update availability
router.put('/availability', [
  body('availability').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { availability } = req.body;
      const user = await User.findById(req.user._id);

      if (!user || user.role !== 'doctor') {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

      user.doctorData.availability = availability;
      await user.save();

    res.json({
      message: 'Availability updated successfully',
        availability: user.doctorData.availability
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      message: 'Failed to update availability',
      error: error.message
    });
  }
});

// Add holiday
router.post('/holidays', [
  body('date').isISO8601(),
  body('reason').optional().isString(),
  body('isRecurring').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { date, reason, isRecurring } = req.body;
      const user = await User.findById(req.user._id);

      if (!user || user.role !== 'doctor') {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

      user.doctorData.holidays.push({
      date: new Date(date),
      reason,
      isRecurring: isRecurring || false
    });

      await user.save();

    res.json({
      message: 'Holiday added successfully',
        holidays: user.doctorData.holidays
    });
  } catch (error) {
    console.error('Add holiday error:', error);
    res.status(500).json({
      message: 'Failed to add holiday',
      error: error.message
    });
  }
});

module.exports = router;
