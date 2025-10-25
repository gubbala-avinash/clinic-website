import mongoose from 'mongoose';

const pharmacyOrderSchema = new mongoose.Schema({
  orderId: {
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
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
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
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  // Order details
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
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      enum: ['tablets', 'capsules', 'ml', 'mg', 'g'],
      default: 'tablets'
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: 500
    },
    supplied: {
      type: Boolean,
      default: false
    },
    suppliedQuantity: {
      type: Number,
      default: 0
    },
    suppliedAt: {
      type: Date
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500
    }
  }],
  
  // Order status
  status: {
    type: String,
    enum: ['pending', 'processing', 'ready', 'dispensed', 'rejected', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Pharmacy workflow
  receivedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  readyAt: {
    type: Date
  },
  dispensedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Customer interaction
  customerStatus: {
    type: String,
    enum: ['waiting', 'notified', 'collected', 'rejected', 'expired'],
    default: 'waiting'
  },
  customerNotifiedAt: {
    type: Date
  },
  customerCollectedAt: {
    type: Date
  },
  customerRejectedAt: {
    type: Date
  },
  customerRejectionReason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Additional notes
  pharmacyNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  customerNotes: {
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
pharmacyOrderSchema.virtual('patient', {
  ref: 'User',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true
});

// Virtual for doctor info
pharmacyOrderSchema.virtual('doctor', {
  ref: 'User',
  localField: 'doctorId',
  foreignField: '_id',
  justOne: true
});

// Virtual for pharmacy info
pharmacyOrderSchema.virtual('pharmacy', {
  ref: 'User',
  localField: 'pharmacyId',
  foreignField: '_id',
  justOne: true
});

// Indexes for performance
pharmacyOrderSchema.index({ patientId: 1, createdAt: -1 });
pharmacyOrderSchema.index({ pharmacyId: 1, status: 1 });
pharmacyOrderSchema.index({ status: 1, createdAt: -1 });
pharmacyOrderSchema.index({ customerStatus: 1, createdAt: -1 });

// Pre-save middleware
pharmacyOrderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
pharmacyOrderSchema.statics.findByPatient = function(patientId) {
  return this.find({ patientId }).sort({ createdAt: -1 });
};

pharmacyOrderSchema.statics.findByPharmacy = function(pharmacyId) {
  return this.find({ pharmacyId }).sort({ createdAt: -1 });
};

pharmacyOrderSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

pharmacyOrderSchema.statics.findPending = function() {
  return this.find({ status: 'pending' }).sort({ createdAt: -1 });
};

// Instance methods
pharmacyOrderSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  this.updatedAt = new Date();
  
  // Set timing fields based on status
  switch (newStatus) {
    case 'processing':
      this.processedAt = new Date();
      break;
    case 'ready':
      this.readyAt = new Date();
      break;
    case 'dispensed':
      this.dispensedAt = new Date();
      this.customerStatus = 'collected';
      this.customerCollectedAt = new Date();
      break;
    case 'rejected':
      this.rejectedAt = new Date();
      break;
  }
  
  return this.save();
};

pharmacyOrderSchema.methods.updateCustomerStatus = function(newStatus, reason = null) {
  this.customerStatus = newStatus;
  this.updatedAt = new Date();
  
  // Set timing fields based on status
  switch (newStatus) {
    case 'notified':
      this.customerNotifiedAt = new Date();
      break;
    case 'collected':
      this.customerCollectedAt = new Date();
      this.status = 'dispensed';
      this.dispensedAt = new Date();
      break;
    case 'rejected':
      this.customerRejectedAt = new Date();
      this.customerRejectionReason = reason;
      break;
  }
  
  return this.save();
};

pharmacyOrderSchema.methods.supplyMedication = function(medicationIndex, quantity, notes = null) {
  if (medicationIndex >= 0 && medicationIndex < this.medications.length) {
    this.medications[medicationIndex].supplied = true;
    this.medications[medicationIndex].suppliedQuantity = quantity;
    this.medications[medicationIndex].suppliedAt = new Date();
    if (notes) {
      this.medications[medicationIndex].notes = notes;
    }
  }
  return this.save();
};

pharmacyOrderSchema.methods.getSuppliedMedications = function() {
  return this.medications.filter(med => med.supplied);
};

pharmacyOrderSchema.methods.getPendingMedications = function() {
  return this.medications.filter(med => !med.supplied);
};

export const PharmacyOrder = mongoose.model('PharmacyOrder', pharmacyOrderSchema);
export default PharmacyOrder;
