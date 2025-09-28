const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const {OldPatient, OldDoctor} = require('./old_models');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Report = require('../models/Report');
const Review = require('../models/Review');
const EmergencyRequest = require('../models/EmergencyRequest');
const Notification = require('../models/Notification');

// Load environment variables
const DB_URI = process.env.MONGODB_URI || process.env.MONGODB_LOCAL_URI || 'mongodb://localhost:27017/healthcare';

async function migrateData() {
    try {
        console.log('Starting user data migration...');

        // Connect to database
        await mongoose.connect(DB_URI);
        console.log('Connected to database');

        // Fetch all old patient records
        const oldPatients = await OldPatient.find({}).populate('userId');
        console.log(`Found ${oldPatients.length} patient records to migrate`);

        // Migrate patient data
        for (const oldPatient of oldPatients) {
            if (oldPatient.userId) {
                // Update the existing user document with patient data
                const updatedUser = await User.findByIdAndUpdate(
                    oldPatient.userId._id,
                    {
                        $set: {
                            patientData: {
                                patientId: oldPatient.patientId,
                                emergencyContact: oldPatient.emergencyContact,
                                medicalHistory: oldPatient.medicalHistory,
                                allergies: oldPatient.allergies,
                                medications: oldPatient.medications,
                                insurance: oldPatient.insurance,
                                preferences: oldPatient.preferences
                            }
                        }
                    },
                    {new: true}
                );

                if (updatedUser) {
                    console.log(`Migrated patient data for user: ${updatedUser.email}`);
                }
            }
        }

        // Fetch all old doctor records
        const oldDoctors = await OldDoctor.find({}).populate('userId');
        console.log(`Found ${oldDoctors.length} doctor records to migrate`);

        // Migrate doctor data
        for (const oldDoctor of oldDoctors) {
            if (oldDoctor.userId) {
                // Update the existing user document with doctor data
                const updatedUser = await User.findByIdAndUpdate(
                    oldDoctor.userId._id,
                    {
                        $set: {
                            doctorData: {
                                doctorId: oldDoctor.doctorId,
                                licenseNumber: oldDoctor.licenseNumber,
                                specialization: oldDoctor.specialization,
                                qualifications: oldDoctor.qualifications,
                                experience: oldDoctor.experience,
                                consultationFee: oldDoctor.consultationFee,
                                bio: oldDoctor.bio,
                                languages: oldDoctor.languages,
                                availability: oldDoctor.availability,
                                holidays: oldDoctor.holidays,
                                rating: oldDoctor.rating,
                                isVerified: oldDoctor.isVerified,
                                verificationDocuments: oldDoctor.verificationDocuments,
                                consultationTypes: oldDoctor.consultationTypes
                            }
                        }
                    },
                    {new: true}
                );

                if (updatedUser) {
                    console.log(`Migrated doctor data for user: ${updatedUser.email}`);
                }
            }
        }

        console.log('Data migration completed successfully!');

        // Verify the migration by checking some records
        const migratedPatients = await User.countDocuments({
            role: 'patient',
            'patientData.patientId': {$exists: true, $ne: null}
        });
        const migratedDoctors = await User.countDocuments({
            role: 'doctor',
            'doctorData.doctorId': {$exists: true, $ne: null}
        });

        console.log(`Verification: ${migratedPatients} patients and ${migratedDoctors} doctors have been successfully migrated.`);

        // Close the connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Migration failed:', error);

        // Close the connection in case of error
        await mongoose.connection.close();
        console.log('Database connection closed');

        process.exit(1);
    }
}

// Call the migration function
migrateData();