const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: {
    type: String,
    unique: true,
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
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
  medications: [{
    name: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    instructions: String,
    quantity: Number,
    unit: {
      type: String,
      enum: ['tablets', 'capsules', 'ml', 'mg', 'g', 'units']
    }
  }],
  diagnosis: {
    primary: {
      type: String,
      required: true
    },
    secondary: [String]
  },
  symptoms: [String],
  vitalSigns: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    oxygenSaturation: Number
  },
  notes: String,
  followUpInstructions: String,
  followUpDate: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  pharmacy: {
    name: String,
    address: String,
    phone: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^\d{10}$/.test(v);
        },
        message: 'Phone number must be exactly 10 digits'
      }
    }
  },
  refills: {
    allowed: {
      type: Number,
      default: 0
    },
    used: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Generate prescription ID before saving
prescriptionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Prescription').countDocuments();
    this.prescriptionId = `PRES${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
