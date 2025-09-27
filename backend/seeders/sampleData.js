const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');

// Admin user data
const adminUser = {
  email: 'admin@doxi.com',
  password: 'admin123',
  role: 'admin',
  profile: {
    firstName: 'Admin',
    lastName: 'User',
    phone: '1234567890',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'male'
  }
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doxi');
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin user
    const user = new User(adminUser);
    await user.save();
    console.log(`Created admin user: ${user.email}`);

    console.log('\n✅ Admin account created successfully!');
    console.log('\nAdmin credentials:');
    console.log('Email: admin@doxi.com');
    console.log('Password: admin123');
    console.log('\nYou can now login to the admin panel!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;