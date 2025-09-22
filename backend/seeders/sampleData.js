const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Report = require('../models/Report');
const Review = require('../models/Review');

// Sample data
const sampleUsers = [
  {
    email: 'admin@doxi.com',
    password: 'admin123',
    role: 'admin',
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male'
    }
  },
  {
    email: 'doctor1@doxi.com',
    password: 'doctor123',
    role: 'doctor',
    profile: {
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1234567891',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'male'
    }
  },
  {
    email: 'doctor2@doxi.com',
    password: 'doctor123',
    role: 'doctor',
    profile: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1234567892',
      dateOfBirth: new Date('1988-08-20'),
      gender: 'female'
    }
  },
  {
    email: 'patient1@doxi.com',
    password: 'patient123',
    role: 'patient',
    profile: {
      firstName: 'Mike',
      lastName: 'Wilson',
      phone: '+1234567893',
      dateOfBirth: new Date('1992-03-10'),
      gender: 'male'
    }
  },
  {
    email: 'patient2@doxi.com',
    password: 'patient123',
    role: 'patient',
    profile: {
      firstName: 'Emily',
      lastName: 'Davis',
      phone: '+1234567894',
      dateOfBirth: new Date('1995-12-05'),
      gender: 'female'
    }
  },
  {
    email: 'doctor3@doxi.com',
    password: 'doctor123',
    role: 'doctor',
    profile: {
      firstName: 'Dr. Priya',
      lastName: 'Sharma',
      phone: '+1234567895',
      dateOfBirth: new Date('1987-03-12'),
      gender: 'female'
    }
  },
  {
    email: 'doctor4@doxi.com',
    password: 'doctor123',
    role: 'doctor',
    profile: {
      firstName: 'Dr. Rajesh',
      lastName: 'Kumar',
      phone: '+1234567896',
      dateOfBirth: new Date('1990-07-25'),
      gender: 'male'
    }
  },
  {
    email: 'doctor5@doxi.com',
    password: 'doctor123',
    role: 'doctor',
    profile: {
      firstName: 'Dr. Maria',
      lastName: 'Garcia',
      phone: '+1234567897',
      dateOfBirth: new Date('1982-11-08'),
      gender: 'female'
    }
  }
];

const sampleDoctors = [
  {
    licenseNumber: 'DOC123456',
    specialization: 'Cardiology',
    qualifications: [
      {
        degree: 'MD',
        institution: 'Harvard Medical School',
        year: 2010
      }
    ],
    experience: 10,
    consultationFee: 150,
    bio: 'Experienced cardiologist with expertise in heart diseases and treatments.',
    languages: ['English', 'Spanish'],
    availability: [
      {
        dayOfWeek: 'monday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'tuesday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'wednesday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'thursday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'friday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      }
    ],
    consultationTypes: [
      { type: 'in_person', fee: 150, duration: 30 },
      { type: 'video', fee: 120, duration: 30 },
      { type: 'phone', fee: 100, duration: 20 }
    ],
    isVerified: true
  },
  {
    licenseNumber: 'DOC789012',
    specialization: 'General Medicine',
    qualifications: [
      {
        degree: 'MD',
        institution: 'Johns Hopkins University',
        year: 2012
      }
    ],
    experience: 8,
    consultationFee: 120,
    bio: 'General practitioner with focus on preventive medicine and wellness.',
    languages: ['English', 'French'],
    availability: [
      {
        dayOfWeek: 'monday',
        startTime: '08:00',
        endTime: '16:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'tuesday',
        startTime: '08:00',
        endTime: '16:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'wednesday',
        startTime: '08:00',
        endTime: '16:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'thursday',
        startTime: '08:00',
        endTime: '16:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'friday',
        startTime: '08:00',
        endTime: '16:00',
        isAvailable: true
      }
    ],
    consultationTypes: [
      { type: 'in_person', fee: 120, duration: 30 },
      { type: 'video', fee: 100, duration: 30 },
      { type: 'phone', fee: 80, duration: 20 }
    ],
    isVerified: true
  },
  {
    licenseNumber: 'DOC345678',
    specialization: 'Dermatology',
    qualifications: [
      {
        degree: 'MD',
        institution: 'Stanford Medical School',
        year: 2015
      }
    ],
    experience: 6,
    consultationFee: 180,
    bio: 'Specialized in skin conditions, cosmetic dermatology, and skin cancer treatment.',
    languages: ['English', 'Hindi', 'Gujarati'],
    availability: [
      {
        dayOfWeek: 'monday',
        startTime: '10:00',
        endTime: '18:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'tuesday',
        startTime: '10:00',
        endTime: '18:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'wednesday',
        startTime: '10:00',
        endTime: '18:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'thursday',
        startTime: '10:00',
        endTime: '18:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'friday',
        startTime: '10:00',
        endTime: '18:00',
        isAvailable: true
      }
    ],
    consultationTypes: [
      { type: 'in_person', fee: 180, duration: 45 },
      { type: 'video', fee: 150, duration: 30 }
    ],
    isVerified: true
  },
  {
    licenseNumber: 'DOC901234',
    specialization: 'Pediatrics',
    qualifications: [
      {
        degree: 'MD',
        institution: 'Boston Children\'s Hospital',
        year: 2018
      }
    ],
    experience: 4,
    consultationFee: 100,
    bio: 'Pediatrician specializing in child health, development, and common childhood illnesses.',
    languages: ['English', 'Hindi', 'Tamil'],
    availability: [
      {
        dayOfWeek: 'monday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'tuesday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'wednesday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'thursday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'friday',
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'saturday',
        startTime: '09:00',
        endTime: '13:00',
        isAvailable: true
      }
    ],
    consultationTypes: [
      { type: 'in_person', fee: 100, duration: 30 },
      { type: 'video', fee: 80, duration: 30 },
      { type: 'phone', fee: 60, duration: 20 }
    ],
    isVerified: true
  },
  {
    licenseNumber: 'DOC567890',
    specialization: 'Orthopedics',
    qualifications: [
      {
        degree: 'MD',
        institution: 'Mayo Clinic',
        year: 2013
      }
    ],
    experience: 9,
    consultationFee: 200,
    bio: 'Orthopedic surgeon specializing in joint replacement, sports injuries, and bone disorders.',
    languages: ['English', 'Spanish', 'Portuguese'],
    availability: [
      {
        dayOfWeek: 'monday',
        startTime: '08:00',
        endTime: '16:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'tuesday',
        startTime: '08:00',
        endTime: '16:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'wednesday',
        startTime: '08:00',
        endTime: '16:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'thursday',
        startTime: '08:00',
        endTime: '16:00',
        isAvailable: true
      },
      {
        dayOfWeek: 'friday',
        startTime: '08:00',
        endTime: '16:00',
        isAvailable: true
      }
    ],
    consultationTypes: [
      { type: 'in_person', fee: 200, duration: 45 },
      { type: 'video', fee: 150, duration: 30 }
    ],
    isVerified: true
  }
];

const samplePatients = [
  {
    emergencyContact: {
      name: 'Jane Wilson',
      relationship: 'Spouse',
      phone: '+1234567895'
    },
    medicalHistory: [
      {
        condition: 'Hypertension',
        diagnosisDate: new Date('2020-01-15'),
        status: 'active',
        notes: 'Controlled with medication'
      }
    ],
    allergies: [
      {
        allergen: 'Penicillin',
        severity: 'moderate',
        reaction: 'Skin rash'
      }
    ],
    medications: [
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        startDate: new Date('2020-01-20')
      }
    ]
  },
  {
    emergencyContact: {
      name: 'Robert Davis',
      relationship: 'Father',
      phone: '+1234567896'
    },
    medicalHistory: [],
    allergies: [],
    medications: []
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doxi');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    await Report.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.email}`);
    }

    // Create doctors
    const createdDoctors = [];
    for (let i = 0; i < sampleDoctors.length; i++) {
      const doctorData = {
        ...sampleDoctors[i],
        userId: createdUsers[i + 1]._id // Skip admin user
      };
      const doctor = new Doctor(doctorData);
      await doctor.save();
      createdDoctors.push(doctor);
      console.log(`Created doctor: ${doctor.specialization}`);
    }

    // Create patients
    const createdPatients = [];
    for (let i = 0; i < samplePatients.length; i++) {
      const patientData = {
        ...samplePatients[i],
        userId: createdUsers[i + 6]._id // Skip admin and 5 doctors
      };
      const patient = new Patient(patientData);
      await patient.save();
      createdPatients.push(patient);
      console.log(`Created patient: ${patient.patientId}`);
    }

    // Create sample appointments
    const appointment1 = new Appointment({
      patientId: createdPatients[0]._id,
      doctorId: createdDoctors[0]._id,
      appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      appointmentTime: '10:00',
      duration: 30,
      type: 'in_person',
      status: 'scheduled',
      reason: 'Regular checkup',
      symptoms: ['Chest pain', 'Shortness of breath'],
      payment: {
        amount: 150,
        status: 'pending'
      }
    });
    await appointment1.save();
    console.log('Created appointment 1');

    const appointment2 = new Appointment({
      patientId: createdPatients[1]._id,
      doctorId: createdDoctors[1]._id,
      appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      appointmentTime: '14:00',
      duration: 30,
      type: 'video',
      status: 'scheduled',
      reason: 'Follow-up consultation',
      symptoms: ['Fever', 'Cough'],
      payment: {
        amount: 120,
        status: 'pending'
      }
    });
    await appointment2.save();
    console.log('Created appointment 2');

    // Create sample prescription
    const prescription = new Prescription({
      appointmentId: appointment1._id,
      patientId: createdPatients[0]._id,
      doctorId: createdDoctors[0]._id,
      medications: [
        {
          name: 'Amlodipine',
          dosage: '5mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take with food'
        }
      ],
      diagnosis: {
        primary: 'Hypertension',
        secondary: ['High blood pressure']
      },
      symptoms: ['Chest pain', 'Shortness of breath'],
      notes: 'Patient shows signs of hypertension. Prescribed medication and lifestyle changes recommended.',
      followUpInstructions: 'Follow up in 2 weeks to monitor blood pressure',
      followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });
    await prescription.save();
    console.log('Created prescription');

    // Create sample report
    const report = new Report({
      patientId: createdPatients[0]._id,
      doctorId: createdDoctors[0]._id,
      type: 'lab',
      title: 'Blood Test Results',
      description: 'Complete blood count and lipid panel',
      testDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      reportDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      status: 'completed',
      results: [
        {
          testName: 'Total Cholesterol',
          value: '220',
          unit: 'mg/dL',
          normalRange: '< 200',
          status: 'abnormal',
          notes: 'Slightly elevated'
        },
        {
          testName: 'HDL Cholesterol',
          value: '45',
          unit: 'mg/dL',
          normalRange: '> 40',
          status: 'normal'
        }
      ],
      recommendations: 'Patient should follow a low-cholesterol diet and exercise regularly.'
    });
    await report.save();
    console.log('Created report');

    // Create sample review
    const review = new Review({
      patientId: createdPatients[0]._id,
      doctorId: createdDoctors[0]._id,
      appointmentId: appointment1._id,
      rating: 5,
      title: 'Excellent care',
      comment: 'Dr. Smith was very professional and thorough. Highly recommended!',
      aspects: {
        punctuality: 5,
        communication: 5,
        treatment: 5,
        environment: 4
      },
      isVerified: true,
      status: 'approved'
    });
    await review.save();
    console.log('Created review');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample accounts created:');
    console.log('Admin: admin@doxi.com / admin123');
    console.log('Doctor 1: doctor1@doxi.com / doctor123 (Cardiology)');
    console.log('Doctor 2: doctor2@doxi.com / doctor123 (General Medicine)');
    console.log('Doctor 3: doctor3@doxi.com / doctor123 (Dermatology)');
    console.log('Doctor 4: doctor4@doxi.com / doctor123 (Pediatrics)');
    console.log('Doctor 5: doctor5@doxi.com / doctor123 (Orthopedics)');
    console.log('Patient 1: patient1@doxi.com / patient123');
    console.log('Patient 2: patient2@doxi.com / patient123');

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
