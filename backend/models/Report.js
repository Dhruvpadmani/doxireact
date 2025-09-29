const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportId: {
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
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  type: {
    type: String,
    enum: ['lab', 'imaging', 'pathology', 'radiology', 'blood_test', 'urine_test', 'xray', 'mri', 'ct_scan', 'ultrasound', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  testDate: {
    type: Date,
    required: true
  },
  reportDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  results: [{
    testName: {
      type: String,
      required: true
    },
    value: String,
    unit: String,
    normalRange: String,
    status: {
      type: String,
      enum: ['normal', 'abnormal', 'critical'],
      default: 'normal'
    },
    notes: String
  }],
  files: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  labTechnician: {
    name: String,
    license: String
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  recommendations: String,
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  isShared: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    accessLevel: {
      type: String,
      enum: ['view', 'download'],
      default: 'view'
    }
  }],
  accessLogs: [{
    accessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    accessedAt: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      enum: ['viewed', 'downloaded', 'shared']
    }
  }]
}, {
  timestamps: true
});

// Generate report ID before saving
reportSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Report').countDocuments();
    this.reportId = `RPT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Log access when report is accessed
reportSchema.methods.logAccess = function(userId, action) {
  this.accessLogs.push({
    accessedBy: userId,
    action: action
  });
  return this.save();
};

module.exports = mongoose.model('Report', reportSchema);
