# Find Doctor Feature

## Overview
The Find Doctor feature allows users to search and discover verified doctors on the DOXI platform. When doctors create their profiles, they automatically appear in the Find Doctor page, making them discoverable to patients.

## Features

### 🔍 Advanced Search
- **Text Search**: Search by specialization, doctor name, or keywords
- **Specialization Filter**: Filter by medical specialties (Cardiology, Dermatology, Pediatrics, etc.)
- **Rating Filter**: Find doctors with minimum rating requirements
- **Consultation Type**: Filter by in-person, video, or phone consultations
- **Language Support**: Search by languages spoken by doctors
- **Fee Range**: Filter by consultation fee range

### 📊 Sorting Options
- Sort by rating (highest to lowest)
- Sort by consultation fee (lowest to highest)
- Sort by experience (most experienced first)

### 🎯 Doctor Profiles
Each doctor card displays:
- Doctor name and specialization
- Experience and qualifications
- Consultation fees and types
- Languages spoken
- Bio and description
- Star ratings and review count
- Availability information

### 📱 Responsive Design
- Mobile-friendly interface
- Collapsible filters for better mobile experience
- Pagination for large result sets

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Search Doctors
```
GET /api/doctors/search
```

**Query Parameters:**
- `specialization` - Filter by medical specialization
- `rating` - Minimum rating filter
- `consultationType` - Type of consultation (in_person, video, phone)
- `minFee` / `maxFee` - Fee range filters
- `language` - Language filter
- `search` - General text search
- `page` - Page number for pagination
- `limit` - Number of results per page
- `sortBy` - Sort field (rating, fee, experience)
- `sortOrder` - Sort direction (asc, desc)

**Example:**
```
GET /api/doctors/search?specialization=Cardiology&rating=4.0&sortBy=rating&sortOrder=desc
```

#### Get Doctor Details
```
GET /api/doctors/:id
```

#### Check Doctor Availability
```
GET /api/doctors/:id/availability?date=2024-01-15
```

## Frontend Components

### FindDoctor.jsx
Main component located at `fronted/src/pages/FindDoctor.jsx`

**Key Features:**
- Search form with real-time filtering
- Advanced filter panel (collapsible)
- Doctor cards with comprehensive information
- Pagination controls
- Sort options
- Responsive grid layout

### Integration
- Added to main routing in `App.jsx`
- Accessible via `/find-doctor` route
- Linked from landing page navigation
- Public access (no authentication required)

## Database Schema

### Doctor Model
The feature uses the existing Doctor model with these key fields:
- `specialization` - Medical specialty
- `consultationFee` - Base consultation fee
- `consultationTypes` - Array of consultation types with fees
- `languages` - Languages spoken
- `rating` - Average rating and review count
- `isVerified` - Verification status
- `bio` - Doctor description
- `experience` - Years of experience
- `availability` - Weekly availability schedule

## Sample Data

The seeder includes 5 sample doctors:
1. **Dr. John Smith** - Cardiology (10 years experience)
2. **Dr. Sarah Johnson** - General Medicine (8 years experience)
3. **Dr. Priya Sharma** - Dermatology (6 years experience)
4. **Dr. Rajesh Kumar** - Pediatrics (4 years experience)
5. **Dr. Maria Garcia** - Orthopedics (9 years experience)

## Usage Instructions

### For Patients
1. Visit the landing page
2. Click "Find Doctor" button or navigate to `/find-doctor`
3. Use the search bar to find doctors by name or specialization
4. Apply filters to narrow down results
5. Sort results by rating, fee, or experience
6. Click "View Profile" to see detailed information
7. Click "Book Now" to schedule an appointment

### For Doctors
1. Create a doctor account and complete profile setup
2. Ensure profile is verified by admin
3. Doctor will automatically appear in search results
4. Update availability and consultation types as needed

## Technical Implementation

### Backend
- New route file: `backend/routes/doctors.js`
- Public endpoints for doctor search
- Advanced filtering and sorting
- Pagination support
- Integration with existing Doctor model

### Frontend
- React component with hooks for state management
- API integration using axios
- Responsive design with Tailwind CSS
- Real-time search and filtering
- Pagination and sorting controls

### Security
- Public endpoints (no authentication required)
- Only verified doctors appear in results
- Sensitive data (verification documents, holidays) excluded from public API

## Future Enhancements

- **Location-based search**: Filter doctors by city/area
- **Appointment booking**: Direct booking from doctor cards
- **Advanced filters**: Insurance acceptance, gender preferences
- **Doctor comparison**: Side-by-side doctor comparison
- **Favorites**: Save favorite doctors
- **Reviews integration**: Show recent reviews on doctor cards
- **Map integration**: Show doctor locations on map
