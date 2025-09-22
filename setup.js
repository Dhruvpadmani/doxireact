#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up DOXI - Doctor Online Appointment System\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js version: ${nodeVersion}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js v16 or higher.');
  process.exit(1);
}

// Check if MongoDB is running
try {
  execSync('mongod --version', { encoding: 'utf8' });
  console.log('✅ MongoDB is available');
} catch (error) {
  console.log('⚠️  MongoDB not found. Please make sure MongoDB is installed and running.');
}

// Install backend dependencies
console.log('\n📦 Installing backend dependencies...');
try {
  execSync('npm install', { cwd: './backend', stdio: 'inherit' });
  console.log('✅ Backend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

// Install frontend dependencies
console.log('\n📦 Installing frontend dependencies...');
try {
  execSync('npm install', { cwd: './fronted', stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

// Create environment files if they don't exist
console.log('\n⚙️  Setting up environment files...');

const backendEnvPath = './backend/.env';
const frontendEnvPath = './fronted/.env';

if (!fs.existsSync(backendEnvPath)) {
  fs.copyFileSync('./backend/env.example', backendEnvPath);
  console.log('✅ Created backend/.env file');
} else {
  console.log('ℹ️  backend/.env already exists');
}

if (!fs.existsSync(frontendEnvPath)) {
  fs.copyFileSync('./fronted/env.example', frontendEnvPath);
  console.log('✅ Created fronted/.env file');
} else {
  console.log('ℹ️  fronted/.env already exists');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Make sure MongoDB is running');
console.log('2. Update the .env files with your configuration');
console.log('3. Start the backend server: cd backend && npm run dev');
console.log('4. Start the frontend server: cd fronted && npm run dev');
console.log('5. Seed the database: cd backend && npm run seed');
console.log('\n🌐 Access the application at:');
console.log('   Frontend: http://localhost:5173');
console.log('   Backend API: http://localhost:5000');
console.log('\n👥 Sample accounts (after seeding):');
console.log('   Admin: admin@doxi.com / admin123');
console.log('   Doctor: doctor1@doxi.com / doctor123');
console.log('   Patient: patient1@doxi.com / patient123');
