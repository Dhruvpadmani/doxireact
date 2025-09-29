const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Authentication & Identification
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'patient'],
    required: true
  },

    // Common profile fields
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'First name must be at most 50 characters']
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Last name must be at most 50 characters']
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^\d{10}$/.test(v);
        },
        message: 'Phone number must be exactly 10 digits'
      }
    },
    avatar: {
      type: String,
      default: ''
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },

    // Role-based subdocuments (only populate relevant subdocument based on role)
    patientData: {
        patientId: {
      type: String,
            unique: true,
            required: function () {
                return this.role === 'patient';
            }
        },
        emergencyContact: {
            name: String,
            relationship: String,
            phone: String
    },
        medicalHistory: [{
            condition: String,
            diagnosisDate: Date,
            status: {type: String, enum: ['active', 'resolved', 'chronic'], default: 'active'},
            notes: String
        }],
        allergies: [{
            allergen: String,
            severity: {type: String, enum: ['mild', 'moderate', 'severe']},
            reaction: String
        }],
        medications: [{
            name: String,
            dosage: String,
            frequency: String,
            startDate: Date,
            endDate: Date,
            prescribedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
        }],
        insurance: {
            provider: String,
            policyNumber: String,
            groupNumber: String,
            expiryDate: Date
        },
        preferences: {
            preferredLanguage: {type: String, default: 'en'},
            communicationMethod: {type: String, enum: ['email', 'sms', 'phone'], default: 'email'},
            reminderSettings: {
                appointmentReminders: {type: Boolean, default: true},
                medicationReminders: {type: Boolean, default: true}
            }
        }
    },

    doctorData: {
        doctorId: {
      type: String,
            unique: true,
            required: function () {
                return this.role === 'doctor';
            }
    },
        licenseNumber: String,
        specialization: String,
        qualifications: [{
            degree: String,
            institution: String,
            year: Number
        }],
        experience: {type: Number, min: 0},
        consultationFee: {type: Number, min: 0},
        bio: {type: String, maxlength: 1000},
        languages: [String],
        availability: [{
            dayOfWeek: {
                type: String,
                enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            startTime: String,
            endTime: String,
            isAvailable: {type: Boolean, default: true}
        }],
        holidays: [{
            date: Date,
            reason: String,
            isRecurring: {type: Boolean, default: false}
        }],
        rating: {
            average: {type: Number, default: 0, min: 0, max: 5},
            count: {type: Number, default: 0}
    },
        isVerified: {type: Boolean, default: false},
        verificationDocuments: [{
            type: {type: String, enum: ['license', 'degree', 'id_proof', 'other']},
            url: String,
            uploadedAt: {type: Date, default: Date.now}
        }],
        consultationTypes: [{
            type: {type: String, enum: ['in_person', 'video', 'phone']},
            fee: {type: Number, required: true},
            duration: {type: Number, default: 30}
        }]
    },

    // Common fields
    isActive: {type: Boolean, default: true},
    lastLogin: Date,
    notifications: [{
        type: {type: String, enum: ['appointment', 'prescription', 'report', 'general']},
        title: {type: String, required: true},
        message: {type: String, required: true},
        isRead: {type: Boolean, default: false},
        createdAt: {type: Date, default: Date.now}
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Calculate average doctor rating
userSchema.methods.updateDoctorRating = async function () {
    const Review = mongoose.model('Review');
    const stats = await Review.aggregate([
        {$match: {doctorId: this._id, status: 'approved'}},
        {
            $group: {
                _id: null,
                averageRating: {$avg: '$rating'},
                totalReviews: {$sum: 1}
            }
        }
    ]);

    if (stats.length > 0) {
        if (!this.doctorData) this.doctorData = {};
        if (!this.doctorData.rating) this.doctorData.rating = {};
        
        this.doctorData.rating.average = Math.round(stats[0].averageRating * 10) / 10;
        this.doctorData.rating.count = stats[0].totalReviews;
    } else {
        if (!this.doctorData) this.doctorData = {};
        if (!this.doctorData.rating) this.doctorData.rating = {};
        
        this.doctorData.rating.average = 0;
        this.doctorData.rating.count = 0;
    }

    await this.save();
};

// Generate patient/doctor ID before saving
userSchema.pre('validate', async function (next) {
    if (this.isNew) {
        if (this.role === 'patient' && (!this.patientData || !this.patientData.patientId)) {
            // Initialize patientData if it doesn't exist
            if (!this.patientData) {
                this.patientData = {};
            }
            const count = await mongoose.model('User').countDocuments({role: 'patient'});
            this.patientData.patientId = `PAT${String(count + 1).padStart(6, '0')}`;
        } else if (this.role === 'doctor' && (!this.doctorData || !this.doctorData.doctorId)) {
            // Initialize doctorData if it doesn't exist
            if (!this.doctorData) {
                this.doctorData = {};
            }
            const count = await mongoose.model('User').countDocuments({role: 'doctor'});
            this.doctorData.doctorId = `DOC${String(count + 1).padStart(6, '0')}`;
        }
    }
    next();
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
