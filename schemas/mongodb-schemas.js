/**
 * MongoDB Schemas for Clinic Management System
 * Professional schema design with validation, relationships, and indexing
 */

// ===========================================
// USER MANAGEMENT SCHEMAS
// ===========================================

const UserSchema = {
  _id: { type: 'ObjectId', required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 8,
    select: false // Never return password in queries
  },
  role: { 
    type: String, 
    required: true, 
    enum: ['admin', 'receptionist', 'doctor', 'pharmacist', 'patient'],
    index: true
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  // Profile information
  profile: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { 
      type: String, 
      required: true,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format']
    },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' }
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },

  // Role-specific fields
  doctorInfo: {
    qualification: String,
    specialization: [String],
    licenseNumber: { type: String, unique: true, sparse: true },
    experience: Number, // years
    consultationFee: Number,
    availableSlots: [{
      dayOfWeek: { type: Number, min: 0, max: 6 }, // 0 = Sunday
      startTime: String, // "09:00"
      endTime: String,   // "17:00"
      isActive: { type: Boolean, default: true }
    }]
  },

  pharmacistInfo: {
    licenseNumber: { type: String, unique: true, sparse: true },
    specialization: [String]
  },

  // System fields
  preferences: {
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  }
};

// ===========================================
// PATIENT MANAGEMENT SCHEMAS
// ===========================================

const PatientSchema = {
  _id: { type: 'ObjectId', required: true },
  userId: { type: 'ObjectId', ref: 'User', required: true, unique: true },
  patientId: { type: String, unique: true, required: true }, // Auto-generated: P001, P002, etc.
  
  // Medical Information
  medicalHistory: [{
    condition: { type: String, required: true },
    diagnosisDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'resolved', 'chronic'], default: 'active' },
    notes: String,
    doctorId: { type: 'ObjectId', ref: 'User' }
  }],
  
  allergies: [{
    allergen: { type: String, required: true },
    severity: { type: String, enum: ['mild', 'moderate', 'severe'], required: true },
    reaction: String,
    notes: String
  }],
  
  medications: [{
    name: { type: String, required: true },
    dosage: String,
    frequency: String,
    prescribedBy: { type: 'ObjectId', ref: 'User' },
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
    recordedBy: { type: 'ObjectId', ref: 'User' }
  }],
  
  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date,
    coverage: Number // percentage
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// ===========================================
// APPOINTMENT MANAGEMENT SCHEMAS
// ===========================================

const AppointmentSchema = {
  _id: { type: 'ObjectId', required: true },
  appointmentId: { type: String, unique: true, required: true }, // APT001, APT002, etc.
  
  // Core appointment data
  patientId: { type: 'ObjectId', ref: 'Patient', required: true, index: true },
  doctorId: { type: 'ObjectId', ref: 'User', required: true, index: true },
  scheduledAt: { type: Date, required: true, index: true },
  duration: { type: Number, default: 30 }, // minutes
  
  // Status tracking
  status: { 
    type: String, 
    enum: ['scheduled', 'confirmed', 'checked-in', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled',
    index: true
  },
  
  // Appointment details
  type: { 
    type: String, 
    enum: ['consultation', 'follow-up', 'emergency', 'telemedicine'],
    default: 'consultation'
  },
  reason: { type: String, required: true },
  notes: String,
  
  // Timing
  checkedInAt: Date,
  startedAt: Date,
  completedAt: Date,
  
  // Billing
  consultationFee: Number,
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'partial', 'waived'],
    default: 'pending'
  },
  
  // System fields
  createdBy: { type: 'ObjectId', ref: 'User', required: true },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
};

// ===========================================
// PRESCRIPTION MANAGEMENT SCHEMAS
// ===========================================

const PrescriptionSchema = {
  _id: { type: 'ObjectId', required: true },
  prescriptionId: { type: String, unique: true, required: true }, // RX001, RX002, etc.
  
  // Core relationships
  appointmentId: { type: 'ObjectId', ref: 'Appointment', required: true },
  patientId: { type: 'ObjectId', ref: 'Patient', required: true, index: true },
  doctorId: { type: 'ObjectId', ref: 'User', required: true, index: true },
  
  // Prescription content
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
  
  // Digital prescription
  whiteboardData: String, // Base64 encoded drawing data
  prescriptionImage: String, // URL to uploaded image
  prescriptionPdf: String, // URL to generated PDF
  
  // Status tracking
  status: { 
    type: String, 
    enum: ['draft', 'submitted', 'sent-to-pharmacy', 'fulfilled', 'cancelled'],
    default: 'draft',
    index: true
  },
  
  // Pharmacy workflow
  pharmacyId: { type: 'ObjectId', ref: 'User' },
  sentToPharmacyAt: Date,
  fulfilledAt: Date,
  
  // Follow-up
  followUpRequired: { type: Boolean, default: false },
  followUpDate: Date,
  followUpNotes: String,
  
  // System fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// ===========================================
// PHARMACY MANAGEMENT SCHEMAS
// ===========================================

const PharmacyFulfillmentSchema = {
  _id: { type: 'ObjectId', required: true },
  prescriptionId: { type: 'ObjectId', ref: 'Prescription', required: true },
  pharmacistId: { type: 'ObjectId', ref: 'User', required: true },
  
  // Fulfillment details
  items: [{
    medicationName: { type: String, required: true },
    prescribedQuantity: Number,
    dispensedQuantity: Number,
    unit: String,
    batchNumber: String,
    expiryDate: Date,
    price: Number,
    isSubstituted: { type: Boolean, default: false },
    substituteReason: String
  }],
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'fulfilled', 'partial', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Notes and instructions
  notes: String,
  instructions: String,
  
  // Pricing
  totalAmount: Number,
  discount: { type: Number, default: 0 },
  finalAmount: Number,
  
  // Timing
  startedAt: Date,
  completedAt: Date,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// ===========================================
// INVENTORY MANAGEMENT SCHEMAS
// ===========================================

const InventorySchema = {
  _id: { type: 'ObjectId', required: true },
  medicationName: { type: String, required: true, index: true },
  genericName: String,
  category: { type: String, required: true, index: true },
  
  // Stock information
  currentStock: { type: Number, required: true, min: 0 },
  minimumStock: { type: Number, required: true },
  maximumStock: { type: Number, required: true },
  
  // Pricing
  unitPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  
  // Product details
  manufacturer: String,
  batchNumber: String,
  expiryDate: Date,
  unit: { type: String, enum: ['tablets', 'capsules', 'ml', 'mg', 'g'], default: 'tablets' },
  
  // Status
  isActive: { type: Boolean, default: true },
  isPrescriptionRequired: { type: Boolean, default: true },
  
  // Movement tracking
  movements: [{
    type: { type: String, enum: ['in', 'out', 'adjustment'], required: true },
    quantity: { type: Number, required: true },
    reason: String,
    reference: String, // Order ID, prescription ID, etc.
    performedBy: { type: 'ObjectId', ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// ===========================================
// AUDIT & LOGGING SCHEMAS
// ===========================================

const AuditLogSchema = {
  _id: { type: 'ObjectId', required: true },
  userId: { type: 'ObjectId', ref: 'User', required: true, index: true },
  action: { type: String, required: true, index: true },
  resourceType: { type: String, required: true, index: true },
  resourceId: { type: 'ObjectId', required: true, index: true },
  
  // Details
  description: String,
  oldValues: Object,
  newValues: Object,
  
  // Context
  ipAddress: String,
  userAgent: String,
  sessionId: String,
  
  // Timing
  timestamp: { type: Date, default: Date.now, index: true }
};

// ===========================================
// NOTIFICATION SCHEMAS
// ===========================================

const NotificationSchema = {
  _id: { type: 'ObjectId', required: true },
  userId: { type: 'ObjectId', ref: 'User', required: true, index: true },
  
  // Notification content
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['info', 'success', 'warning', 'error', 'appointment', 'prescription'],
    default: 'info',
    index: true
  },
  
  // Status
  isRead: { type: Boolean, default: false, index: true },
  isSent: { type: Boolean, default: false },
  
  // Delivery channels
  channels: {
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  },
  
  // Related data
  relatedId: { type: 'ObjectId' }, // Appointment ID, Prescription ID, etc.
  relatedType: String,
  
  // Timing
  scheduledFor: Date,
  sentAt: Date,
  readAt: Date,
  
  createdAt: { type: Date, default: Date.now, index: true }
};

// ===========================================
// SYSTEM CONFIGURATION SCHEMAS
// ===========================================

const SystemConfigSchema = {
  _id: { type: 'ObjectId', required: true },
  key: { type: String, required: true, unique: true },
  value: { type: Object, required: true },
  category: { type: String, required: true, index: true },
  description: String,
  isActive: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

// ===========================================
// EXPORT ALL SCHEMAS
// ===========================================

module.exports = {
  UserSchema,
  PatientSchema,
  AppointmentSchema,
  PrescriptionSchema,
  PharmacyFulfillmentSchema,
  InventorySchema,
  AuditLogSchema,
  NotificationSchema,
  SystemConfigSchema
};
