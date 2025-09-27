// Admin Account Setup Helper
// This script will help you set up an admin account directly in localStorage

function createAdminAccount() {
  // Define the admin user object
  const adminUser = {
    id: 'admin-user-1',
    email: 'admin@doxi.com',
    role: 'admin',
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      dateOfBirth: '1990-01-01T00:00:00.000Z',
      gender: 'male'
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };

  // Generate a fake token (for demo purposes)
  const token = 'demo-admin-token-' + Date.now();

  // Save to localStorage
  localStorage.setItem('user', JSON.stringify(adminUser));
  localStorage.setItem('token', token);

  // Create a demo account record for future logins
  const demoAccounts = JSON.parse(localStorage.getItem('demoAccounts') || '[]');
  const existingAdmin = demoAccounts.find(account => account.email === 'admin@doxi.com');
  
  if (!existingAdmin) {
    demoAccounts.push({
      ...adminUser,
      password: 'admin123'
    });
    localStorage.setItem('demoAccounts', JSON.stringify(demoAccounts));
  }

  console.log('Admin account created successfully!');
  console.log('Email: admin@doxi.com');
  console.log('Password: admin123');
  console.log('Role: admin');
  
  alert('Admin account created successfully!\n\nEmail: admin@doxi.com\nPassword: admin123\n\nYou can now refresh the page and login.');
}

// Check if running in browser environment
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  // Add a button to the page for easy access
  const buttonExists = document.getElementById('admin-setup-btn');
  if (!buttonExists) {
    const button = document.createElement('button');
    button.id = 'admin-setup-btn';
    button.textContent = 'Setup Admin Account';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.padding = '10px 15px';
    button.style.backgroundColor = '#7e22ce';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '14px';
    button.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    
    button.addEventListener('click', createAdminAccount);
    document.body.appendChild(button);
  }
  
  // Also make the function available in the console
  window.createAdminAccount = createAdminAccount;
  
  console.log('Admin account setup helper loaded. You can run createAdminAccount() in the console or click the button in the bottom right corner.');
} else {
  console.log('This script must be run in a browser environment');
}