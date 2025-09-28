// Temporary old models for migration purposes
const mongoose = require('mongoose');

// Old Patient Model (before changes)
const oldPatientSchema = new mongoose.Schema({
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
                validator: function (v) {
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
oldPatientSchema.pre('validate', async function (next) {
    if (!this.patientId) {  // Only generate if not already set
        let count = await mongoose.model('Patient').countDocuments();
        this.patientId = `PAT${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

// Generate patient ID before saving as backup
oldPatientSchema.pre('save', async function (next) {
    if (!this.patientId) {  // Only generate if not already set
        let count = await mongoose.model('Patient').countDocuments();
        this.patientId = `PAT${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

// Old Doctor Model (before changes)
const oldDoctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    doctorId: {
        type: String,
        unique: true,
        required: true
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    specialization: {
        type: String,
        required: true
    },
    qualifications: [{
        degree: {
            type: String,
            required: true
        },
        institution: {
            type: String,
            required: true
        },
        year: {
            type: Number,
            required: true
        }
    }],
    experience: {
        type: Number,
        required: true,
        min: 0
    },
    consultationFee: {
        type: Number,
        required: true,
        min: 0
    },
    bio: {
        type: String,
        maxlength: 1000
    },
    languages: [{
        type: String
    }],
    availability: [{
        dayOfWeek: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            required: true
        },
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        },
        isAvailable: {
            type: Boolean,
            default: true
        }
    }],
    holidays: [{
        date: {
            type: Date,
            required: true
        },
        reason: String,
        isRecurring: {
            type: Boolean,
            default: false
        }
    }],
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationDocuments: [{
        type: {
            type: String,
            enum: ['license', 'degree', 'id_proof', 'other']
        },
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    consultationTypes: [{
        type: {
            type: String,
            enum: ['in_person', 'video', 'phone'],
            required: true
        },
        fee: {
            type: Number,
            required: true
        },
        duration: {
            type: Number,
            required: true,
            default: 30
        }
    }]
}, {
    timestamps: true
});

// Generate doctor ID before saving
oldDoctorSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.model('Doctor').countDocuments();
        this.doctorId = `DOC${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

module.exports = {
    OldPatient: mongoose.model('OldPatient', oldPatientSchema, 'patients'), // Use the original collection name
    OldDoctor: mongoose.model('OldDoctor', oldDoctorSchema, 'doctors')     // Use the original collection name
};