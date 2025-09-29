const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 30,
    required: true
  },
  type: {
    type: String,
    enum: ['in_person', 'video', 'phone'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  reason: {
    type: String,
    required: true
  },
  symptoms: [{
    type: String
  }],
  notes: {
    type: String
  },
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  payment: {
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'online', 'insurance']
    },
    transactionId: String,
    paidAt: Date
  },
  meetingLink: {
    type: String
  },
  meetingPassword: {
    type: String
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push']
    },
    sentAt: Date,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed']
    }
  }],
  cancellation: {
    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', 'admin']
    },
    reason: String,
    cancelledAt: Date,
    refundAmount: Number
  }
}, {
  timestamps: true
});

// Generate appointment ID before validation
appointmentSchema.pre('validate', async function(next) {
  if (!this.appointmentId) {  // Only generate if not already set
    let count = await mongoose.model('Appointment').countDocuments();
    this.appointmentId = `APT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Generate appointment ID before saving as backup
appointmentSchema.pre('save', async function(next) {
  if (!this.appointmentId) {  // Only generate if not already set
    let count = await mongoose.model('Appointment').countDocuments();
    this.appointmentId = `APT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Index for efficient queries
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
