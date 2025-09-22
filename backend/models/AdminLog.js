const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user_created', 'user_updated', 'user_deleted', 'user_activated', 'user_deactivated',
      'doctor_verified', 'doctor_unverified', 'doctor_suspended',
      'appointment_created', 'appointment_updated', 'appointment_cancelled',
      'prescription_created', 'prescription_updated',
      'report_created', 'report_updated', 'report_deleted',
      'review_approved', 'review_rejected', 'review_flagged',
      'notification_sent', 'notification_updated',
      'emergency_handled', 'emergency_escalated',
      'system_settings_updated', 'backup_created', 'backup_restored',
      'login', 'logout', 'password_changed'
    ]
  },
  targetType: {
    type: String,
    enum: ['user', 'doctor', 'patient', 'appointment', 'prescription', 'report', 'review', 'notification', 'system']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    changes: [String]
  },
  ipAddress: String,
  userAgent: String,
  location: {
    country: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'partial'],
    default: 'success'
  },
  errorMessage: String,
  sessionId: String
}, {
  timestamps: true
});

// Index for efficient queries
adminLogSchema.index({ adminId: 1, createdAt: -1 });
adminLogSchema.index({ action: 1, createdAt: -1 });
adminLogSchema.index({ targetType: 1, targetId: 1 });
adminLogSchema.index({ severity: 1, status: 1 });

// Static method to log admin actions
adminLogSchema.statics.logAction = async function(adminId, action, options = {}) {
  const log = new this({
    adminId,
    action,
    targetType: options.targetType,
    targetId: options.targetId,
    details: options.details,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    location: options.location,
    severity: options.severity || 'medium',
    status: options.status || 'success',
    errorMessage: options.errorMessage,
    sessionId: options.sessionId
  });
  
  return await log.save();
};

module.exports = mongoose.model('AdminLog', adminLogSchema);
