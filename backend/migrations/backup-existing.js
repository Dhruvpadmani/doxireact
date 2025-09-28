const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const {OldPatient, OldDoctor} = require('./old_models');

// Load environment variables
const DB_URI = process.env.MONGODB_URI || process.env.MONGODB_LOCAL_URI || 'mongodb://localhost:27017/healthcare';

async function backupData() {
    try {
        console.log('Starting data backup...');

        // Connect to database
        await mongoose.connect(DB_URI);
        console.log('Connected to database');

        // Fetch all users
        const users = await User.find({});
        console.log(`Found ${users.length} user records to backup`);

        // Create backup file with timestamp
        const fs = require('fs');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = `./backup/users_backup_${timestamp}.json`;

        fs.writeFileSync(backupFile, JSON.stringify(users, null, 2));
        console.log(`User data backed up to ${backupFile}`);

        // Fetch all old patient records
        const oldPatients = await OldPatient.find({});
        const patientBackupFile = `./backup/patients_backup_${timestamp}.json`;
        fs.writeFileSync(patientBackupFile, JSON.stringify(oldPatients, null, 2));
        console.log(`Patient data backed up to ${patientBackupFile}`);

        // Fetch all old doctor records
        const oldDoctors = await OldDoctor.find({});
        const doctorBackupFile = `./backup/doctors_backup_${timestamp}.json`;
        fs.writeFileSync(doctorBackupFile, JSON.stringify(oldDoctors, null, 2));
        console.log(`Doctor data backed up to ${doctorBackupFile}`);

        console.log('Backup completed successfully!');

        // Close the connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Backup failed:', error);

        // Close the connection in case of error
        await mongoose.connection.close();
        console.log('Database connection closed');

        process.exit(1);
    }
}

// Call the backup function
backupData();