import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
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
  
  // Prescription content
  diagnosis: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  symptoms: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  
  medications: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    genericName: {
      type: String,
      trim: true,
      maxlength: 200
    },
    dosage: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    frequency: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    duration: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: 500
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    unit: {
      type: String,
      enum: ['tablets', 'capsules', 'ml', 'mg', 'g'],
      default: 'tablets'
    }
  }],
  
  tests: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    type: {
      type: String,
      enum: ['blood', 'urine', 'imaging', 'other'],
      default: 'blood'
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: 500
    },
    priority: {
      type: String,
      enum: ['routine', 'urgent', 'stat'],
      default: 'routine'
    }
  }],
  
  // Digital prescription
  whiteboardData: {
    type: String, // Base64 encoded drawing data
    maxlength: 1000000 // 1MB limit
  },
  prescriptionImage: {
    type: String, // URL to uploaded image
    maxlength: 500
  },
  prescriptionPdf: {
    type: String, // URL to generated PDF
    maxlength: 500
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'sent-to-pharmacy', 'fulfilled', 'cancelled'],
    default: 'draft',
    index: true
  },
  
  // Pharmacy workflow
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
  
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  followUpNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Additional notes
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Timestamps
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
prescriptionSchema.index({ status: 1, createdAt: -1 });
prescriptionSchema.index({ pharmacyId: 1, status: 1 });

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

prescriptionSchema.methods.addMedication = function(medication) {
  this.medications.push(medication);
  return this.save();
};

prescriptionSchema.methods.addTest = function(test) {
  this.tests.push(test);
  return this.save();
};

prescriptionSchema.methods.getMedicationCount = function() {
  return this.medications.length;
};

prescriptionSchema.methods.getTestCount = function() {
  return this.tests.length;
};

export const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;

