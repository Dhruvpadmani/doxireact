const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  patientId: {
    type: String,
    unique: true,
    required: true
  },
  emergencyContact: {
    name: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^\d{10}$/.test(v?.toString().trim());
        },
        message: 'Phone number must be exactly 10 digits'
      }
    }
  },
  medicalHistory: [{
    condition: {
      type: String,
      required: true
    },
    diagnosisDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'chronic'],
      default: 'active'
    },
    notes: String
  }],
  allergies: [{
    allergen: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      required: true
    },
    reaction: String
  }],
  medications: [{
    name: {
      type: String,
      required: true
    },
    dosage: String,
    frequency: String,
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    }
  }],
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    expiryDate: Date
  },
  preferences: {
    preferredLanguage: {
      type: String,
      default: 'en'
    },
    communicationMethod: {
      type: String,
      enum: ['email', 'sms', 'phone'],
      default: 'email'
    },
    reminderSettings: {
      appointmentReminders: {
        type: Boolean,
        default: true
      },
      medicationReminders: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true
});

// Generate patient ID before validation
patientSchema.pre('validate', async function(next) {
  if (!this.patientId) {  // Only generate if not already set
    let count = await mongoose.model('Patient').countDocuments();
    this.patientId = `PAT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Generate patient ID before saving as backup
patientSchema.pre('save', async function(next) {
  if (!this.patientId) {  // Only generate if not already set
    let count = await mongoose.model('Patient').countDocuments();
    this.patientId = `PAT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
