const mongoose = require('mongoose');

const emergencyRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['medical_emergency', 'urgent_appointment', 'prescription_urgent', 'report_urgent'],
    required: true
  },
  priority: {
    type: String,
    enum: ['high', 'critical'],
    default: 'high'
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  symptoms: [String],
  location: {
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  contactInfo: {
    phone: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^\d{10}$/.test(v);
        },
        message: 'Phone number must be exactly 10 digits'
      }
    },
    alternatePhone: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^\d{10}$/.test(v);
        },
        message: 'Phone number must be exactly 10 digits'
      }
    },
    emergencyContact: String
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'resolved', 'cancelled'],
    default: 'pending'
  },
  assignedTo: {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: Date,
    responseTime: Number // in minutes
  },
  response: {
    message: String,
    action: String,
    followUpRequired: Boolean,
    followUpDate: Date,
    respondedAt: Date
  },
  escalation: {
    escalated: {
      type: Boolean,
      default: false
    },
    escalatedAt: Date,
    escalatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String
  },
  resolution: {
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolution: String,
    outcome: {
      type: String,
      enum: ['successful', 'partial', 'unsuccessful']
    }
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  }
}, {
  timestamps: true
});

// Generate request ID before saving
emergencyRequestSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('EmergencyRequest').countDocuments();
    this.requestId = `EMR${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for efficient queries
emergencyRequestSchema.index({ status: 1, priority: 1, createdAt: -1 });
emergencyRequestSchema.index({ patientId: 1, createdAt: -1 });

// Calculate response time
emergencyRequestSchema.methods.calculateResponseTime = function() {
  if (this.assignedTo.assignedAt) {
    const responseTime = Math.round((this.assignedTo.assignedAt - this.createdAt) / (1000 * 60));
    this.assignedTo.responseTime = responseTime;
    return responseTime;
  }
  return null;
};

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema);
