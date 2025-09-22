# DOXI - Doctor Online Appointment System

A comprehensive doctor appointment booking platform with AI assistance, built with modern web technologies.

## 🚀 Features

### 🔑 Role-Based Access
- **Admin Panel**: Complete system management
- **Doctor Panel**: Patient management, appointments, prescriptions
- **Patient Panel**: Appointment booking, medical records, AI assistant

### 📱 Core Modules
- **User Management**: Registration, authentication, profile management
- **Appointment System**: Booking, scheduling, cancellation, reminders
- **Prescription Management**: Digital prescriptions, refills, tracking
- **Medical Reports**: Lab reports, imaging, pathology reports
- **Review System**: Doctor ratings and feedback
- **Real-time Chat**: Patient-doctor communication
- **AI Medical Assistant**: Symptom checker, health tips, medication info
- **Emergency Requests**: Urgent medical assistance
- **Notifications**: Email, SMS, push notifications
- **Dark/Light Theme**: Complete theme switching

### 🛠 Technology Stack

#### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time communication
- **Multer** for file uploads
- **Nodemailer** for email notifications
- **Express Validator** for input validation
- **Helmet** for security
- **Rate Limiting** for API protection

#### Frontend
- **React 18** with modern hooks
- **React Router** for navigation
- **TailwindCSS** for styling
- **Lucide React** for icons
- **React Hook Form** for form handling
- **Axios** for API calls
- **Socket.io Client** for real-time features
- **React Hot Toast** for notifications
- **Recharts** for data visualization

## 📁 Project Structure

```
doxi/
├── backend/
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── index.js          # Server entry point
│   └── package.json      # Backend dependencies
├── fronted/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
└── README.md
```

## 🗄 Database Schema

### Core Entities
- **Users**: Authentication and basic profile
- **Patients**: Patient-specific information and medical history
- **Doctors**: Doctor credentials, specialization, availability
- **Appointments**: Booking details, status, payments
- **Prescriptions**: Medication details, dosage, instructions
- **Reports**: Medical reports, lab results, imaging
- **Reviews**: Patient feedback and ratings
- **Notifications**: System and user notifications
- **Emergency Requests**: Urgent medical assistance
- **Admin Logs**: System activity tracking

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd doxi
   ```

2. **Install All Dependencies (Recommended)**
   ```bash
   npm run install:all
   ```

   **OR Install Manually:**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../fronted
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/doxi

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # AI Assistant Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

6. **Start Development Servers (Recommended)**
   ```bash
   # Start both backend and frontend simultaneously
   npm run dev
   ```

   **OR Start Manually:**
   ```bash
   # Start backend server (Terminal 1)
   npm run dev:backend
   
   # Start frontend server (Terminal 2)
   npm run dev:frontend
   ```

7. **Seed Sample Data (Optional)**
   ```bash
   npm run seed
   ```

8. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## 👥 User Roles & Permissions

### Admin
- Manage all users (patients, doctors)
- View system statistics and analytics
- Moderate reviews and content
- Handle emergency requests
- System configuration and settings

### Doctor
- Manage patient appointments
- Create and manage prescriptions
- Upload and review medical reports
- Respond to patient reviews
- Set availability and holidays
- Chat with patients

### Patient
- Book and manage appointments
- View prescriptions and reports
- Chat with doctors
- Use AI medical assistant
- Submit reviews and ratings
- Request emergency assistance

## 🔐 Authentication & Security

- **JWT-based authentication** with role-based access control
- **Password hashing** using bcrypt
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **CORS** configuration for cross-origin requests
- **Helmet** for security headers
- **File upload** restrictions and validation

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Admin Routes
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/doctors` - Get all doctors
- `PUT /api/admin/doctors/:id/verify` - Verify doctor

### Doctor Routes
- `GET /api/doctor/dashboard` - Doctor dashboard
- `GET /api/doctor/appointments` - Get doctor appointments
- `PUT /api/doctor/appointments/:id/status` - Update appointment status
- `GET /api/doctor/patients` - Get doctor's patients

### Patient Routes
- `GET /api/patient/dashboard` - Patient dashboard
- `GET /api/patient/doctors` - Find doctors
- `GET /api/patient/appointments` - Get patient appointments
- `POST /api/patient/emergency` - Create emergency request

### Appointments
- `POST /api/appointments/book` - Book new appointment
- `GET /api/appointments/available-slots/:doctorId` - Get available slots
- `PUT /api/appointments/:id` - Update appointment
- `PUT /api/appointments/:id/cancel` - Cancel appointment

### Prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions` - Get prescriptions
- `PUT /api/prescriptions/:id` - Update prescription
- `POST /api/prescriptions/:id/refill` - Add refill

### Reports
- `POST /api/reports` - Create medical report
- `GET /api/reports` - Get reports
- `PUT /api/reports/:id` - Update report
- `GET /api/reports/:id/download` - Download report

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews` - Get reviews
- `PUT /api/reviews/:id/respond` - Respond to review
- `GET /api/reviews/doctor/:doctorId` - Get doctor reviews

### Chat
- `GET /api/chat/rooms` - Get chat rooms
- `GET /api/chat/rooms/:roomId/messages` - Get messages
- `POST /api/chat/rooms/:roomId/messages` - Send message

### AI Assistant
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/symptom-checker` - Check symptoms
- `GET /api/ai/health-tips` - Get health tips
- `GET /api/ai/medication-info/:name` - Get medication info

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark/Light Theme**: Complete theme switching
- **Modern UI**: Clean and intuitive interface
- **Real-time Updates**: Live notifications and chat
- **Accessibility**: WCAG compliant components
- **Loading States**: Smooth user experience
- **Error Handling**: User-friendly error messages

## 🔧 Development

### Available Scripts

#### Root Level Commands
```bash
npm run dev              # Start both backend and frontend in development mode
npm run dev:backend      # Start only backend server
npm run dev:frontend     # Start only frontend server
npm run start            # Start both in production mode
npm run install:all      # Install all dependencies (root, backend, frontend)
npm run build            # Build frontend for production
npm run seed             # Seed database with sample data
npm run clean            # Remove all node_modules
npm run setup            # Run setup script
```

#### Backend Development
```bash
cd backend
npm run dev  # Start with nodemon for auto-reload
```

#### Frontend Development
```bash
cd fronted
npm run dev  # Start Vite development server
```

### Building for Production
```bash
# Build and start both services
npm run start

# Or manually:
# Backend
cd backend
npm start

# Frontend
cd fronted
npm run build
npm run preview
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd fronted
npm test
```

## 📦 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB instance
2. Configure environment variables
3. Deploy to platforms like Heroku, DigitalOcean, or AWS
4. Set up SSL certificates
5. Configure domain and DNS

### Frontend Deployment
1. Build the production bundle
2. Deploy to platforms like Vercel, Netlify, or AWS S3
3. Configure environment variables
4. Set up custom domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@doxi.com or join our Slack channel.

## 🙏 Acknowledgments

- React team for the amazing framework
- TailwindCSS for the utility-first CSS framework
- MongoDB for the flexible database
- All the open-source contributors

---

**DOXI** - Making healthcare accessible, one appointment at a time. 🏥✨
