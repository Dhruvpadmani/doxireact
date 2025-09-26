const express = require('express');
const { body, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Report = require('../models/Report');
const Review = require('../models/Review');
const EmergencyRequest = require('../models/EmergencyRequest');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and patient role check to all routes
router.use(authenticateToken);
router.use(authorizeRole('patient'));

// Get patient profile
router.get('/profile', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id })
      .populate('userId', 'email profile');

    if (!patient) {
      return res.status(404).json({
        message: 'Patient profile not found',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    res.json({
      patient
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      message: 'Failed to fetch patient profile',
      error: error.message
    });
  }
});

// Update patient profile
router.put('/profile', [
  body('emergencyContact.name').optional().notEmpty(),
  body('emergencyContact.relationship').optional().notEmpty(),
  body('emergencyContact.phone').optional().matches(/^\d{10}$/).withMessage('Phone number must be exactly 10 digits'),
  body('medicalHistory').optional().isArray(),
  body('allergies').optional().isArray(),
  body('medications').optional().isArray(),
  body('insurance.provider').optional().isString(),
  body('insurance.policyNumber').optional().isString(),
  body('preferences.preferredLanguage').optional().isString(),
  body('preferences.communicationMethod').optional().isIn(['email', 'sms', 'phone'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({
        message: 'Patient profile not found',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    const {
      emergencyContact,
      medicalHistory,
      allergies,
      medications,
      insurance,
      preferences
    } = req.body;

    if (emergencyContact) {
      Object.keys(emergencyContact).forEach(key => {
        if (emergencyContact[key] !== undefined) {
          patient.emergencyContact[key] = emergencyContact[key];
        }
      });
    }

    if (medicalHistory) patient.medicalHistory = medicalHistory;
    if (allergies) patient.allergies = allergies;
    if (medications) patient.medications = medications;
    if (insurance) {
      Object.keys(insurance).forEach(key => {
        if (insurance[key] !== undefined) {
          patient.insurance[key] = insurance[key];
        }
      });
    }
    if (preferences) {
      Object.keys(preferences).forEach(key => {
        if (preferences[key] !== undefined) {
          patient.preferences[key] = preferences[key];
        }
      });
    }

    await patient.save();

    res.json({
      message: 'Patient profile updated successfully',
      patient
    });
  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({
      message: 'Failed to update patient profile',
      error: error.message
    });
  }
});

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({
        message: 'Patient profile not found',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    const [
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      totalPrescriptions,
      totalReports,
      totalReviews,
      recentAppointments,
      recentPrescriptions,
      recentReports
    ] = await Promise.all([
      Appointment.countDocuments({ patientId: patient._id }),
      Appointment.countDocuments({
        patientId: patient._id,
        appointmentDate: { $gte: new Date() },
        status: { $in: ['scheduled', 'confirmed'] }
      }),
      Appointment.countDocuments({ patientId: patient._id, status: 'completed' }),
      Prescription.countDocuments({ patientId: patient._id }),
      Report.countDocuments({ patientId: patient._id }),
      Review.countDocuments({ patientId: patient._id }),
      Appointment.find({ patientId: patient._id })
        .populate('doctorId', 'doctorId specialization')
        .sort({ appointmentDate: -1 })
        .limit(5),
      Prescription.find({ patientId: patient._id })
        .populate('doctorId', 'doctorId specialization')
        .sort({ createdAt: -1 })
        .limit(5),
      Report.find({ patientId: patient._id })
        .populate('doctorId', 'doctorId specialization')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.json({
      statistics: {
        totalAppointments,
        upcomingAppointments,
        completedAppointments,
        totalPrescriptions,
        totalReports,
        totalReviews
      },
      recent: {
        appointments: recentAppointments,
        prescriptions: recentPrescriptions,
        reports: recentReports
      }
    });
  } catch (error) {
    console.error('Patient dashboard error:', error);
    res.status(500).json({
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// Find doctors
router.get('/doctors', async (req, res) => {
  try {
    const { page = 1, limit = 10, specialization, search, minRating } = req.query;
    const query = { isVerified: true };

    if (specialization) query.specialization = specialization;
    if (minRating) query['rating.average'] = { $gte: parseFloat(minRating) };
    if (search) {
      query.$or = [
        { specialization: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await Doctor.find(query)
      .populate('userId', 'email profile')
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Doctor.countDocuments(query);

    res.json({
      doctors,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Find doctors error:', error);
    res.status(500).json({
      message: 'Failed to fetch doctors',
      error: error.message
    });
  }
});

// Get doctor details
router.get('/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'email profile');

    if (!doctor || !doctor.isVerified) {
      return res.status(404).json({
        message: 'Doctor not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    // Get doctor's reviews
    const reviews = await Review.find({
      doctorId: doctor._id,
      status: 'approved'
    })
      .populate('patientId', 'patientId')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      doctor,
      reviews
    });
  } catch (error) {
    console.error('Get doctor details error:', error);
    res.status(500).json({
      message: 'Failed to fetch doctor details',
      error: error.message
    });
  }
});

// Get appointments
router.get('/appointments', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date, doctorId } = req.query;
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({
        message: 'Patient profile not found',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    const query = { patientId: patient._id };
    
    if (status) query.status = status;
    if (doctorId) query.doctorId = doctorId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.appointmentDate = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('doctorId', 'doctorId specialization')
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
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
});

// Get single appointment
router.get('/appointments/:id', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({
        message: 'Patient profile not found',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: patient._id
    })
      .populate('doctorId', 'doctorId specialization')
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

// Cancel appointment
router.put('/appointments/:id/cancel', [
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { reason } = req.body;
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({
        message: 'Patient profile not found',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: patient._id
    });

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
        code: 'APPOINTMENT_NOT_FOUND'
      });
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({
        message: 'Cannot cancel this appointment',
        code: 'APPOINTMENT_CANNOT_BE_CANCELLED'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellation = {
      cancelledBy: 'patient',
      reason: reason || 'Cancelled by patient',
      cancelledAt: new Date()
    };

    await appointment.save();

    res.json({
      message: 'Appointment cancelled successfully',
      appointment: {
        id: appointment._id,
        appointmentId: appointment.appointmentId,
        status: appointment.status
      }
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      message: 'Failed to cancel appointment',
      error: error.message
    });
  }
});

// Get prescriptions
router.get('/prescriptions', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({
        message: 'Patient profile not found',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    const query = { patientId: patient._id };
    if (status) query.status = status;

    const prescriptions = await Prescription.find(query)
      .populate('doctorId', 'doctorId specialization')
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
    console.error('Get patient prescriptions error:', error);
    res.status(500).json({
      message: 'Failed to fetch prescriptions',
      error: error.message
    });
  }
});

// Get reports
router.get('/reports', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({
        message: 'Patient profile not found',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    const query = { patientId: patient._id };
    if (type) query.type = type;
    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate('doctorId', 'doctorId specialization')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Report.countDocuments(query);

    res.json({
      reports,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get patient reports error:', error);
    res.status(500).json({
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
});

// Get medical history
router.get('/medical-history', async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({
        message: 'Patient profile not found',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    // Get all appointments, prescriptions, and reports
    const [appointments, prescriptions, reports] = await Promise.all([
      Appointment.find({ patientId: patient._id })
        .populate('doctorId', 'doctorId specialization')
        .sort({ appointmentDate: -1 }),
      Prescription.find({ patientId: patient._id })
        .populate('doctorId', 'doctorId specialization')
        .sort({ createdAt: -1 }),
      Report.find({ patientId: patient._id })
        .populate('doctorId', 'doctorId specialization')
        .sort({ createdAt: -1 })
    ]);

    res.json({
      medicalHistory: patient.medicalHistory,
      allergies: patient.allergies,
      medications: patient.medications,
      appointments,
      prescriptions,
      reports
    });
  } catch (error) {
    console.error('Get medical history error:', error);
    res.status(500).json({
      message: 'Failed to fetch medical history',
      error: error.message
    });
  }
});

// Create emergency request
router.post('/emergency', [
  body('type').isIn(['medical_emergency', 'urgent_appointment', 'prescription_urgent', 'report_urgent']),
  body('description').notEmpty().isLength({ max: 1000 }),
  body('symptoms').optional().isArray(),
  body('priority').optional().isIn(['high', 'critical'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type, description, symptoms, priority } = req.body;
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({
        message: 'Patient profile not found',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    const emergencyRequest = new EmergencyRequest({
      patientId: patient._id,
      type,
      description,
      symptoms: symptoms || [],
      priority: priority || 'high',
      contactInfo: {
        phone: req.user.profile.phone,
        emergencyContact: patient.emergencyContact.phone
      }
    });

    await emergencyRequest.save();

    res.status(201).json({
      message: 'Emergency request submitted successfully',
      request: {
        id: emergencyRequest._id,
        requestId: emergencyRequest.requestId,
        type: emergencyRequest.type,
        priority: emergencyRequest.priority,
        status: emergencyRequest.status
      }
    });
  } catch (error) {
    console.error('Create emergency request error:', error);
    res.status(500).json({
      message: 'Failed to submit emergency request',
      error: error.message
    });
  }
});

// Get emergency requests
router.get('/emergency-requests', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const patient = await Patient.findOne({ userId: req.user._id });
    
    if (!patient) {
      return res.status(404).json({
        message: 'Patient profile not found',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    const query = { patientId: patient._id };
    if (status) query.status = status;

    const requests = await EmergencyRequest.find(query)
      .populate('assignedTo.doctorId', 'doctorId specialization')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await EmergencyRequest.countDocuments(query);

    res.json({
      requests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get emergency requests error:', error);
    res.status(500).json({
      message: 'Failed to fetch emergency requests',
      error: error.message
    });
  }
});

module.exports = router;
