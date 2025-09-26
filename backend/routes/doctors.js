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

// Enhanced search doctors with filtering, sorting, and pagination
router.get('/search', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sortBy = 'rating',
      sortOrder = 'desc',
      search: searchTerm,
      specialization,
      rating,
      consultationType,
      language,
      minFee,
      maxFee,
      q
    } = req.query;

    // Build query
    const query = {};
    
    if (searchTerm) {
      query.$or = [
        { firstName: new RegExp(searchTerm, 'i') },
        { lastName: new RegExp(searchTerm, 'i') },
        { specialization: new RegExp(searchTerm, 'i') },
        { 'userId.profile.firstName': new RegExp(searchTerm, 'i') },
        { 'userId.profile.lastName': new RegExp(searchTerm, 'i') }
      ];
    }

    if (q) { // For backward compatibility
      query.$or = [
        { firstName: new RegExp(q, 'i') },
        { lastName: new RegExp(q, 'i') },
        { specialization: new RegExp(q, 'i') },
        { 'userId.profile.firstName': new RegExp(q, 'i') },
        { 'userId.profile.lastName': new RegExp(q, 'i') }
      ];
    }

    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }

    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    if (consultationType) {
      query['consultationTypes.type'] = consultationType;
    }

    if (language) {
      query.languages = { $in: [language] };
    }

    if (minFee || maxFee) {
      query.consultationFee = {};
      if (minFee) query.consultationFee.$gte = parseFloat(minFee);
      if (maxFee) query.consultationFee.$lte = parseFloat(maxFee);
    }

    // Determine sort order
    const sort = {};
    if (sortBy === 'fee') {
      sort.consultationFee = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'experience') {
      sort.experience = sortOrder === 'asc' ? 1 : -1;
    } else { // Default to rating
      sort.rating = sortOrder === 'asc' ? 1 : -1;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query
    const [doctors, total] = await Promise.all([
      Doctor.find(query)
        .select('-password')
        .populate('userId', 'profile')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Doctor.countDocuments(query)
    ]);

    // Get filter options for the client
    const filterOptions = await getFilterOptions();

    res.json({
      doctors,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      },
      filters: filterOptions
    });
  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({
      message: 'Failed to search doctors',
      error: error.message
    });
  }
});

// Get filter options for the frontend
router.get('/filter-options', async (req, res) => {
  try {
    const filterOptions = await getFilterOptions();
    
    res.json({
      specializations: filterOptions.specializations,
      languages: filterOptions.languages,
      consultationTypes: filterOptions.consultationTypes
    });
  } catch (error) {
    console.error('Get filter options error:', error);
    res.status(500).json({
      message: 'Failed to fetch filter options',
      error: error.message
    });
  }
});

// Helper function to get filter options
async function getFilterOptions() {
  try {
    const specializations = await Doctor.distinct('specialization');
    const languages = await Doctor.distinct('languages');
    const consultationTypes = await Doctor.distinct('consultationTypes.type');
    
    return {
      specializations: specializations.filter(Boolean),
      languages: languages.filter(Boolean),
      consultationTypes: consultationTypes.filter(Boolean)
    };
  } catch (error) {
    console.error('Get filter options helper error:', error);
    return {
      specializations: [],
      languages: [],
      consultationTypes: []
    };
  }
}

module.exports = router;
