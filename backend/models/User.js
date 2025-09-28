const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
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
  notifications: [{
    type: {
      type: String,
      enum: ['appointment', 'prescription', 'report', 'general'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
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
        this.doctorData.rating.average = Math.round(stats[0].averageRating * 10) / 10;
        this.doctorData.rating.count = stats[0].totalReviews;
    } else {
        this.doctorData.rating.average = 0;
        this.doctorData.rating.count = 0;
    }

    await this.save();
};

// Generate patient/doctor ID before saving
userSchema.pre('validate', async function (next) {
    if (this.isNew) {
        if (this.role === 'patient' && !this.patientData.patientId) {
            const count = await mongoose.model('User').countDocuments({role: 'patient'});
            this.patientData.patientId = `PAT${String(count + 1).padStart(6, '0')}`;
        } else if (this.role === 'doctor' && !this.doctorData.doctorId) {
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
