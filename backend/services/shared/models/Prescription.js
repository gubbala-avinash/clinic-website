import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  // Unique prescription identifier
  prescriptionId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // Core relationships - ESSENTIAL
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    index: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // File storage information - ESSENTIAL
  prescriptionPdf: {
    type: String, // Full file path relative to storage root
    required: true,
    maxlength: 500,
    index: true
  },
  
  // Status tracking - ESSENTIAL
  status: {
    type: String,
    enum: ['draft', 'submitted', 'sent-to-pharmacy', 'fulfilled', 'cancelled'],
    default: 'submitted',
    index: true
  },
  
  // Pharmacy workflow - OPTIONAL
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sentToPharmacyAt: {
    type: Date
  },
  fulfilledAt: {
    type: Date
  },
  
  // Timestamps - ESSENTIAL
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for patient info
prescriptionSchema.virtual('patient', {
  ref: 'User',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true
});

// Virtual for doctor info
prescriptionSchema.virtual('doctor', {
  ref: 'User',
  localField: 'doctorId',
  foreignField: '_id',
  justOne: true
});

// Virtual for appointment info
prescriptionSchema.virtual('appointment', {
  ref: 'Appointment',
  localField: 'appointmentId',
  foreignField: '_id',
  justOne: true
});

// Indexes for performance
prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ doctorId: 1, createdAt: -1 });
prescriptionSchema.index({ appointmentId: 1 });
prescriptionSchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware
prescriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
prescriptionSchema.statics.findByPatient = function(patientId) {
  return this.find({ patientId }).sort({ createdAt: -1 });
};

prescriptionSchema.statics.findByDoctor = function(doctorId) {
  return this.find({ doctorId }).sort({ createdAt: -1 });
};

prescriptionSchema.statics.findByAppointment = function(appointmentId) {
  return this.findOne({ appointmentId });
};

prescriptionSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

prescriptionSchema.statics.findByPharmacy = function(pharmacyId) {
  return this.find({ pharmacyId }).sort({ createdAt: -1 });
};

// Instance methods
prescriptionSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  this.updatedAt = new Date();
  
  // Set timing fields based on status
  switch (newStatus) {
    case 'sent-to-pharmacy':
      this.sentToPharmacyAt = new Date();
      break;
    case 'fulfilled':
      this.fulfilledAt = new Date();
      break;
  }
  
  return this.save();
};

export const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;