/**
 * ROLE-BASED MONGODB SCHEMAS
 * Separate schemas for each role instead of unified user schema
 */

// ===========================================
// ADMIN SCHEMA
// ===========================================

const AdminSchema = {
  _id: { type: 'ObjectId', required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  password: { type: String, required: true, select: false },
  isActive: { type: Boolean, default: true },
  
  // Admin-specific fields
  adminId: { type: String, unique: true, required: true }, // ADM001, ADM002
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  
  // Admin permissions
  permissions: {
    canManageUsers: { type: Boolean, default: true },
    canManageDoctors: { type: Boolean, default: true },
    canManagePatients: { type: Boolean, default: true },
    canViewAnalytics: { type: Boolean, default: true },
    canManageInventory: { type: Boolean, default: true },
    canManageBilling: { type: Boolean, default: true }
  },
  
  // System access
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// ===========================================
// PATIENT SCHEMA
// ===========================================

const PatientSchema = {
  _id: { type: 'ObjectId', required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  password: { type: String, required: true, select: false },
  isActive: { type: Boolean, default: true },
  
  // Patient-specific fields
  patientId: { type: String, unique: true, required: true }, // P001, P002
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  
  // Address
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  
  // Emergency contact
  emergencyContact: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true }
  },
  
  // Medical information
  medicalHistory: [{
    condition: { type: String, required: true },
    diagnosisDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'resolved', 'chronic'], default: 'active' },
    notes: String,
    doctorId: { type: 'ObjectId', ref: 'Doctor' }
  }],
  
  allergies: [{
    allergen: { type: String, required: true },
    severity: { type: String, enum: ['mild', 'moderate', 'severe'], required: true },
    reaction: String,
    notes: String
  }],
  
  currentMedications: [{
    name: { type: String, required: true },
    dosage: String,
    frequency: String,
    prescribedBy: { type: 'ObjectId', ref: 'Doctor' },
    prescribedDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  }],
  
  vitalSigns: [{
    date: { type: Date, default: Date.now },
    height: Number, // cm
    weight: Number, // kg
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    recordedBy: { type: 'ObjectId', ref: 'Doctor' }
  }],
  
  // Insurance
  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date,
    coverage: Number // percentage
  },
  
  // Patient preferences
  preferences: {
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// ===========================================
// DOCTOR SCHEMA
// ===========================================

const DoctorSchema = {
  _id: { type: 'ObjectId', required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  password: { type: String, required: true, select: false },
  isActive: { type: Boolean, default: true },
  
  // Doctor-specific fields
  doctorId: { type: String, unique: true, required: true }, // DOC001, DOC002
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  
  // Professional information
  qualification: { type: String, required: true },
  specialization: [{ type: String, required: true }],
  licenseNumber: { type: String, unique: true, required: true },
  experience: { type: Number, default: 0 }, // years
  consultationFee: { type: Number, default: 0 },
  
  // Availability
  availableSlots: [{
    dayOfWeek: { type: Number, min: 0, max: 6 }, // 0 = Sunday
    startTime: String, // "09:00"
    endTime: String,   // "17:00"
    isActive: { type: Boolean, default: true }
  }],
  
  // Doctor preferences
  preferences: {
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    maxPatientsPerDay: { type: Number, default: 20 },
    consultationDuration: { type: Number, default: 30 } // minutes
  },
  
  // Performance metrics
  metrics: {
    totalConsultations: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// ===========================================
// RECEPTIONIST SCHEMA
// ===========================================

const ReceptionistSchema = {
  _id: { type: 'ObjectId', required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  password: { type: String, required: true, select: false },
  isActive: { type: Boolean, default: true },
  
  // Receptionist-specific fields
  receptionistId: { type: String, unique: true, required: true }, // REC001, REC002
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  
  // Receptionist permissions
  permissions: {
    canBookAppointments: { type: Boolean, default: true },
    canManagePatients: { type: Boolean, default: true },
    canViewSchedules: { type: Boolean, default: true },
    canProcessPayments: { type: Boolean, default: true },
    canGenerateReports: { type: Boolean, default: false }
  },
  
  // Work schedule
  workSchedule: [{
    dayOfWeek: { type: Number, min: 0, max: 6 },
    startTime: String,
    endTime: String,
    isActive: { type: Boolean, default: true }
  }],
  
  // Performance metrics
  metrics: {
    appointmentsBooked: { type: Number, default: 0 },
    patientsRegistered: { type: Number, default: 0 },
    paymentsProcessed: { type: Number, default: 0 }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// ===========================================
// PHARMACIST SCHEMA
// ===========================================

const PharmacistSchema = {
  _id: { type: 'ObjectId', required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  password: { type: String, required: true, select: false },
  isActive: { type: Boolean, default: true },
  
  // Pharmacist-specific fields
  pharmacistId: { type: String, unique: true, required: true }, // PHM001, PHM002
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  
  // Professional information
  licenseNumber: { type: String, unique: true, required: true },
  specialization: [{ type: String }],
  experience: { type: Number, default: 0 }, // years
  
  // Pharmacist permissions
  permissions: {
    canFulfillPrescriptions: { type: Boolean, default: true },
    canManageInventory: { type: Boolean, default: true },
    canProcessOrders: { type: Boolean, default: true },
    canViewPrescriptions: { type: Boolean, default: true }
  },
  
  // Work schedule
  workSchedule: [{
    dayOfWeek: { type: Number, min: 0, max: 6 },
    startTime: String,
    endTime: String,
    isActive: { type: Boolean, default: true }
  }],
  
  // Performance metrics
  metrics: {
    prescriptionsFulfilled: { type: Number, default: 0 },
    inventoryManaged: { type: Number, default: 0 },
    ordersProcessed: { type: Number, default: 0 }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// ===========================================
// SHARED SCHEMAS (Used by multiple roles)
// ===========================================

const AppointmentSchema = {
  _id: { type: 'ObjectId', required: true },
  appointmentId: { type: String, unique: true, required: true },
  
  // References to role-specific collections
  patientId: { type: 'ObjectId', ref: 'Patient', required: true },
  doctorId: { type: 'ObjectId', ref: 'Doctor', required: true },
  receptionistId: { type: 'ObjectId', ref: 'Receptionist' },
  
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 30 },
  status: { 
    type: String, 
    enum: ['scheduled', 'confirmed', 'checked-in', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  
  type: { 
    type: String, 
    enum: ['consultation', 'follow-up', 'emergency', 'telemedicine'],
    default: 'consultation'
  },
  reason: { type: String, required: true },
  notes: String,
  
  checkedInAt: Date,
  startedAt: Date,
  completedAt: Date,
  
  consultationFee: Number,
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'partial', 'waived'],
    default: 'pending'
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

const PrescriptionSchema = {
  _id: { type: 'ObjectId', required: true },
  prescriptionId: { type: String, unique: true, required: true },
  
  // References to role-specific collections
  appointmentId: { type: 'ObjectId', ref: 'Appointment', required: true },
  patientId: { type: 'ObjectId', ref: 'Patient', required: true },
  doctorId: { type: 'ObjectId', ref: 'Doctor', required: true },
  pharmacistId: { type: 'ObjectId', ref: 'Pharmacist' },
  
  diagnosis: { type: String, required: true },
  symptoms: [String],
  
  medications: [{
    name: { type: String, required: true },
    genericName: String,
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: String,
    quantity: Number,
    unit: { type: String, enum: ['tablets', 'capsules', 'ml', 'mg', 'g'], default: 'tablets' }
  }],
  
  tests: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['blood', 'urine', 'imaging', 'other'] },
    instructions: String,
    priority: { type: String, enum: ['routine', 'urgent', 'stat'], default: 'routine' }
  }],
  
  whiteboardData: String,
  prescriptionImage: String,
  prescriptionPdf: String,
  
  status: { 
    type: String, 
    enum: ['draft', 'submitted', 'sent-to-pharmacy', 'fulfilled', 'cancelled'],
    default: 'draft'
  },
  
  sentToPharmacyAt: Date,
  fulfilledAt: Date,
  
  followUpRequired: { type: Boolean, default: false },
  followUpDate: Date,
  followUpNotes: String,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// ===========================================
// EXPORT ALL SCHEMAS
// ===========================================

module.exports = {
  AdminSchema,
  PatientSchema,
  DoctorSchema,
  ReceptionistSchema,
  PharmacistSchema,
  AppointmentSchema,
  PrescriptionSchema
};
