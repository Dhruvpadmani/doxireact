const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    category: {
        type: String,
        required: true,
        enum: ['general', 'appointments', 'email', 'system', 'backup', 'api', 'security', 'notifications', 'users', 'reports'],
        default: 'general'
    },
    value: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['string', 'number', 'boolean', 'password', 'select', 'json'],
        default: 'string'
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    isRequired: {
        type: Boolean,
        default: false
    },
    isEncrypted: {
        type: Boolean,
        default: false
    },
    defaultValue: {
        type: String,
        default: ''
    },
    validation: {
        type: String,
        default: ''
    },
    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'deprecated'],
        default: 'active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

// Index for efficient querying
settingsSchema.index({category: 1, status: 1});
settingsSchema.index({name: 1});

// Virtual for formatted value based on type
settingsSchema.virtual('formattedValue').get(function () {
    if (this.type === 'number') {
        return parseFloat(this.value) || 0;
    } else if (this.type === 'boolean') {
        return this.value === 'true';
    } else if (this.type === 'json') {
        try {
            return JSON.parse(this.value);
        } catch (error) {
            return this.value;
        }
    }
    return this.value;
});

// Pre-save middleware to encrypt password values
settingsSchema.pre('save', function (next) {
    if (this.isEncrypted && this.type === 'password' && this.isModified('value')) {
        // In a real application, you would encrypt the password here
        // For now, we'll just mark it as encrypted
        this.value = `encrypted_${this.value}`;
    }
    next();
});

// Static method to get setting by name
settingsSchema.statics.getSetting = async function (name) {
    const setting = await this.findOne({name, status: 'active'});
    return setting ? setting.formattedValue : null;
};

// Static method to set setting value
settingsSchema.statics.setSetting = async function (name, value, updatedBy) {
    const setting = await this.findOne({name});
    if (setting) {
        setting.value = String(value);
        setting.updatedBy = updatedBy;
        await setting.save();
        return setting;
    }
    throw new Error(`Setting '${name}' not found`);
};

// Static method to get settings by category
settingsSchema.statics.getByCategory = async function (category) {
    return await this.find({category, status: 'active'}).sort({name: 1});
};

// Static method to get all active settings
settingsSchema.statics.getAllActive = async function () {
    return await this.find({status: 'active'}).sort({category: 1, name: 1});
};

module.exports = mongoose.model('Settings', settingsSchema);
