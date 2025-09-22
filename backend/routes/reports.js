const express = require('express');
const { body, validationResult } = require('express-validator');
const Report = require('../models/Report');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');
const { authenticateToken, requireDoctorOrAdmin, requirePatientOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Create report
router.post('/', authenticateToken, requireDoctorOrAdmin, [
  body('patientId').isMongoId(),
  body('type').isIn(['lab', 'imaging', 'pathology', 'radiology', 'blood_test', 'urine_test', 'xray', 'mri', 'ct_scan', 'ultrasound', 'other']),
  body('title').notEmpty(),
  body('description').optional().isString(),
  body('testDate').isISO8601(),
  body('reportDate').isISO8601(),
  body('results').optional().isArray(),
  body('files').optional().isArray(),
  body('labTechnician.name').optional().isString(),
  body('labTechnician.license').optional().isString(),
  body('recommendations').optional().isString(),
  body('followUpRequired').optional().isBoolean(),
  body('followUpDate').optional().isISO8601()
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
      patientId,
      type,
      title,
      description,
      testDate,
      reportDate,
      results,
      files,
      labTechnician,
      recommendations,
      followUpRequired,
      followUpDate
    } = req.body;

    // Get doctor
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        message: 'Patient not found',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    // Create report
    const report = new Report({
      patientId,
      doctorId: doctor._id,
      type,
      title,
      description,
      testDate: new Date(testDate),
      reportDate: new Date(reportDate),
      results: results || [],
      files: files || [],
      labTechnician: labTechnician || {},
      recommendations,
      followUpRequired: followUpRequired || false,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined
    });

    await report.save();

    // Create notification for patient
    const notification = new Notification({
      userId: patient.userId,
      type: 'report',
      title: 'New Medical Report Available',
      message: `Your ${type} report "${title}" is ready for review`,
      data: {
        reportId: report._id,
        doctorId: doctor._id,
        type: report.type
      }
    });

    await notification.save();

    res.status(201).json({
      message: 'Report created successfully',
      report: {
        id: report._id,
        reportId: report.reportId,
        type: report.type,
        title: report.title,
        testDate: report.testDate,
        reportDate: report.reportDate,
        status: report.status,
        createdAt: report.createdAt
      }
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      message: 'Failed to create report',
      error: error.message
    });
  }
});

// Get reports
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, patientId, doctorId, type, status } = req.query;
    const query = {};

    // Apply role-based filtering
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) {
        return res.status(404).json({
          message: 'Patient profile not found',
          code: 'PATIENT_NOT_FOUND'
        });
      }
      query.patientId = patient._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) {
        return res.status(404).json({
          message: 'Doctor profile not found',
          code: 'DOCTOR_NOT_FOUND'
        });
      }
      query.doctorId = doctor._id;
    }

    // Additional filters
    if (patientId && req.user.role !== 'patient') query.patientId = patientId;
    if (doctorId && req.user.role !== 'doctor') query.doctorId = doctorId;
    if (type) query.type = type;
    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate('patientId', 'patientId')
      .populate('doctorId', 'doctorId specialization')
      .populate('reviewedBy', 'doctorId specialization')
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
    console.error('Get reports error:', error);
    res.status(500).json({
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
});

// Get single report
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('patientId', 'patientId')
      .populate('doctorId', 'doctorId specialization')
      .populate('reviewedBy', 'doctorId specialization');

    if (!report) {
      return res.status(404).json({
        message: 'Report not found',
        code: 'REPORT_NOT_FOUND'
      });
    }

    // Check if user has access to this report
    let hasAccess = false;

    if (req.user.role === 'admin') {
      hasAccess = true;
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      hasAccess = patient && report.patientId._id.toString() === patient._id.toString();
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      hasAccess = doctor && (
        report.doctorId._id.toString() === doctor._id.toString() ||
        report.sharedWith.some(share => share.doctorId.toString() === doctor._id.toString())
      );
    }

    if (!hasAccess) {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Log access
    await report.logAccess(req.user._id, 'viewed');

    res.json({
      report
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      message: 'Failed to fetch report',
      error: error.message
    });
  }
});

// Update report
router.put('/:id', authenticateToken, requireDoctorOrAdmin, [
  body('title').optional().notEmpty(),
  body('description').optional().isString(),
  body('results').optional().isArray(),
  body('files').optional().isArray(),
  body('recommendations').optional().isString(),
  body('followUpRequired').optional().isBoolean(),
  body('followUpDate').optional().isISO8601(),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: 'Report not found',
        code: 'REPORT_NOT_FOUND'
      });
    }

    // Check if user has permission to update this report
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || report.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        });
      }
    }

    const {
      title,
      description,
      results,
      files,
      recommendations,
      followUpRequired,
      followUpDate,
      status
    } = req.body;

    if (title) report.title = title;
    if (description !== undefined) report.description = description;
    if (results) report.results = results;
    if (files) report.files = files;
    if (recommendations !== undefined) report.recommendations = recommendations;
    if (followUpRequired !== undefined) report.followUpRequired = followUpRequired;
    if (followUpDate) report.followUpDate = new Date(followUpDate);
    if (status) report.status = status;

    await report.save();

    res.json({
      message: 'Report updated successfully',
      report: {
        id: report._id,
        reportId: report.reportId,
        title: report.title,
        status: report.status,
        updatedAt: report.updatedAt
      }
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      message: 'Failed to update report',
      error: error.message
    });
  }
});

// Review report
router.put('/:id/review', authenticateToken, requireDoctorOrAdmin, [
  body('recommendations').optional().isString(),
  body('followUpRequired').optional().isBoolean(),
  body('followUpDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { recommendations, followUpRequired, followUpDate } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: 'Report not found',
        code: 'REPORT_NOT_FOUND'
      });
    }

    // Get doctor
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor profile not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    report.reviewedBy = doctor._id;
    report.reviewedAt = new Date();
    if (recommendations) report.recommendations = recommendations;
    if (followUpRequired !== undefined) report.followUpRequired = followUpRequired;
    if (followUpDate) report.followUpDate = new Date(followUpDate);

    await report.save();

    res.json({
      message: 'Report reviewed successfully',
      report: {
        id: report._id,
        reportId: report.reportId,
        reviewedBy: report.reviewedBy,
        reviewedAt: report.reviewedAt,
        recommendations: report.recommendations
      }
    });
  } catch (error) {
    console.error('Review report error:', error);
    res.status(500).json({
      message: 'Failed to review report',
      error: error.message
    });
  }
});

// Share report with another doctor
router.post('/:id/share', authenticateToken, requireDoctorOrAdmin, [
  body('doctorId').isMongoId(),
  body('accessLevel').optional().isIn(['view', 'download'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { doctorId, accessLevel = 'view' } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: 'Report not found',
        code: 'REPORT_NOT_FOUND'
      });
    }

    // Check if user has permission to share this report
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || report.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        });
      }
    }

    // Check if doctor exists
    const targetDoctor = await Doctor.findById(doctorId);
    if (!targetDoctor) {
      return res.status(404).json({
        message: 'Doctor not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    // Check if already shared
    const alreadyShared = report.sharedWith.some(
      share => share.doctorId.toString() === doctorId
    );

    if (alreadyShared) {
      return res.status(400).json({
        message: 'Report already shared with this doctor',
        code: 'ALREADY_SHARED'
      });
    }

    report.sharedWith.push({
      doctorId,
      accessLevel,
      sharedAt: new Date()
    });

    await report.save();

    res.json({
      message: 'Report shared successfully',
      report: {
        id: report._id,
        reportId: report.reportId,
        sharedWith: report.sharedWith
      }
    });
  } catch (error) {
    console.error('Share report error:', error);
    res.status(500).json({
      message: 'Failed to share report',
      error: error.message
    });
  }
});

// Download report
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: 'Report not found',
        code: 'REPORT_NOT_FOUND'
      });
    }

    // Check if user has access to this report
    let hasAccess = false;

    if (req.user.role === 'admin') {
      hasAccess = true;
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      hasAccess = patient && report.patientId.toString() === patient._id.toString();
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      hasAccess = doctor && (
        report.doctorId.toString() === doctor._id.toString() ||
        report.sharedWith.some(share => 
          share.doctorId.toString() === doctor._id.toString() && 
          share.accessLevel === 'download'
        )
      );
    }

    if (!hasAccess) {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Log download access
    await report.logAccess(req.user._id, 'downloaded');

    // In a real application, you would generate and return the actual file
    // For now, we'll return the report data
    res.json({
      message: 'Report download initiated',
      report: {
        id: report._id,
        reportId: report.reportId,
        title: report.title,
        type: report.type,
        files: report.files
      }
    });
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({
      message: 'Failed to download report',
      error: error.message
    });
  }
});

// Delete report
router.delete('/:id', authenticateToken, requireDoctorOrAdmin, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: 'Report not found',
        code: 'REPORT_NOT_FOUND'
      });
    }

    // Check if user has permission to delete this report
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || report.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        });
      }
    }

    report.status = 'cancelled';
    await report.save();

    res.json({
      message: 'Report cancelled successfully',
      report: {
        id: report._id,
        reportId: report.reportId,
        status: report.status
      }
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      message: 'Failed to cancel report',
      error: error.message
    });
  }
});

module.exports = router;
