const express = require('express');
const { body, validationResult } = require('express-validator');
const Doctor = require('../models/Doctor');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all doctors (public route)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, specialization, search } = req.query;
    const query = {};

    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }

    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { specialization: new RegExp(search, 'i') }
      ];
    }

    const doctors = await Doctor.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1 });

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

// Get single doctor
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-password');

    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    res.json({ doctor });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      message: 'Failed to fetch doctor',
      error: error.message
    });
  }
});

// Search doctors
router.get('/search', async (req, res) => {
  try {
    const { q, specialization, location } = req.query;
    const query = {};

    if (q) {
      query.$or = [
        { firstName: new RegExp(q, 'i') },
        { lastName: new RegExp(q, 'i') },
        { specialization: new RegExp(q, 'i') }
      ];
    }

    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }

    if (location) {
      query.location = new RegExp(location, 'i');
    }

    const doctors = await Doctor.find(query)
      .select('-password')
      .limit(20)
      .sort({ rating: -1 });

    res.json({ doctors });
  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({
      message: 'Failed to search doctors',
      error: error.message
    });
  }
});

module.exports = router;
