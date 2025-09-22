const express = require('express');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

const router = express.Router();

// Public route to search doctors
router.get('/search', async (req, res) => {
  try {
    const { 
      specialization, 
      location, 
      rating, 
      consultationType, 
      maxFee, 
      minFee,
      language,
      search,
      page = 1, 
      limit = 10,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    // Build search query
    const query = { isVerified: true };
    
    // Search by specialization
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    
    // Search by rating
    if (rating) {
      query['rating.average'] = { $gte: parseFloat(rating) };
    }
    
    // Search by consultation fee range
    if (minFee || maxFee) {
      query.consultationFee = {};
      if (minFee) query.consultationFee.$gte = parseFloat(minFee);
      if (maxFee) query.consultationFee.$lte = parseFloat(maxFee);
    }
    
    // Search by consultation type
    if (consultationType) {
      query['consultationTypes.type'] = consultationType;
    }
    
    // Search by language
    if (language) {
      query.languages = { $in: [new RegExp(language, 'i')] };
    }
    
    // General text search
    if (search) {
      query.$or = [
        { specialization: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    if (sortBy === 'rating') {
      sort['rating.average'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'fee') {
      sort.consultationFee = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'experience') {
      sort.experience = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by newest
    }

    // Execute search with pagination
    const doctors = await Doctor.find(query)
      .populate('userId', 'email profile')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-verificationDocuments -holidays'); // Exclude sensitive data

    const total = await Doctor.countDocuments(query);

    // Get unique specializations for filter options
    const specializations = await Doctor.distinct('specialization', { isVerified: true });
    
    // Get unique languages for filter options
    const languages = await Doctor.aggregate([
      { $match: { isVerified: true } },
      { $unwind: '$languages' },
      { $group: { _id: '$languages' } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      doctors,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      },
      filters: {
        specializations: specializations.sort(),
        languages: languages.map(l => l._id).sort(),
        consultationTypes: ['in_person', 'video', 'phone']
      }
    });
  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({
      message: 'Failed to search doctors',
      error: error.message
    });
  }
});

// Get single doctor details (public)
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'email profile')
      .select('-verificationDocuments -holidays');

    if (!doctor || !doctor.isVerified) {
      return res.status(404).json({
        message: 'Doctor not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    res.json({ doctor });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      message: 'Failed to fetch doctor details',
      error: error.message
    });
  }
});

// Get doctor's availability for booking
router.get('/:id/availability', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        message: 'Date parameter is required'
      });
    }

    const doctor = await Doctor.findById(req.params.id)
      .select('availability holidays consultationTypes');

    if (!doctor || !doctor.isVerified) {
      return res.status(404).json({
        message: 'Doctor not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    // Check if doctor is available on this day
    const dayAvailability = doctor.availability.find(
      av => av.dayOfWeek === dayOfWeek && av.isAvailable
    );

    if (!dayAvailability) {
      return res.json({
        available: false,
        message: 'Doctor is not available on this day'
      });
    }

    // Check if it's a holiday
    const isHoliday = doctor.holidays.some(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.toDateString() === requestedDate.toDateString();
    });

    if (isHoliday) {
      return res.json({
        available: false,
        message: 'Doctor is on holiday on this day'
      });
    }

    res.json({
      available: true,
      timeSlots: {
        startTime: dayAvailability.startTime,
        endTime: dayAvailability.endTime
      },
      consultationTypes: doctor.consultationTypes
    });
  } catch (error) {
    console.error('Get doctor availability error:', error);
    res.status(500).json({
      message: 'Failed to fetch doctor availability',
      error: error.message
    });
  }
});

module.exports = router;
