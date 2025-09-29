const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all doctors (public route)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, specialization, search } = req.query;
      const query = {role: 'doctor'};

    if (specialization) {
        query['doctorData.specialization'] = new RegExp(specialization, 'i');
    }

    if (search) {
      query.$or = [
          {'profile.firstName': new RegExp(search, 'i')},
          {'profile.lastName': new RegExp(search, 'i')},
          {'doctorData.specialization': new RegExp(search, 'i')}
      ];
    }

      const doctors = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
          .sort({'doctorData.rating.average': -1});

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
      const query = {role: 'doctor'};
    
    if (searchTerm) {
      query.$or = [
          {'profile.firstName': new RegExp(searchTerm, 'i')},
          {'profile.lastName': new RegExp(searchTerm, 'i')},
          {'doctorData.specialization': new RegExp(searchTerm, 'i')}
      ];
    }

    if (q) { // For backward compatibility
      query.$or = [
          {'profile.firstName': new RegExp(q, 'i')},
          {'profile.lastName': new RegExp(q, 'i')},
          {'doctorData.specialization': new RegExp(q, 'i')}
      ];
    }

    if (specialization) {
        query['doctorData.specialization'] = new RegExp(specialization, 'i');
    }

    if (rating) {
        query['doctorData.rating.average'] = {$gte: parseFloat(rating)};
    }

    if (consultationType) {
        query['doctorData.consultationTypes.type'] = consultationType;
    }

    if (language) {
        query['doctorData.languages'] = {$in: [language]};
    }

    if (minFee || maxFee) {
        query['doctorData.consultationFee'] = {};
        if (minFee) query['doctorData.consultationFee'].$gte = parseFloat(minFee);
        if (maxFee) query['doctorData.consultationFee'].$lte = parseFloat(maxFee);
    }

    // Determine sort order
    const sort = {};
    if (sortBy === 'fee') {
        sort['doctorData.consultationFee'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'experience') {
        sort['doctorData.experience'] = sortOrder === 'asc' ? 1 : -1;
    } else { // Default to rating
        sort['doctorData.rating.average'] = sortOrder === 'asc' ? 1 : -1;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query
    const [doctors, total] = await Promise.all([
        User.find(query)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
        User.countDocuments(query)
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

// Get single doctor
router.get('/:id', async (req, res) => {
    try {
        const doctor = await User.findById(req.params.id).select('-password');

        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({
                message: 'Doctor not found',
                code: 'DOCTOR_NOT_FOUND'
            });
        }

        res.json({doctor});
    } catch (error) {
        console.error('Get doctor error:', error);
        res.status(500).json({
            message: 'Failed to fetch doctor',
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
      const specializations = await User.distinct('doctorData.specialization', {role: 'doctor'});
      const languages = await User.distinct('doctorData.languages', {role: 'doctor'});
      const consultationTypes = await User.distinct('doctorData.consultationTypes.type', {role: 'doctor'});
    
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

// Get available time slots for a doctor on a specific date
router.get('/:id/available-slots', async (req, res) => {
    try {
        const {id} = req.params;
        const {date, consultationType = 'in_person'} = req.query;

        if (!date) {
            return res.status(400).json({
                message: 'Date is required',
                code: 'DATE_REQUIRED'
            });
        }

        // Validate date format
        const requestedDate = new Date(date);
        if (isNaN(requestedDate.getTime())) {
            return res.status(400).json({
                message: 'Invalid date format',
                code: 'INVALID_DATE'
            });
        }

        // Check if date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (requestedDate < today) {
            return res.status(400).json({
                message: 'Cannot book appointments for past dates',
                code: 'PAST_DATE'
            });
        }

        // Get doctor
        const doctor = await User.findById(id).select('-password');
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({
                message: 'Doctor not found',
                code: 'DOCTOR_NOT_FOUND'
            });
        }

        // Check if doctor has the requested consultation type
        const consultationTypeData = doctor.doctorData.consultationTypes.find(
            ct => ct.type === consultationType
        );
        if (!consultationTypeData) {
            return res.status(400).json({
                message: 'Doctor does not offer this consultation type',
                code: 'CONSULTATION_TYPE_NOT_AVAILABLE'
            });
        }

        // Get day of week
        const dayOfWeek = requestedDate.toLocaleDateString('en-US', {weekday: 'long'}).toLowerCase();

        // Check if doctor is available on this day
        const dayAvailability = doctor.doctorData.availability.find(
            av => av.dayOfWeek === dayOfWeek && av.isAvailable
        );

        if (!dayAvailability) {
            return res.json({
                availableSlots: [],
                message: 'Doctor is not available on this day'
            });
        }

        // Check if it's a holiday
        const isHoliday = doctor.doctorData.holidays.some(holiday => {
            const holidayDate = new Date(holiday.date);
            return holidayDate.toDateString() === requestedDate.toDateString();
        });

        if (isHoliday) {
            return res.json({
                availableSlots: [],
                message: 'Doctor is on holiday on this date'
            });
        }

        // Generate time slots
        const slots = generateTimeSlots(
            dayAvailability.startTime,
            dayAvailability.endTime,
            consultationTypeData.duration
        );

        // Get existing appointments for this date
        const existingAppointments = await Appointment.find({
            doctorId: id,
            appointmentDate: {
                $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
                $lt: new Date(requestedDate.setHours(23, 59, 59, 999))
            },
            status: {$in: ['confirmed', 'in_progress']}
        });

        // Filter out booked slots
        const bookedSlots = existingAppointments.map(apt => {
            const aptDate = new Date(apt.appointmentDate);
            return aptDate.toTimeString().slice(0, 5); // HH:MM format
        });

        const availableSlots = slots.filter(slot => !bookedSlots.includes(slot.time));

        res.json({
            availableSlots,
            consultationType: consultationTypeData,
            doctor: {
                id: doctor._id,
                name: `${doctor.profile.firstName} ${doctor.profile.lastName}`,
                specialization: doctor.doctorData.specialization
            }
        });
    } catch (error) {
        console.error('Get available slots error:', error);
        res.status(500).json({
            message: 'Failed to fetch available slots',
            error: error.message
        });
    }
});

// Helper function to generate time slots
function generateTimeSlots(startTime, endTime, duration) {
    const slots = [];
    const start = parseTime(startTime);
    const end = parseTime(endTime);

    let current = start;
    while (current < end) {
        const slotEnd = new Date(current.getTime() + duration * 60000);
        if (slotEnd <= end) {
            slots.push({
                time: formatTime(current),
                endTime: formatTime(slotEnd),
                duration: duration
            });
        }
        current = slotEnd;
    }

    return slots;
}

// Helper function to parse time string (HH:MM) to Date object
function parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
}

// Helper function to format Date object to time string (HH:MM)
function formatTime(date) {
    return date.toTimeString().slice(0, 5);
}

module.exports = router;
