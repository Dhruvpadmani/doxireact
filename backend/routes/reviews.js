const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Create review
router.post('/', authenticateToken, authorizeRole('patient'), [
  body('appointmentId').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('title').optional().isLength({ max: 100 }),
  body('comment').optional().isLength({ max: 1000 }),
  body('aspects.punctuality').optional().isInt({ min: 1, max: 5 }),
  body('aspects.communication').optional().isInt({ min: 1, max: 5 }),
  body('aspects.treatment').optional().isInt({ min: 1, max: 5 }),
  body('aspects.environment').optional().isInt({ min: 1, max: 5 })
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
      rating,
      title,
      comment,
      aspects
    } = req.body;

    // Get patient
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({
        message: 'Patient profile not found',
        code: 'PATIENT_NOT_FOUND'
      });
    }

    // Get appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId');

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found',
        code: 'APPOINTMENT_NOT_FOUND'
      });
    }

    // Check if appointment belongs to this patient
    if (appointment.patientId.toString() !== patient._id.toString()) {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Check if appointment is completed
    if (appointment.status !== 'completed') {
      return res.status(400).json({
        message: 'Can only review completed appointments',
        code: 'APPOINTMENT_NOT_COMPLETED'
      });
    }

    // Check if review already exists for this appointment
    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return res.status(400).json({
        message: 'Review already exists for this appointment',
        code: 'REVIEW_EXISTS'
      });
    }

    // Create review
    const review = new Review({
      patientId: patient._id,
      doctorId: appointment.doctorId._id,
      appointmentId,
      rating,
      title,
      comment,
      aspects: aspects || {},
      isVerified: true // Auto-verify reviews from completed appointments
    });

    await review.save();

    res.status(201).json({
      message: 'Review submitted successfully',
      review: {
        id: review._id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        aspects: review.aspects,
        status: review.status,
        createdAt: review.createdAt
      }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      message: 'Failed to submit review',
      error: error.message
    });
  }
});

// Get reviews
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, doctorId, patientId, rating, status } = req.query;
    const query = {};

    if (doctorId) query.doctorId = doctorId;
    if (patientId) query.patientId = patientId;
    if (rating) query.rating = parseInt(rating);
    if (status) query.status = status;

    const reviews = await Review.find(query)
      .populate('patientId', 'patientId')
      .populate('doctorId', 'doctorId specialization')
      .populate('appointmentId', 'appointmentId appointmentDate')
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

// Get single review
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('patientId', 'patientId')
      .populate('doctorId', 'doctorId specialization')
      .populate('appointmentId', 'appointmentId appointmentDate');

    if (!review) {
      return res.status(404).json({
        message: 'Review not found',
        code: 'REVIEW_NOT_FOUND'
      });
    }

    res.json({
      review
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      message: 'Failed to fetch review',
      error: error.message
    });
  }
});

// Update review
router.put('/:id', authenticateToken, authorizeRole('patient'), [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('title').optional().isLength({ max: 100 }),
  body('comment').optional().isLength({ max: 1000 }),
  body('aspects.punctuality').optional().isInt({ min: 1, max: 5 }),
  body('aspects.communication').optional().isInt({ min: 1, max: 5 }),
  body('aspects.treatment').optional().isInt({ min: 1, max: 5 }),
  body('aspects.environment').optional().isInt({ min: 1, max: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rating, title, comment, aspects } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: 'Review not found',
        code: 'REVIEW_NOT_FOUND'
      });
    }

    // Check if user has permission to update this review
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient || review.patientId.toString() !== patient._id.toString()) {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Check if review can be updated (not approved yet)
    if (review.status === 'approved') {
      return res.status(400).json({
        message: 'Cannot update approved review',
        code: 'REVIEW_APPROVED'
      });
    }

    if (rating) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    if (aspects) {
      Object.keys(aspects).forEach(key => {
        if (aspects[key] !== undefined) {
          review.aspects[key] = aspects[key];
        }
      });
    }

    await review.save();

    res.json({
      message: 'Review updated successfully',
      review: {
        id: review._id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        aspects: review.aspects,
        updatedAt: review.updatedAt
      }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      message: 'Failed to update review',
      error: error.message
    });
  }
});

// Respond to review (doctor only)
router.put('/:id/respond', authenticateToken, authorizeRole('doctor', 'admin'), [
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
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: 'Review not found',
        code: 'REVIEW_NOT_FOUND'
      });
    }

    // Check if user has permission to respond to this review
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || review.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        });
      }
    }

    review.doctorResponse = {
      response,
      respondedAt: new Date()
    };

    await review.save();

    res.json({
      message: 'Response added successfully',
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

// Mark review as helpful
router.post('/:id/helpful', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: 'Review not found',
        code: 'REVIEW_NOT_FOUND'
      });
    }

    // Check if user already marked this review as helpful
    const alreadyMarked = review.helpful.users.some(
      userId => userId.toString() === req.user._id.toString()
    );

    if (alreadyMarked) {
      return res.status(400).json({
        message: 'Review already marked as helpful',
        code: 'ALREADY_MARKED'
      });
    }

    review.helpful.users.push(req.user._id);
    review.helpful.count += 1;

    await review.save();

    res.json({
      message: 'Review marked as helpful',
      review: {
        id: review._id,
        helpful: review.helpful
      }
    });
  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({
      message: 'Failed to mark review as helpful',
      error: error.message
    });
  }
});

// Delete review
router.delete('/:id', authenticateToken, authorizeRole('patient'), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: 'Review not found',
        code: 'REVIEW_NOT_FOUND'
      });
    }

    // Check if user has permission to delete this review
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient || review.patientId.toString() !== patient._id.toString()) {
      return res.status(403).json({
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Check if review can be deleted (not approved yet)
    if (review.status === 'approved') {
      return res.status(400).json({
        message: 'Cannot delete approved review',
        code: 'REVIEW_APPROVED'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      message: 'Failed to delete review',
      error: error.message
    });
  }
});

// Get doctor's reviews
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { page = 1, limit = 10, rating, sortBy = 'newest' } = req.query;
    const { doctorId } = req.params;

    const query = { doctorId, status: 'approved' };
    if (rating) query.rating = parseInt(rating);

    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'highest':
        sort = { rating: -1 };
        break;
      case 'lowest':
        sort = { rating: 1 };
        break;
      case 'most_helpful':
        sort = { 'helpful.count': -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const reviews = await Review.find(query)
      .populate('patientId', 'patientId')
      .populate('appointmentId', 'appointmentId appointmentDate')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    // Calculate average rating
    const avgRating = await Review.aggregate([
      { $match: { doctorId, status: 'approved' } },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } }
    ]);

    res.json({
      reviews,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      averageRating: avgRating[0]?.averageRating || 0
    });
  } catch (error) {
    console.error('Get doctor reviews error:', error);
    res.status(500).json({
      message: 'Failed to fetch doctor reviews',
      error: error.message
    });
  }
});

module.exports = router;
