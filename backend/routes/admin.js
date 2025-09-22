const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Report = require('../models/Report');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const EmergencyRequest = require('../models/EmergencyRequest');
const AdminLog = require('../models/AdminLog');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and admin role check to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      totalPrescriptions,
      totalReports,
      totalReviews,
      pendingEmergencyRequests,
      recentAppointments,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'scheduled' }),
      Appointment.countDocuments({ status: 'completed' }),
      Prescription.countDocuments(),
      Report.countDocuments(),
      Review.countDocuments(),
      EmergencyRequest.countDocuments({ status: 'pending' }),
      Appointment.find()
        .populate('patientId', 'patientId')
        .populate('doctorId', 'doctorId')
        .sort({ createdAt: -1 })
        .limit(5),
      User.find()
        .select('email role profile createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    // Calculate monthly statistics
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyStats = await Promise.all([
      Appointment.countDocuments({ createdAt: { $gte: currentMonth } }),
      User.countDocuments({ createdAt: { $gte: currentMonth } }),
      Prescription.countDocuments({ createdAt: { $gte: currentMonth } })
    ]);

    res.json({
      statistics: {
        total: {
          users: totalUsers,
          patients: totalPatients,
          doctors: totalDoctors,
          appointments: totalAppointments,
          prescriptions: totalPrescriptions,
          reports: totalReports,
          reviews: totalReviews
        },
        appointments: {
          pending: pendingAppointments,
          completed: completedAppointments
        },
        emergency: {
          pending: pendingEmergencyRequests
        },
        monthly: {
          appointments: monthlyStats[0],
          newUsers: monthlyStats[1],
          prescriptions: monthlyStats[2]
        }
      },
      recent: {
        appointments: recentAppointments,
        users: recentUsers
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// User Management
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, isActive } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Get single user
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Get role-specific data
    let roleData = null;
    if (user.role === 'patient') {
      roleData = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      roleData = await Doctor.findOne({ userId: user._id });
    }

    res.json({
      user,
      roleData
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// Update user status
router.put('/users/:id/status', [
  body('isActive').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    user.isActive = isActive;
    await user.save();

    // Log admin action
    await AdminLog.logAction(req.user._id, 'user_updated', {
      targetType: 'user',
      targetId: user._id,
      details: {
        before: { isActive: !isActive },
        after: { isActive },
        changes: [`Status changed to ${isActive ? 'active' : 'inactive'}`]
      }
    });

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      message: 'Failed to update user status',
      error: error.message
    });
  }
});

// Doctor Management
router.get('/doctors', async (req, res) => {
  try {
    const { page = 1, limit = 10, specialization, isVerified, search } = req.query;
    const query = {};

    if (specialization) query.specialization = specialization;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    if (search) {
      query.$or = [
        { licenseNumber: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await Doctor.find(query)
      .populate('userId', 'email profile isActive')
      .sort({ createdAt: -1 })
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
    console.error('Get doctors error:', error);
    res.status(500).json({
      message: 'Failed to fetch doctors',
      error: error.message
    });
  }
});

// Verify doctor
router.put('/doctors/:id/verify', [
  body('isVerified').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { isVerified } = req.body;
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    doctor.isVerified = isVerified;
    await doctor.save();

    // Log admin action
    await AdminLog.logAction(req.user._id, isVerified ? 'doctor_verified' : 'doctor_unverified', {
      targetType: 'doctor',
      targetId: doctor._id,
      details: {
        before: { isVerified: !isVerified },
        after: { isVerified },
        changes: [`Verification status changed to ${isVerified ? 'verified' : 'unverified'}`]
      }
    });

    res.json({
      message: `Doctor ${isVerified ? 'verified' : 'unverified'} successfully`,
      doctor: {
        id: doctor._id,
        doctorId: doctor.doctorId,
        isVerified: doctor.isVerified
      }
    });
  } catch (error) {
    console.error('Verify doctor error:', error);
    res.status(500).json({
      message: 'Failed to verify doctor',
      error: error.message
    });
  }
});

// Appointment Management
router.get('/appointments', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date, doctorId, patientId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (doctorId) query.doctorId = doctorId;
    if (patientId) query.patientId = patientId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.appointmentDate = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'patientId')
      .populate('doctorId', 'doctorId')
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
    console.error('Get appointments error:', error);
    res.status(500).json({
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
});

// Cancel appointment
router.put('/appointments/:id/cancel', [
  body('reason').notEmpty()
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
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
        code: 'APPOINTMENT_NOT_FOUND'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellation = {
      cancelledBy: 'admin',
      reason,
      cancelledAt: new Date()
    };

    await appointment.save();

    // Log admin action
    await AdminLog.logAction(req.user._id, 'appointment_cancelled', {
      targetType: 'appointment',
      targetId: appointment._id,
      details: {
        before: { status: appointment.status },
        after: { status: 'cancelled' },
        changes: ['Appointment cancelled by admin']
      }
    });

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

// Review Management
router.get('/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, rating } = req.query;
    const query = {};

    if (status) query.status = status;
    if (rating) query.rating = parseInt(rating);

    const reviews = await Review.find(query)
      .populate('patientId', 'patientId')
      .populate('doctorId', 'doctorId')
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
    console.error('Get reviews error:', error);
    res.status(500).json({
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
});

// Moderate review
router.put('/reviews/:id/moderate', [
  body('status').isIn(['approved', 'rejected', 'flagged']),
  body('reason').optional().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, reason } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: 'Review not found',
        code: 'REVIEW_NOT_FOUND'
      });
    }

    const oldStatus = review.status;
    review.status = status;
    review.moderatedBy = req.user._id;
    review.moderatedAt = new Date();

    if (status === 'flagged' && reason) {
      review.flaggedReason = reason;
    }

    await review.save();

    // Log admin action
    await AdminLog.logAction(req.user._id, `review_${status}`, {
      targetType: 'review',
      targetId: review._id,
      details: {
        before: { status: oldStatus },
        after: { status },
        changes: [`Review ${status}`]
      }
    });

    res.json({
      message: `Review ${status} successfully`,
      review: {
        id: review._id,
        status: review.status,
        moderatedAt: review.moderatedAt
      }
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({
      message: 'Failed to moderate review',
      error: error.message
    });
  }
});

// Emergency Requests
router.get('/emergency-requests', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const requests = await EmergencyRequest.find(query)
      .populate('patientId', 'patientId')
      .populate('assignedTo.doctorId', 'doctorId')
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

// Admin Logs
router.get('/logs', async (req, res) => {
  try {
    const { page = 1, limit = 20, action, adminId, severity } = req.query;
    const query = {};

    if (action) query.action = action;
    if (adminId) query.adminId = adminId;
    if (severity) query.severity = severity;

    const logs = await AdminLog.find(query)
      .populate('adminId', 'email profile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AdminLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get admin logs error:', error);
    res.status(500).json({
      message: 'Failed to fetch admin logs',
      error: error.message
    });
  }
});

module.exports = router;
