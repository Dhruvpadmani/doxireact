const express = require('express');
const { body, validationResult } = require('express-validator');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Report = require('../models/Report');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { authenticateToken, requireDoctor } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and doctor role check to all routes
router.use(authenticateToken);
router.use(requireDoctor);

// Get doctor profile
router.get('/profile', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id })
      .populate('userId', 'email profile');

    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    res.json({
      doctor
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

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    const { specialization, consultationFee, bio, languages, qualifications } = req.body;

    if (specialization) doctor.specialization = specialization;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (bio !== undefined) doctor.bio = bio;
    if (languages) doctor.languages = languages;
    if (qualifications) doctor.qualifications = qualifications;

    await doctor.save();

    res.json({
      message: 'Doctor profile updated successfully',
      doctor
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
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    const [
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      completedAppointments,
      totalPrescriptions,
      totalReviews,
      averageRating,
      recentAppointments,
      upcomingAppointments
    ] = await Promise.all([
      Appointment.countDocuments({ doctorId: doctor._id }),
      Appointment.countDocuments({
        doctorId: doctor._id,
        appointmentDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
      Appointment.countDocuments({ doctorId: doctor._id, status: 'scheduled' }),
      Appointment.countDocuments({ doctorId: doctor._id, status: 'completed' }),
      Prescription.countDocuments({ doctorId: doctor._id }),
      Review.countDocuments({ doctorId: doctor._id, status: 'approved' }),
      Review.aggregate([
        { $match: { doctorId: doctor._id, status: 'approved' } },
        { $group: { _id: null, averageRating: { $avg: '$rating' } } }
      ]),
      Appointment.find({ doctorId: doctor._id })
        .populate('patientId', 'patientId')
        .sort({ createdAt: -1 })
        .limit(5),
      Appointment.find({
        doctorId: doctor._id,
        appointmentDate: { $gte: new Date() },
        status: { $in: ['scheduled', 'confirmed'] }
      })
        .populate('patientId', 'patientId')
        .sort({ appointmentDate: 1 })
        .limit(5)
    ]);

    res.json({
      statistics: {
        totalAppointments,
        todayAppointments,
        pendingAppointments,
        completedAppointments,
        totalPrescriptions,
        totalReviews,
        averageRating: averageRating[0]?.averageRating || 0,
        rating: doctor.rating
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
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    const query = { doctorId: doctor._id };
    
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
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: doctor._id
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
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: doctor._id
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
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    // Get patients who have appointments with this doctor
    const patientIds = await Appointment.distinct('patientId', { doctorId: doctor._id });
    
    const query = { _id: { $in: patientIds } };
    if (search) {
      query.$or = [
        { patientId: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await Patient.find(query)
      .populate('userId', 'email profile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Patient.countDocuments(query);

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
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    const patient = await Patient.findById(req.params.id)
      .populate('userId', 'email profile');

    if (!patient) {
      return res.status(404).json({
        message: 'Patient not found',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    // Get patient's appointments with this doctor
    const appointments = await Appointment.find({
      patientId: patient._id,
      doctorId: doctor._id
    }).sort({ appointmentDate: -1 });

    // Get patient's prescriptions from this doctor
    const prescriptions = await Prescription.find({
      patientId: patient._id,
      doctorId: doctor._id
    }).sort({ createdAt: -1 });

    res.json({
      patient,
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
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    const query = { doctorId: doctor._id };
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
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    const query = { doctorId: doctor._id, status: 'approved' };
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
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    const review = await Review.findOne({
      _id: req.params.id,
      doctorId: doctor._id
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
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    doctor.availability = availability;
    await doctor.save();

    res.json({
      message: 'Availability updated successfully',
      availability: doctor.availability
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
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    doctor.holidays.push({
      date: new Date(date),
      reason,
      isRecurring: isRecurring || false
    });

    await doctor.save();

    res.json({
      message: 'Holiday added successfully',
      holidays: doctor.holidays
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
