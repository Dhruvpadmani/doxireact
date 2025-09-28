# Database Redesign Migration Plan

This document outlines all the files that need to be modified after implementing the new database structure.

## Models to Update/Replace

### 1. Backend Models (Migrate to Single User Model)

**Files to Update:**

- `backend/models/Patient.js` - DELETE (replaced by userSchema.patientData subdocument)
- `backend/models/Doctor.js` - DELETE (replaced by userSchema.doctorData subdocument)
- `backend/models/User.js` - UPDATE (enhance to include role-based subdocuments)

**Changes:**

- Consolidate all Patient data into userSchema.patientData subdocument
- Consolidate all Doctor data into userSchema.doctorData subdocument
- Remove separate Patient and Doctor models
- Update ID generation logic (patientId and doctorId will now be in subdocuments)
- Add methods for updating doctor ratings within User model

### 2. Backend Routes/Controllers

**Files to Update:**

**`backend/routes/auth.js`:**

- Update registration logic to create only User document with role-based subdocument
- Remove creation of separate Patient/Doctor documents
- Update authentication to work with single User model
- Update profile retrieval to return role-specific data from subdocuments

**`backend/routes/patient.js`:**

- Update all routes to reference User model instead of Patient model
- Change all `Patient.findOne({ userId: req.user._id })` to `User.findById(req.user._id)`
- Update queries to use role-specific fields
- Update validation to reflect new structure

**`backend/routes/doctor.js`:**

- Update all routes to reference User model instead of Doctor model
- Change all `Doctor.findOne({ userId: req.user._id })` to `User.findById(req.user._id)`
- Update queries to use role-specific fields
- Update validation to reflect new structure

**`backend/routes/appointments.js`:**

- Update all references from Patient to User
- Update all references from Doctor to User
- Update populate queries to reference Users instead of separate Patient/Doctor
- Update appointment creation to use User IDs instead of separate model IDs

**`backend/routes/prescriptions.js`:**

- Update all references from Patient to User
- Update all references from Doctor to User
- Update populate queries to reference Users instead of separate Patient/Doctor

**`backend/routes/reports.js`:**

- Update all references from Patient to User
- Update all references from Doctor to User
- Update populate queries to reference Users instead of separate Patient/Doctor

**`backend/routes/reviews.js`:**

- Update all references from Patient to User
- Update all references from Doctor to User
- Update populate queries to reference Users instead of separate Patient/Doctor

**`backend/routes/admin.js`:**

- Update user management to work with single User model
- Update dashboard queries to work with new structure

## Frontend Components to Update

### 3. Frontend API Service Files

**`frontend/src/services/api.js` or similar API service files:**

- Update all API endpoints to work with new structure
- Update request/response handling for user-related data
- Update all references to /patient/ and /doctor/ routes

### 4. Frontend User Authentication/Profile Components

**`frontend/src/components/auth/*`:**

- Update registration forms to work with new consolidated structure
- Update login logic to handle single user model
- Update profile management to work with role-based subdocuments

**`frontend/src/components/patient/*`:**

- Update all patient components to work with User model instead of separate Patient model
- Update patient dashboard to fetch data from User profile
- Update patient forms to send data in new structure

**`frontend/src/components/doctor/*`:**

- Update all doctor components to work with User model instead of separate Doctor model
- Update doctor dashboard to fetch data from User profile
- Update doctor forms to send data in new structure

## Middleware Files to Update

### 5. Authentication Middleware

**`backend/middleware/auth.js`:**

- Update authorization logic to work with new User structure
- Update role checking to work with consolidated model
- Update user retrieval from token to handle new structure

## Configuration Files

### 6. Environment Configuration

**`backend/index.js` or main application file:**

- Update model imports to remove Patient and Doctor models
- Import only User model
- Update any database connection configurations

## Testing Files

### 7. Test Files

**`tests/*` or `__tests__/*`:**

- Update all test cases to work with new structure
- Update mock data to use new model structure
- Update integration tests to use User model instead of separate models

## Migration Script Files

### 8. Data Migration Scripts

**New files to create:**

- `backend/migrations/migrate-users.js` - Script to migrate existing data
- `backend/migrations/backup-existing.js` - Backup script before migration

## Key Changes Summary

### Database Queries to Update:

1. Replace `Patient.findOne({ userId: userId })` with `User.findById(userId)`
2. Replace `Doctor.findOne({ userId: userId })` with `User.findById(userId)`
3. Replace `Appointment.find({ patientId: patientId })` with `Appointment.find({ patientId: patientId })` (IDs remain
   the same)
4. Replace `Appointment.find({ doctorId: doctorId })` with `Appointment.find({ doctorId: doctorId })` (IDs remain the
   same)

### API Response Changes:

1. Patient profile response will now come from User model with patientData subdocument
2. Doctor profile response will now come from User model with doctorData subdocument
3. Authentication responses will remain largely the same (user object with role-specific data)

### Frontend Update Points:

1. UserProfile component needs to handle role-based data differently
2. Patient dashboard needs to fetch data from User endpoint instead of Patient endpoint
3. Doctor dashboard needs to fetch data from User endpoint instead of Doctor endpoint

## Migration Steps Order

1. **Backup existing data**
2. **Create migration scripts**
3. **Update backend models** (User.js enhanced, Patient.js/Doctor.js removed)
4. **Update backend routes/controllers**
5. **Update middleware**
6. **Test backend functionality**
7. **Update frontend components**
8. **Test complete application**
9. **Deploy to production**

## Potential Issues to Watch For

1. **Circular references**: Make sure to handle any circular references that may arise
2. **Validation updates**: Ensure validation logic works with new structure
3. **Populate queries**: Update all populate queries to correctly reference User model
4. **Relationship integrity**: Ensure all foreign key references work correctly
5. **Performance**: Verify that new structure doesn't negatively impact query performance