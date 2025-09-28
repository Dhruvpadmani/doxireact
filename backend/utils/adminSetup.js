const User = require('../models/User');

/**
 * Admin Setup Utility
 * Creates the default admin user from environment variables on server startup
 */
async function setupAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      return existingAdmin;
    }

    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@doxi.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
    const adminLastName = process.env.ADMIN_LAST_NAME || 'User';
    const adminPhone = process.env.ADMIN_PHONE || '1234567890';

    // Create admin user
    const adminUser = new User({
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      profile: {
        firstName: adminFirstName,
        lastName: adminLastName,
        phone: adminPhone,
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male'
      }
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('⚠️  Please change the default password after first login!');

    return adminUser;
  } catch (error) {
    console.error('❌ Error setting up admin user:', error.message);
    throw error;
  }
}

module.exports = { setupAdminUser };
