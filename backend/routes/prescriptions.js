const express = require('express');
const { body, validationResult } = require('express-validator');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');
const { authenticateToken, requireDoctorOrAdmin, requirePatientOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Create prescription
router.post('/', authenticateToken, requireDoctorOrAdmin, [
  body('appointmentId').isMongoId(),
  body('medications').isArray({ min: 1 }),
  body('medications.*.name').notEmpty(),
  body('medications.*.dosage').notEmpty(),
  body('medications.*.frequency').notEmpty(),
  body('medications.*.duration').notEmpty(),
  body('diagnosis.primary').notEmpty(),
  body('diagnosis.secondary').optional().isArray(),
  body('symptoms').optional().isArray(),
  body('vitalSigns').optional().isObject(),
  body('notes').optional().isString(),
  body('followUpInstructions').optional().isString(),
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
      appointmentId,
      medications,
      diagnosis,
      symptoms,
      vitalSigns,
      notes,
      followUpInstructions,
      followUpDate
    } = req.body;

    // Get appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId')
      .populate('doctorId');

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
        code: 'APPOINTMENT_NOT_FOUND'
      });
    }

    // Check if user has permission to create prescription for this appointment
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || appointment.doctorId._id.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        });
      }
    }

    // Check if prescription already exists for this appointment
    const existingPrescription = await Prescription.findOne({ appointmentId });
    if (existingPrescription) {
      return res.status(400).json({
        message: 'Prescription already exists for this appointment',
        code: 'PRESCRIPTION_EXISTS'
      });
    }

    // Create prescription
    const prescription = new Prescription({
      appointmentId,
      patientId: appointment.patientId._id,
      doctorId: appointment.doctorId._id,
      medications,
      diagnosis,
      symptoms: symptoms || [],
      vitalSigns: vitalSigns || {},
      notes,
      followUpInstructions,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined
    });

    await prescription.save();

    // Update appointment with prescription reference
    appointment.prescription = prescription._id;
    await appointment.save();

    // Create notification for patient
    const notification = new Notification({
      userId: appointment.patientId.userId,
      type: 'prescription',
      title: 'New Prescription Available',
      message: `Your prescription from Dr. ${appointment.doctorId.specialization} is ready`,
      data: {
        prescriptionId: prescription._id,
        appointmentId: appointment._id,
        doctorId: appointment.doctorId._id
      }
    });

    await notification.save();

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription: {
        id: prescription._id,
        prescriptionId: prescription.prescriptionId,
        appointmentId: prescription.appointmentId,
        medications: prescription.medications,
        diagnosis: prescription.diagnosis,
        createdAt: prescription.createdAt
      }
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      message: 'Failed to create prescription',
      error: error.message
    });
  }
});

// Get prescriptions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, patientId, doctorId, status } = req.query;
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
    if (status) query.status = status;

    const prescriptions = await Prescription.find(query)
      .populate('patientId', 'patientId')
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
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      message: 'Failed to fetch prescriptions',
      error: error.message
    });
  }
});

// Get single prescription
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId', 'patientId')
      .populate('doctorId', 'doctorId specialization')
      .populate('appointmentId', 'appointmentId appointmentDate');

    if (!prescription) {
      return res.status(404).json({
        message: 'Prescription not found',
        code: 'PRESCRIPTION_NOT_FOUND'
      });
    }

    // Check if user has access to this prescription
    let hasAccess = false;

    if (req.user.role === 'admin') {
      hasAccess = true;
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      hasAccess = patient && prescription.patientId._id.toString() === patient._id.toString();
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      hasAccess = doctor && prescription.doctorId._id.toString() === doctor._id.toString();
    }

    if (!hasAccess) {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    res.json({
      prescription
    });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({
      message: 'Failed to fetch prescription',
      error: error.message
    });
  }
});

// Update prescription
router.put('/:id', authenticateToken, requireDoctorOrAdmin, [
  body('medications').optional().isArray({ min: 1 }),
  body('diagnosis.primary').optional().notEmpty(),
  body('diagnosis.secondary').optional().isArray(),
  body('symptoms').optional().isArray(),
  body('vitalSigns').optional().isObject(),
  body('notes').optional().isString(),
  body('followUpInstructions').optional().isString(),
  body('followUpDate').optional().isISO8601(),
  body('status').optional().isIn(['active', 'completed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        message: 'Prescription not found',
        code: 'PRESCRIPTION_NOT_FOUND'
      });
    }

    // Check if user has permission to update this prescription
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || prescription.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        });
      }
    }

    const {
      medications,
      diagnosis,
      symptoms,
      vitalSigns,
      notes,
      followUpInstructions,
      followUpDate,
      status
    } = req.body;

    if (medications) prescription.medications = medications;
    if (diagnosis) {
      if (diagnosis.primary) prescription.diagnosis.primary = diagnosis.primary;
      if (diagnosis.secondary) prescription.diagnosis.secondary = diagnosis.secondary;
    }
    if (symptoms) prescription.symptoms = symptoms;
    if (vitalSigns) prescription.vitalSigns = vitalSigns;
    if (notes !== undefined) prescription.notes = notes;
    if (followUpInstructions !== undefined) prescription.followUpInstructions = followUpInstructions;
    if (followUpDate) prescription.followUpDate = new Date(followUpDate);
    if (status) prescription.status = status;

    await prescription.save();

    res.json({
      message: 'Prescription updated successfully',
      prescription: {
        id: prescription._id,
        prescriptionId: prescription.prescriptionId,
        medications: prescription.medications,
        diagnosis: prescription.diagnosis,
        status: prescription.status,
        updatedAt: prescription.updatedAt
      }
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({
      message: 'Failed to update prescription',
      error: error.message
    });
  }
});

// Add refill to prescription
router.post('/:id/refill', authenticateToken, requirePatientOrAdmin, [
  body('quantity').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { quantity = 1 } = req.body;
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        message: 'Prescription not found',
        code: 'PRESCRIPTION_NOT_FOUND'
      });
    }

    // Check if user has access to this prescription
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient || prescription.patientId.toString() !== patient._id.toString()) {
        return res.status(403).json({
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        });
      }
    }

    if (prescription.status !== 'active') {
      return res.status(400).json({
        message: 'Cannot refill inactive prescription',
        code: 'PRESCRIPTION_NOT_ACTIVE'
      });
    }

    if (prescription.refills.used >= prescription.refills.allowed) {
      return res.status(400).json({
        message: 'No refills remaining',
        code: 'NO_REFILLS_REMAINING'
      });
    }

    prescription.refills.used += quantity;
    await prescription.save();

    res.json({
      message: 'Refill processed successfully',
      prescription: {
        id: prescription._id,
        prescriptionId: prescription.prescriptionId,
        refills: prescription.refills
      }
    });
  } catch (error) {
    console.error('Process refill error:', error);
    res.status(500).json({
      message: 'Failed to process refill',
      error: error.message
    });
  }
});

// Delete prescription
router.delete('/:id', authenticateToken, requireDoctorOrAdmin, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        message: 'Prescription not found',
        code: 'PRESCRIPTION_NOT_FOUND'
      });
    }

    // Check if user has permission to delete this prescription
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || prescription.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        });
      }
    }

    prescription.status = 'cancelled';
    await prescription.save();

    res.json({
      message: 'Prescription cancelled successfully',
      prescription: {
        id: prescription._id,
        prescriptionId: prescription.prescriptionId,
        status: prescription.status
      }
    });
  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({
      message: 'Failed to cancel prescription',
      error: error.message
    });
  }
});

module.exports = router;
