const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');
const { authenticateToken, requirePatient, requireDoctorOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Book new appointment
router.post('/book', authenticateToken, requirePatient, [
  body('doctorId').isMongoId(),
  body('appointmentDate').isISO8601(),
  body('appointmentTime').notEmpty(),
  body('type').isIn(['in_person', 'video', 'phone']),
  body('reason').notEmpty(),
  body('symptoms').optional().isArray(),
  body('duration').optional().isInt({ min: 15, max: 120 })
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
      doctorId,
      appointmentDate,
      appointmentTime,
      type,
      reason,
      symptoms,
      duration = 30
    } = req.body;

    // Get patient
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({
        message: 'Patient profile not found',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    // Check if doctor exists and is verified
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isVerified) {
      return res.status(404).json({
        message: 'Doctor not found or not verified',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    // Check if appointment date is in the future
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    if (appointmentDateTime <= new Date()) {
      return res.status(400).json({
        message: 'Appointment date must be in the future',
        code: 'INVALID_APPOINTMENT_DATE'
      });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        message: 'Time slot is already booked',
        code: 'TIME_SLOT_BOOKED'
      });
    }

    // Create appointment
    const appointment = new Appointment({
      patientId: patient._id,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      duration,
      type,
      reason,
      symptoms: symptoms || [],
      payment: {
        amount: doctor.consultationFee
      }
    });

    await appointment.save();

    // Create notifications
    const notifications = [
      {
        userId: doctor.userId,
        type: 'appointment',
        title: 'New Appointment Booked',
        message: `New appointment with ${req.user.profile.firstName} ${req.user.profile.lastName} on ${appointmentDate} at ${appointmentTime}`,
        data: {
          appointmentId: appointment._id,
          patientId: patient._id,
          date: appointmentDate
        }
      },
      {
        userId: req.user._id,
        type: 'appointment',
        title: 'Appointment Confirmed',
        message: `Your appointment with Dr. ${doctor.specialization} is confirmed for ${appointmentDate} at ${appointmentTime}`,
        data: {
          appointmentId: appointment._id,
          doctorId: doctor._id,
          date: appointmentDate
        }
      }
    ];

    await Notification.insertMany(notifications);

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment._id,
        appointmentId: appointment.appointmentId,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        type: appointment.type,
        status: appointment.status,
        payment: appointment.payment
      }
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      message: 'Failed to book appointment',
      error: error.message
    });
  }
});

// Get available time slots for a doctor
router.get('/available-slots/:doctorId', [
  body('date').isISO8601()
], async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: 'Date is required',
        code: 'DATE_REQUIRED'
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isVerified) {
      return res.status(404).json({
        message: 'Doctor not found or not verified',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'lowercase' });

    // Get doctor's availability for the day
    const dayAvailability = doctor.availability.find(
      avail => avail.dayOfWeek === dayOfWeek && avail.isAvailable
    );

    if (!dayAvailability) {
      return res.json({
        availableSlots: [],
        message: 'Doctor is not available on this day'
      });
    }

    // Get booked appointments for the day
    const bookedAppointments = await Appointment.find({
      doctorId,
      appointmentDate: {
        $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
        $lt: new Date(appointmentDate.setHours(23, 59, 59, 999))
      },
      status: { $in: ['scheduled', 'confirmed'] }
    }).select('appointmentTime duration');

    // Generate available time slots
    const availableSlots = [];
    const startTime = dayAvailability.startTime;
    const endTime = dayAvailability.endTime;
    const slotDuration = 30; // 30 minutes per slot

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      // Check if this slot is already booked
      const isBooked = bookedAppointments.some(apt => apt.appointmentTime === timeString);
      
      if (!isBooked) {
        availableSlots.push({
          time: timeString,
          available: true
        });
      }
    }

    res.json({
      availableSlots,
      doctorAvailability: {
        startTime: dayAvailability.startTime,
        endTime: dayAvailability.endTime
      }
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      message: 'Failed to get available slots',
      error: error.message
    });
  }
});

// Get appointment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'patientId')
      .populate('doctorId', 'doctorId specialization');

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
        code: 'APPOINTMENT_NOT_FOUND'
      });
    }

    // Check if user has access to this appointment
    const hasAccess = 
      req.user.role === 'admin' ||
      (req.user.role === 'doctor' && appointment.doctorId._id.toString() === req.user.doctorId) ||
      (req.user.role === 'patient' && appointment.patientId._id.toString() === req.user.patientId);

    if (!hasAccess) {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
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

// Update appointment
router.put('/:id', authenticateToken, requireDoctorOrAdmin, [
  body('status').optional().isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled']),
  body('notes').optional().isString(),
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

    const { status, notes, followUpRequired, followUpDate } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
        code: 'APPOINTMENT_NOT_FOUND'
      });
    }

    // Check if user has permission to update this appointment
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        });
      }
    }

    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    if (followUpRequired !== undefined) appointment.followUpRequired = followUpRequired;
    if (followUpDate) appointment.followUpDate = new Date(followUpDate);

    await appointment.save();

    res.json({
      message: 'Appointment updated successfully',
      appointment: {
        id: appointment._id,
        appointmentId: appointment.appointmentId,
        status: appointment.status,
        notes: appointment.notes,
        followUpRequired: appointment.followUpRequired,
        followUpDate: appointment.followUpDate
      }
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      message: 'Failed to update appointment',
      error: error.message
    });
  }
});

// Cancel appointment
router.put('/:id/cancel', authenticateToken, [
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
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
        code: 'APPOINTMENT_NOT_FOUND'
      });
    }

    // Check if user has permission to cancel this appointment
    let canCancel = false;
    let cancelledBy = '';

    if (req.user.role === 'admin') {
      canCancel = true;
      cancelledBy = 'admin';
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (doctor && appointment.doctorId.toString() === doctor._id.toString()) {
        canCancel = true;
        cancelledBy = 'doctor';
      }
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (patient && appointment.patientId.toString() === patient._id.toString()) {
        canCancel = true;
        cancelledBy = 'patient';
      }
    }

    if (!canCancel) {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
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
      cancelledBy,
      reason: reason || `Cancelled by ${cancelledBy}`,
      cancelledAt: new Date()
    };

    await appointment.save();

    res.json({
      message: 'Appointment cancelled successfully',
      appointment: {
        id: appointment._id,
        appointmentId: appointment.appointmentId,
        status: appointment.status,
        cancellation: appointment.cancellation
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

module.exports = router;
