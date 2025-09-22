const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['appointment', 'prescription', 'report', 'payment', 'reminder', 'system', 'emergency'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  data: {
    appointmentId: mongoose.Schema.Types.ObjectId,
    prescriptionId: mongoose.Schema.Types.ObjectId,
    reportId: mongoose.Schema.Types.ObjectId,
    doctorId: mongoose.Schema.Types.ObjectId,
    patientId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    date: Date,
    url: String
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  channels: [{
    type: {
      type: String,
      enum: ['in_app', 'email', 'sms', 'push'],
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date,
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed']
    }
  }],
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, priority: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Send notification through specified channels
notificationSchema.methods.send = async function() {
  // This would integrate with email, SMS, and push notification services
  // For now, we'll just mark as sent
  this.channels.forEach(channel => {
    if (!channel.sent) {
      channel.sent = true;
      channel.sentAt = new Date();
      channel.status = 'sent';
    }
  });
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
