// Demo data for when backend is not available
export const generateDemoPatientData = () => ({
  statistics: {
    upcomingAppointments: 2,
    totalAppointments: 8,
    totalPrescriptions: 5,
    totalReports: 3
  },
  recent: {
    appointments: [
      {
        _id: '1',
        appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: 'scheduled',
        doctorId: {
          specialization: 'Cardiology'
        }
      },
      {
        _id: '2',
        appointmentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'completed',
        doctorId: {
          specialization: 'General Medicine'
        }
      }
    ],
    prescriptions: [
      {
        _id: '1',
        medications: [{ name: 'Paracetamol 500mg' }],
        status: 'active',
        doctorId: {
          specialization: 'General Medicine'
        }
      }
    ]
  }
})

export const generateDemoDoctorData = () => ({
  statistics: {
    todayAppointments: 4,
    totalAppointments: 45,
    totalPrescriptions: 38,
    averageRating: 4.7
  },
  recent: {
    appointments: [
      {
        _id: '1',
        appointmentDate: new Date(),
        status: 'scheduled',
        appointmentTime: '10:00 AM',
        type: 'consultation',
        patientId: {
          patientId: 'P001'
        }
      }
    ],
    upcoming: [
      {
        _id: '2',
        appointmentDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
        appointmentTime: '2:00 PM',
        type: 'follow-up',
        patientId: {
          patientId: 'P002'
        }
      }
    ]
  }
})

export const generateDemoAdminData = () => ({
  statistics: {
    total: {
      users: 156,
      doctors: 23,
      appointments: 89
    },
    emergency: {
      pending: 3
    }
  },
  recent: {
    appointments: [
      {
        _id: '1',
        patientId: {
          patientId: 'P001'
        },
        doctorId: {
          specialization: 'Cardiology'
        },
        status: 'scheduled'
      }
    ],
    users: [
      {
        _id: '1',
        email: 'john.doe@example.com',
        role: 'patient',
        profile: {
          firstName: 'John',
          lastName: 'Doe'
        }
      },
      {
        _id: '2',
        email: 'dr.smith@example.com',
        role: 'doctor',
        profile: {
          firstName: 'Dr. Jane',
          lastName: 'Smith'
        }
      }
    ]
  }
})
