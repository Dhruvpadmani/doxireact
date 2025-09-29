const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Report = require('../models/Report');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const EmergencyRequest = require('../models/EmergencyRequest');
const AdminLog = require('../models/AdminLog');
const Settings = require('../models/Settings');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and admin role check to all routes
router.use(authenticateToken);
router.use(authorizeRole('admin'));

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
      User.countDocuments({role: 'patient'}),
      User.countDocuments({role: 'doctor'}),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'scheduled' }),
      Appointment.countDocuments({ status: 'completed' }),
      Prescription.countDocuments(),
      Report.countDocuments(),
      Review.countDocuments(),
      EmergencyRequest.countDocuments({ status: 'pending' }),
      Appointment.find()
          .populate('patientId', 'patientData.patientId')
          .populate('doctorId', 'doctorData.doctorId')
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

    // Get role-specific data from the same user document
    let roleData = null;
    if (user.role === 'patient') {
      roleData = user.patientData;
    } else if (user.role === 'doctor') {
      roleData = user.doctorData;
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
    const query = {role: 'doctor'};

    if (specialization) query['doctorData.specialization'] = specialization;
    if (isVerified !== undefined) query['doctorData.isVerified'] = isVerified === 'true';
    if (search) {
      query.$or = [
        {'doctorData.licenseNumber': {$regex: search, $options: 'i'}},
        {'doctorData.specialization': {$regex: search, $options: 'i'}},
        {'profile.firstName': {$regex: search, $options: 'i'}},
        {'profile.lastName': {$regex: search, $options: 'i'}}
      ];
    }

    const doctors = await User.find(query)
        .select('email profile isActive doctorData')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

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
    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'doctor') {
      return res.status(404).json({
        message: 'Doctor not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    const oldIsVerified = user.doctorData.isVerified;
    user.doctorData.isVerified = isVerified;
    await user.save();

    // Log admin action
    await AdminLog.logAction(req.user._id, isVerified ? 'doctor_verified' : 'doctor_unverified', {
      targetType: 'doctor',
      targetId: user._id,
      details: {
        before: {isVerified: oldIsVerified},
        after: { isVerified },
        changes: [`Verification status changed to ${isVerified ? 'verified' : 'unverified'}`]
      }
    });

    res.json({
      message: `Doctor ${isVerified ? 'verified' : 'unverified'} successfully`,
      doctor: {
        id: user._id,
        doctorId: user.doctorData.doctorId,
        isVerified: user.doctorData.isVerified
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
        .populate('patientId', 'patientData.patientId')
        .populate('doctorId', 'doctorData.doctorId')
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
        .populate('patientId', 'patientData.patientId')
        .populate('doctorId', 'doctorData.doctorId')
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
        .populate('patientId', 'patientData.patientId')
        .populate('assignedTo.doctorId', 'doctorData.doctorId')
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

// Settings Management
// Get all settings
router.get('/settings', async (req, res) => {
  try {
    const {page = 1, limit = 10, category, status, search} = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        {name: {$regex: search, $options: 'i'}},
        {description: {$regex: search, $options: 'i'}}
      ];
    }

    const settings = await Settings.find(query)
        .populate('createdBy', 'email profile')
        .populate('updatedBy', 'email profile')
        .sort({category: 1, name: 1})
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Settings.countDocuments(query);

    res.json({
      settings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
});

// Get single setting
router.get('/settings/:id', async (req, res) => {
  try {
    const setting = await Settings.findById(req.params.id)
        .populate('createdBy', 'email profile')
        .populate('updatedBy', 'email profile');

    if (!setting) {
      return res.status(404).json({
        message: 'Setting not found',
        code: 'SETTING_NOT_FOUND'
      });
    }

    res.json({setting});
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({
      message: 'Failed to fetch setting',
      error: error.message
    });
  }
});

// Create new setting
router.post('/settings', [
  body('name').notEmpty().withMessage('Setting name is required'),
  body('category').isIn(['general', 'appointments', 'email', 'system', 'backup', 'api', 'security', 'notifications', 'users', 'reports']).withMessage('Invalid category'),
  body('value').notEmpty().withMessage('Setting value is required'),
  body('type').isIn(['string', 'number', 'boolean', 'password', 'select', 'json']).withMessage('Invalid type'),
  body('description').notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      category,
      value,
      type,
      description,
      isRequired,
      isEncrypted,
      defaultValue,
      validation,
      tags
    } = req.body;

    // Check if setting with same name already exists
    const existingSetting = await Settings.findOne({name});
    if (existingSetting) {
      return res.status(400).json({
        message: 'Setting with this name already exists',
        code: 'SETTING_EXISTS'
      });
    }

    const setting = new Settings({
      name,
      category,
      value,
      type,
      description,
      isRequired: isRequired || false,
      isEncrypted: isEncrypted || false,
      defaultValue: defaultValue || '',
      validation: validation || '',
      tags: tags || [],
      createdBy: req.user._id
    });

    await setting.save();

    // Log admin action
    await AdminLog.logAction(req.user._id, 'setting_created', {
      targetType: 'setting',
      targetId: setting._id,
      details: {
        after: {name, category, type},
        changes: [`Setting '${name}' created`]
      }
    });

    res.status(201).json({
      message: 'Setting created successfully',
      setting
    });
  } catch (error) {
    console.error('Create setting error:', error);
    res.status(500).json({
      message: 'Failed to create setting',
      error: error.message
    });
  }
});

// Update setting
router.put('/settings/:id', [
  body('name').optional().notEmpty().withMessage('Setting name cannot be empty'),
  body('category').optional().isIn(['general', 'appointments', 'email', 'system', 'backup', 'api', 'security', 'notifications', 'users', 'reports']).withMessage('Invalid category'),
  body('value').optional().notEmpty().withMessage('Setting value cannot be empty'),
  body('type').optional().isIn(['string', 'number', 'boolean', 'password', 'select', 'json']).withMessage('Invalid type'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const setting = await Settings.findById(req.params.id);
    if (!setting) {
      return res.status(404).json({
        message: 'Setting not found',
        code: 'SETTING_NOT_FOUND'
      });
    }

    const oldData = {
      name: setting.name,
      category: setting.category,
      value: setting.value,
      type: setting.type,
      description: setting.description
    };

    // Update fields
    const updateFields = ['name', 'category', 'value', 'type', 'description', 'isRequired', 'isEncrypted', 'defaultValue', 'validation', 'tags'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        setting[field] = req.body[field];
      }
    });

    setting.updatedBy = req.user._id;
    await setting.save();

    // Log admin action
    await AdminLog.logAction(req.user._id, 'setting_updated', {
      targetType: 'setting',
      targetId: setting._id,
      details: {
        before: oldData,
        after: {
          name: setting.name,
          category: setting.category,
          value: setting.value,
          type: setting.type,
          description: setting.description
        },
        changes: [`Setting '${setting.name}' updated`]
      }
    });

    res.json({
      message: 'Setting updated successfully',
      setting
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      message: 'Failed to update setting',
      error: error.message
    });
  }
});

// Delete setting
router.delete('/settings/:id', async (req, res) => {
  try {
    const setting = await Settings.findById(req.params.id);
    if (!setting) {
      return res.status(404).json({
        message: 'Setting not found',
        code: 'SETTING_NOT_FOUND'
      });
    }

    // Log admin action before deletion
    await AdminLog.logAction(req.user._id, 'setting_deleted', {
      targetType: 'setting',
      targetId: setting._id,
      details: {
        before: {
          name: setting.name,
          category: setting.category,
          type: setting.type
        },
        changes: [`Setting '${setting.name}' deleted`]
      }
    });

    await Settings.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({
      message: 'Failed to delete setting',
      error: error.message
    });
  }
});

// Get settings by category
router.get('/settings/category/:category', async (req, res) => {
  try {
    const {category} = req.params;
    const settings = await Settings.getByCategory(category);
    res.json({settings});
  } catch (error) {
    console.error('Get settings by category error:', error);
    res.status(500).json({
      message: 'Failed to fetch settings by category',
      error: error.message
    });
  }
});

// Get setting value by name
router.get('/settings/name/:name', async (req, res) => {
  try {
    const {name} = req.params;
    const value = await Settings.getSetting(name);
    res.json({name, value});
  } catch (error) {
    console.error('Get setting by name error:', error);
    res.status(500).json({
      message: 'Failed to fetch setting by name',
      error: error.message
    });
  }
});

// Set setting value by name
router.put('/settings/name/:name', [
  body('value').notEmpty().withMessage('Value is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {name} = req.params;
    const {value} = req.body;

    const setting = await Settings.setSetting(name, value, req.user._id);

    // Log admin action
    await AdminLog.logAction(req.user._id, 'setting_value_updated', {
      targetType: 'setting',
      targetId: setting._id,
      details: {
        before: {name, oldValue: setting.value},
        after: {name, newValue: value},
        changes: [`Setting '${name}' value updated`]
      }
    });

    res.json({
      message: 'Setting value updated successfully',
      setting
    });
  } catch (error) {
    console.error('Set setting value error:', error);
    res.status(500).json({
      message: 'Failed to update setting value',
      error: error.message
    });
  }
});

module.exports = router;
