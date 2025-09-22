const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    maxlength: 100
  },
  comment: {
    type: String,
    maxlength: 1000
  },
  aspects: {
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    treatment: {
      type: Number,
      min: 1,
      max: 5
    },
    environment: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  doctorResponse: {
    response: String,
    respondedAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  flaggedReason: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date
}, {
  timestamps: true
});

// Ensure one review per appointment
reviewSchema.index({ appointmentId: 1 }, { unique: true });

// Update doctor rating when review is saved
reviewSchema.post('save', async function() {
  if (this.status === 'approved') {
    const Doctor = mongoose.model('Doctor');
    await Doctor.findById(this.doctorId).then(doctor => {
      if (doctor) {
        doctor.updateRating();
      }
    });
  }
});

// Update doctor rating when review is deleted
reviewSchema.post('deleteOne', { document: true, query: false }, async function() {
  const Doctor = mongoose.model('Doctor');
  await Doctor.findById(this.doctorId).then(doctor => {
    if (doctor) {
      doctor.updateRating();
    }
  });
});

module.exports = mongoose.model('Review', reviewSchema);
