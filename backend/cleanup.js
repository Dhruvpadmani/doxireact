const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const Prescription = require('./models/Prescription');
const Review = require('./models/Review');
const Notification = require('./models/Notification');
const Report = require('./models/Report');
const AdminLog = require('./models/AdminLog');
const EmergencyRequest = require('./models/EmergencyRequest');

async function cleanupDatabase() {
  try {
    // Connect to MongoDB
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/doxi';
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB');

    console.log('Starting database cleanup...');

    // 1. Remove orphaned doctors (doctors without valid users)
    const doctorUsers = await Doctor.distinct('userId');
    const validUsers = await User.find({ _id: { $in: doctorUsers } }).distinct('_id');
    const orphanedDoctorUserIds = doctorUsers.filter(id => !validUsers.includes(id.toString()));
    
    if (orphanedDoctorUserIds.length > 0) {
      const deletedDoctors = await Doctor.deleteMany({ userId: { $in: orphanedDoctorUserIds } });
      console.log(`Removed ${deletedDoctors.deletedCount} orphaned doctor records`);
    } else {
      console.log('No orphaned doctors found');
    }

    // 2. Remove orphaned patients (patients without valid users)
    const patientUsers = await Patient.distinct('userId');
    const validPatientUsers = await User.find({ _id: { $in: patientUsers } }).distinct('_id');
    const orphanedPatientUserIds = patientUsers.filter(id => !validPatientUsers.includes(id.toString()));
    
    if (orphanedPatientUserIds.length > 0) {
      const deletedPatients = await Patient.deleteMany({ userId: { $in: orphanedPatientUserIds } });
      console.log(`Removed ${deletedPatients.deletedCount} orphaned patient records`);
    } else {
      console.log('No orphaned patients found');
    }

    // 3. Remove orphaned appointments (appointments without valid patients or doctors)
    const appointmentPatientIds = await Appointment.distinct('patientId');
    const appointmentDoctorIds = await Appointment.distinct('doctorId');
    
    const validPatients = await Patient.find({ _id: { $in: appointmentPatientIds } }).distinct('_id');
    const validDoctors = await Doctor.find({ _id: { $in: appointmentDoctorIds } }).distinct('_id');
    
    const orphanedPatientIds = appointmentPatientIds.filter(id => !validPatients.includes(id.toString()));
    const orphanedDoctorIds = appointmentDoctorIds.filter(id => !validDoctors.includes(id.toString()));
    
    let totalOrphanedAppointments = 0;
    if (orphanedPatientIds.length > 0) {
      const result = await Appointment.deleteMany({ patientId: { $in: orphanedPatientIds } });
      totalOrphanedAppointments += result.deletedCount;
    }
    if (orphanedDoctorIds.length > 0) {
      const result = await Appointment.deleteMany({ doctorId: { $in: orphanedDoctorIds } });
      totalOrphanedAppointments += result.deletedCount;
    }
    
    if (totalOrphanedAppointments > 0) {
      console.log(`Removed ${totalOrphanedAppointments} orphaned appointments`);
    } else {
      console.log('No orphaned appointments found');
    }

    // 4. Remove orphaned prescriptions (prescriptions without valid appointments, patients, or doctors)
    const prescriptionAppointmentIds = await Prescription.distinct('appointmentId');
    const prescriptionPatientIds = await Prescription.distinct('patientId');
    const prescriptionDoctorIds = await Prescription.distinct('doctorId');
    
    const validAppointments = await Appointment.find({ _id: { $in: prescriptionAppointmentIds } }).distinct('_id');
    const validPrescPatients = await Patient.find({ _id: { $in: prescriptionPatientIds } }).distinct('_id');
    const validPrescDoctors = await Doctor.find({ _id: { $in: prescriptionDoctorIds } }).distinct('_id');
    
    const orphanedAppointmentIds = prescriptionAppointmentIds.filter(id => !validAppointments.includes(id.toString()));
    const orphanedPrescPatientIds = prescriptionPatientIds.filter(id => !validPrescPatients.includes(id.toString()));
    const orphanedPrescDoctorIds = prescriptionDoctorIds.filter(id => !validPrescDoctors.includes(id.toString()));
    
    let totalOrphanedPrescriptions = 0;
    if (orphanedAppointmentIds.length > 0) {
      const result = await Prescription.deleteMany({ appointmentId: { $in: orphanedAppointmentIds } });
      totalOrphanedPrescriptions += result.deletedCount;
    }
    if (orphanedPrescPatientIds.length > 0) {
      const result = await Prescription.deleteMany({ patientId: { $in: orphanedPrescPatientIds } });
      totalOrphanedPrescriptions += result.deletedCount;
    }
    if (orphanedPrescDoctorIds.length > 0) {
      const result = await Prescription.deleteMany({ doctorId: { $in: orphanedPrescDoctorIds } });
      totalOrphanedPrescriptions += result.deletedCount;
    }
    
    if (totalOrphanedPrescriptions > 0) {
      console.log(`Removed ${totalOrphanedPrescriptions} orphaned prescriptions`);
    } else {
      console.log('No orphaned prescriptions found');
    }

    // 5. Remove orphaned reviews (reviews without valid patients, doctors, or appointments)
    const reviewPatientIds = await Review.distinct('patientId');
    const reviewDoctorIds = await Review.distinct('doctorId');
    const reviewAppointmentIds = await Review.distinct('appointmentId');
    
    const validReviewPatients = await Patient.find({ _id: { $in: reviewPatientIds } }).distinct('_id');
    const validReviewDoctors = await Doctor.find({ _id: { $in: reviewDoctorIds } }).distinct('_id');
    const validReviewAppointments = await Appointment.find({ _id: { $in: reviewAppointmentIds } }).distinct('_id');
    
    const orphanedReviewPatientIds = reviewPatientIds.filter(id => !validReviewPatients.includes(id.toString()));
    const orphanedReviewDoctorIds = reviewDoctorIds.filter(id => !validReviewDoctors.includes(id.toString()));
    const orphanedReviewAppointmentIds = reviewAppointmentIds.filter(id => !validReviewAppointments.includes(id.toString()));
    
    let totalOrphanedReviews = 0;
    if (orphanedReviewPatientIds.length > 0) {
      const result = await Review.deleteMany({ patientId: { $in: orphanedReviewPatientIds } });
      totalOrphanedReviews += result.deletedCount;
    }
    if (orphanedReviewDoctorIds.length > 0) {
      const result = await Review.deleteMany({ doctorId: { $in: orphanedReviewDoctorIds } });
      totalOrphanedReviews += result.deletedCount;
    }
    if (orphanedReviewAppointmentIds.length > 0) {
      const result = await Review.deleteMany({ appointmentId: { $in: orphanedReviewAppointmentIds } });
      totalOrphanedReviews += result.deletedCount;
    }
    
    if (totalOrphanedReviews > 0) {
      console.log(`Removed ${totalOrphanedReviews} orphaned reviews`);
    } else {
      console.log('No orphaned reviews found');
    }

    // 6. Remove orphaned reports (reports without valid patients or doctors)
    const reportPatientIds = await Report.distinct('patientId');
    const reportDoctorIds = await Report.distinct('doctorId');
    const reportAppointmentIds = await Report.distinct('appointmentId');
    
    const validReportPatients = await Patient.find({ _id: { $in: reportPatientIds } }).distinct('_id');
    const validReportDoctors = await Doctor.find({ _id: { $in: reportDoctorIds } }).distinct('_id');
    const validReportAppointments = await Appointment.find({ _id: { $in: reportAppointmentIds } }).distinct('_id');
    
    const orphanedReportPatientIds = reportPatientIds.filter(id => !validReportPatients.includes(id.toString()));
    const orphanedReportDoctorIds = reportDoctorIds.filter(id => !validReportDoctors.includes(id.toString()));
    const orphanedReportAppointmentIds = reportAppointmentIds.filter(id => !validReportAppointments.includes(id.toString()));
    
    let totalOrphanedReports = 0;
    if (orphanedReportPatientIds.length > 0) {
      const result = await Report.deleteMany({ patientId: { $in: orphanedReportPatientIds } });
      totalOrphanedReports += result.deletedCount;
    }
    if (orphanedReportDoctorIds.length > 0) {
      const result = await Report.deleteMany({ doctorId: { $in: orphanedReportDoctorIds } });
      totalOrphanedReports += result.deletedCount;
    }
    if (orphanedReportAppointmentIds.length > 0) {
      const result = await Report.deleteMany({ appointmentId: { $in: orphanedReportAppointmentIds } });
      totalOrphanedReports += result.deletedCount;
    }
    
    if (totalOrphanedReports > 0) {
      console.log(`Removed ${totalOrphanedReports} orphaned reports`);
    } else {
      console.log('No orphaned reports found');
    }

    // 7. Remove orphaned emergency requests (requests without valid patients)
    const emergencyPatientIds = await EmergencyRequest.distinct('patientId');
    const validEmergencyPatients = await Patient.find({ _id: { $in: emergencyPatientIds } }).distinct('_id');
    const orphanedEmergencyPatientIds = emergencyPatientIds.filter(id => !validEmergencyPatients.includes(id.toString()));
    
    if (orphanedEmergencyPatientIds.length > 0) {
      const deletedEmergencies = await EmergencyRequest.deleteMany({ patientId: { $in: orphanedEmergencyPatientIds } });
      console.log(`Removed ${deletedEmergencies.deletedCount} orphaned emergency requests`);
    } else {
      console.log('No orphaned emergency requests found');
    }

    // 8. Remove orphaned notifications (notifications without valid users)
    const notificationUserIds = await Notification.distinct('userId');
    const validNotificationUsers = await User.find({ _id: { $in: notificationUserIds } }).distinct('_id');
    const orphanedNotificationUserIds = notificationUserIds.filter(id => !validNotificationUsers.includes(id.toString()));
    
    if (orphanedNotificationUserIds.length > 0) {
      const deletedNotifications = await Notification.deleteMany({ userId: { $in: orphanedNotificationUserIds } });
      console.log(`Removed ${deletedNotifications.deletedCount} orphaned notifications`);
    } else {
      console.log('No orphaned notifications found');
    }

    // 9. Clean up old/unused admin logs (optional, keep for some period)
    // Uncomment the following lines if you want to remove admin logs older than 6 months
    /*
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const oldLogsResult = await AdminLog.deleteMany({ 
      createdAt: { $lt: sixMonthsAgo },
      action: { $in: ['login', 'logout', 'user_updated'] } // Non-critical actions
    });
    console.log(`Removed ${oldLogsResult.deletedCount} old admin logs`);
    */

    console.log('Database cleanup completed successfully!');
  } catch (error) {
    console.error('Error during database cleanup:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the cleanup function if this script is executed directly
if (require.main === module) {
  cleanupDatabase();
}

module.exports = cleanupDatabase;