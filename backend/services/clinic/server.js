import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from '../shared/database.js';
import { User } from '../shared/models/User.js';
import { Appointment } from '../shared/models/Appointment.js';
import { Prescription } from '../shared/models/Prescription.js';

// Load environment variables
dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.CLINIC_PORT || 3001;

// ===========================================
// MIDDLEWARE SETUP
// ===========================================

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ===========================================
// DATABASE CONNECTION
// ===========================================

await connectDB();

// ===========================================
// APPOINTMENT ROUTES
// ===========================================

// Get appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'firstName lastName email phone')
      .populate('doctorId', 'firstName lastName email')
      .sort({ scheduledAt: -1 })
      .limit(100);
    
    const formattedAppointments = appointments.map(apt => ({
      id: apt._id,
      patientName: `${apt.patientId.firstName} ${apt.patientId.lastName}`,
      doctorName: `Dr. ${apt.doctorId.firstName} ${apt.doctorId.lastName}`,
      date: apt.scheduledAt.toISOString().split('T')[0],
      time: apt.scheduledAt.toTimeString().split(' ')[0].substring(0, 5),
      status: apt.status,
      reason: apt.reason,
      phone: apt.patientId.phone,
      email: apt.patientId.email
    }));
    
    res.json({
      success: true,
      data: formattedAppointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      error: 'Failed to fetch appointments',
      code: 'FETCH_ERROR'
    });
  }
});

// ===========================================
// PUBLIC ROUTES (No Authentication Required)
// ===========================================

// Health check for clinic service
app.get('/api/public/health', (req, res) => {
  console.log('Clinic Service: Health check requested');
  res.json({ 
    success: true, 
    message: 'Clinic service is running',
    timestamp: new Date().toISOString()
  });
});

// Public appointment booking (for frontend booking page)
app.post('/api/public/appointments', async (req, res) => {
  try {
    console.log('=== CLINIC SERVICE: Public appointment request received ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    console.log('========================================================');
    
    const { patientName, doctorName, date, time, reason, phone, email } = req.body;
    
    console.log('Creating appointment with data:', { patientName, doctorName, date, time, reason, phone, email });
    
    // Validation
    if (!patientName || !doctorName || !date || !time) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'MISSING_FIELDS'
      });
    }
    
    // Find or create patient
    let patient = await User.findOne({ 
      $or: [
        { email: email },
        { firstName: patientName.split(' ')[0], lastName: patientName.split(' ')[1] }
      ]
    });
    
    if (!patient) {
      console.log('Creating new patient...');
      // Hash password for patient
      const bcrypt = require('bcryptjs');
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash('patient123', saltRounds);
      
      // Create new patient
      patient = new User({
        firstName: patientName.split(' ')[0],
        lastName: patientName.split(' ')[1] || '',
        email: email || `${patientName.toLowerCase().replace(' ', '.')}@example.com`,
        phone: phone || '+91-0000000000',
        role: 'patient',
        password: hashedPassword,
        isActive: true
      });
      await patient.save();
      console.log('Patient created successfully');
    } else {
      console.log('Found existing patient');
    }
    
    // Find doctor by name (improved logic)
    const doctorNameParts = doctorName.replace('Dr. ', '').split(' ');
    const doctor = await User.findOne({ 
      role: 'doctor',
      $or: [
        { firstName: doctorNameParts[0], lastName: doctorNameParts[1] },
        { firstName: doctorNameParts[0] },
        { lastName: doctorNameParts[1] }
      ]
    });
    
    if (!doctor) {
      console.log('Doctor not found, using first available doctor');
      // If doctor not found, use the first available doctor
      const firstDoctor = await User.findOne({ role: 'doctor', isActive: true });
      if (!firstDoctor) {
        return res.status(400).json({
          error: 'No doctors available',
          code: 'NO_DOCTORS_AVAILABLE'
        });
      }
      doctor = firstDoctor;
    }
    
    console.log('Using doctor:', doctor.firstName, doctor.lastName);
    
    // Create appointment
    const appointment = new Appointment({
      appointmentId: `APT${Date.now()}`,
      patientId: patient._id,
      doctorId: doctor._id,
      scheduledAt: new Date(`${date}T${time}:00`),
      status: 'scheduled',
      reason: reason || 'General consultation',
      createdBy: patient._id // Use patient ID as creator for public bookings
    });
    
    console.log('Saving appointment to database...');
    await appointment.save();
    console.log('Appointment saved successfully');
    
    // Populate the response
    await appointment.populate('patientId', 'firstName lastName email phone');
    await appointment.populate('doctorId', 'firstName lastName email');
    
    const formattedAppointment = {
      id: appointment._id,
      patientName: `${appointment.patientId.firstName} ${appointment.patientId.lastName}`,
      doctorName: `Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`,
      date: appointment.scheduledAt.toISOString().split('T')[0],
      time: appointment.scheduledAt.toTimeString().split(' ')[0].substring(0, 5),
      status: appointment.status,
      reason: appointment.reason,
      phone: appointment.patientId.phone,
      email: appointment.patientId.email
    };
    
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: formattedAppointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      error: 'Failed to create appointment',
      code: 'CREATE_ERROR'
    });
  }
});

// Public doctors list (for booking page)
app.get('/api/public/doctors', async (req, res) => {
  try {
    console.log('Clinic Service: Public doctors request received');
    
    const doctors = await User.find({ 
      role: 'doctor', 
      isActive: true 
    }).select('firstName lastName email doctorInfo');

    const formattedDoctors = doctors.map(doctor => ({
      id: doctor._id,
      name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      email: doctor.email,
      specialty: doctor.doctorInfo?.specialization?.[0] || 'General Medicine',
      experience: doctor.doctorInfo?.experience || 0,
      qualification: doctor.doctorInfo?.qualification || '',
      consultationFee: doctor.doctorInfo?.consultationFee || 500,
      rating: 4.8 // Default rating
    }));
    
    res.json({
      success: true,
      data: formattedDoctors
    });
  } catch (error) {
    console.error('Get public doctors error:', error);
    res.status(500).json({
      error: 'Failed to fetch doctors',
      code: 'FETCH_ERROR'
    });
  }
});

// ===========================================
// PROTECTED ROUTES (Authentication Required)
// ===========================================

// Get appointment by ID
app.get('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id)
      .populate('patientId', 'firstName lastName email phone patientInfo')
      .populate('doctorId', 'firstName lastName email doctorInfo')
      .populate('createdBy', 'firstName lastName email role');
    
    if (!appointment) {
      return res.status(404).json({
        error: 'Appointment not found',
        code: 'APPOINTMENT_NOT_FOUND'
      });
    }
    
    const detailedAppointment = {
      id: appointment._id,
      appointmentId: appointment.appointmentId,
      patient: {
        id: appointment.patientId._id,
        name: `${appointment.patientId.firstName} ${appointment.patientId.lastName}`,
        email: appointment.patientId.email,
        phone: appointment.patientId.phone,
        info: appointment.patientId.patientInfo
      },
      doctor: {
        id: appointment.doctorId._id,
        name: `Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`,
        email: appointment.doctorId.email,
        info: appointment.doctorId.doctorInfo
      },
      createdBy: {
        id: appointment.createdBy._id,
        name: `${appointment.createdBy.firstName} ${appointment.createdBy.lastName}`,
        email: appointment.createdBy.email,
        role: appointment.createdBy.role
      },
      scheduledAt: appointment.scheduledAt,
      duration: appointment.duration,
      status: appointment.status,
      type: appointment.type,
      reason: appointment.reason,
      notes: appointment.notes,
      checkedInAt: appointment.checkedInAt,
      startedAt: appointment.startedAt,
      completedAt: appointment.completedAt,
      consultationFee: appointment.consultationFee,
      paymentStatus: appointment.paymentStatus,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    };
    
    res.json({
      success: true,
      data: detailedAppointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      error: 'Failed to fetch appointment',
      code: 'FETCH_ERROR'
    });
  }
});

// Update appointment status
app.patch('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, consultationFee, paymentStatus } = req.body;
    
    // Find appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        error: 'Appointment not found',
        code: 'APPOINTMENT_NOT_FOUND'
      });
    }
    
    // Update appointment
    appointment.status = status;
    if (notes) appointment.notes = notes;
    if (consultationFee !== undefined) appointment.consultationFee = consultationFee;
    if (paymentStatus) appointment.paymentStatus = paymentStatus;
    
    // Set timing fields based on status
    switch (status) {
      case 'checked-in':
        appointment.checkedInAt = new Date();
        break;
      case 'in-progress':
        appointment.startedAt = new Date();
        break;
      case 'completed':
        appointment.completedAt = new Date();
        break;
    }
    
    await appointment.save();
    
    // Populate the response
    await appointment.populate('patientId', 'firstName lastName email phone');
    await appointment.populate('doctorId', 'firstName lastName email');
    
    const formattedAppointment = {
      id: appointment._id,
      appointmentId: appointment.appointmentId,
      patientName: `${appointment.patientId.firstName} ${appointment.patientId.lastName}`,
      doctorName: `Dr. ${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`,
      date: appointment.scheduledAt.toISOString().split('T')[0],
      time: appointment.scheduledAt.toTimeString().split(' ')[0].substring(0, 5),
      status: appointment.status,
      reason: appointment.reason,
      notes: appointment.notes,
      consultationFee: appointment.consultationFee,
      paymentStatus: appointment.paymentStatus,
      phone: appointment.patientId.phone,
      email: appointment.patientId.email,
      checkedInAt: appointment.checkedInAt,
      startedAt: appointment.startedAt,
      completedAt: appointment.completedAt,
      updatedAt: appointment.updatedAt
    };
    
    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: formattedAppointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      error: 'Failed to update appointment',
      code: 'UPDATE_ERROR'
    });
  }
});

// ===========================================
// PRESCRIPTION ROUTES
// ===========================================

// Get prescriptions
app.get('/api/prescriptions', async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('patientId', 'firstName lastName email phone')
      .populate('doctorId', 'firstName lastName email')
      .populate('appointmentId', 'appointmentId scheduledAt')
      .sort({ createdAt: -1 })
      .limit(100);
    
    const formattedPrescriptions = prescriptions.map(prescription => ({
      id: prescription._id,
      prescriptionId: prescription.prescriptionId,
      patientName: `${prescription.patientId.firstName} ${prescription.patientId.lastName}`,
      doctorName: `Dr. ${prescription.doctorId.firstName} ${prescription.doctorId.lastName}`,
      date: prescription.createdAt.toISOString().split('T')[0],
      status: prescription.status,
      diagnosis: prescription.diagnosis,
      medications: prescription.medications.map(med => `${med.name} ${med.dosage} - ${med.frequency}`),
      medicationCount: prescription.medications.length,
      testCount: prescription.tests.length,
      phone: prescription.patientId.phone,
      email: prescription.patientId.email,
      appointmentId: prescription.appointmentId?.appointmentId,
      createdAt: prescription.createdAt
    }));
    
    res.json({
      success: true,
      data: formattedPrescriptions
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      error: 'Failed to fetch prescriptions',
      code: 'FETCH_ERROR'
    });
  }
});

// Create prescription
app.post('/api/prescriptions', async (req, res) => {
  try {
    const { 
      patientId, 
      doctorId, 
      appointmentId, 
      diagnosis, 
      symptoms,
      medications, 
      tests, 
      notes, 
      whiteboardData,
      followUpRequired,
      followUpDate,
      followUpNotes
    } = req.body;
    
    // Validation
    if (!patientId || !doctorId || !diagnosis) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'MISSING_FIELDS'
      });
    }
    
    // Generate prescription ID
    const prescriptionId = `RX${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Create prescription
    const prescription = new Prescription({
      prescriptionId,
      patientId,
      doctorId,
      appointmentId,
      diagnosis,
      symptoms: symptoms || [],
      medications: medications || [],
      tests: tests || [],
      notes,
      whiteboardData,
      followUpRequired: followUpRequired || false,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      followUpNotes,
      status: 'draft'
    });
    
    await prescription.save();
    
    // Populate the response
    await prescription.populate('patientId', 'firstName lastName email phone');
    await prescription.populate('doctorId', 'firstName lastName email');
    await prescription.populate('appointmentId', 'appointmentId scheduledAt');
    
    const formattedPrescription = {
      id: prescription._id,
      prescriptionId: prescription.prescriptionId,
      patientName: `${prescription.patientId.firstName} ${prescription.patientId.lastName}`,
      doctorName: `Dr. ${prescription.doctorId.firstName} ${prescription.doctorId.lastName}`,
      date: prescription.createdAt.toISOString().split('T')[0],
      status: prescription.status,
      diagnosis: prescription.diagnosis,
      medications: prescription.medications.map(med => `${med.name} ${med.dosage} - ${med.frequency}`),
      medicationCount: prescription.medications.length,
      testCount: prescription.tests.length,
      phone: prescription.patientId.phone,
      email: prescription.patientId.email,
      appointmentId: prescription.appointmentId?.appointmentId,
      createdAt: prescription.createdAt
    };
    
    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: formattedPrescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      error: 'Failed to create prescription',
      code: 'CREATE_ERROR'
    });
  }
});

// Get prescription by ID
app.get('/api/prescriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const prescription = await Prescription.findById(id)
      .populate('patientId', 'firstName lastName email phone patientInfo')
      .populate('doctorId', 'firstName lastName email doctorInfo')
      .populate('appointmentId', 'appointmentId scheduledAt reason')
      .populate('pharmacyId', 'firstName lastName email');
    
    if (!prescription) {
      return res.status(404).json({
        error: 'Prescription not found',
        code: 'PRESCRIPTION_NOT_FOUND'
      });
    }
    
    const detailedPrescription = {
      id: prescription._id,
      prescriptionId: prescription.prescriptionId,
      patient: {
        id: prescription.patientId._id,
        name: `${prescription.patientId.firstName} ${prescription.patientId.lastName}`,
        email: prescription.patientId.email,
        phone: prescription.patientId.phone,
        info: prescription.patientId.patientInfo
      },
      doctor: {
        id: prescription.doctorId._id,
        name: `Dr. ${prescription.doctorId.firstName} ${prescription.doctorId.lastName}`,
        email: prescription.doctorId.email,
        info: prescription.doctorId.doctorInfo
      },
      appointment: prescription.appointmentId ? {
        id: prescription.appointmentId._id,
        appointmentId: prescription.appointmentId.appointmentId,
        scheduledAt: prescription.appointmentId.scheduledAt,
        reason: prescription.appointmentId.reason
      } : null,
      pharmacist: prescription.pharmacyId ? {
        id: prescription.pharmacyId._id,
        name: `${prescription.pharmacyId.firstName} ${prescription.pharmacyId.lastName}`,
        email: prescription.pharmacyId.email
      } : null,
      diagnosis: prescription.diagnosis,
      symptoms: prescription.symptoms,
      medications: prescription.medications,
      tests: prescription.tests,
      whiteboardData: prescription.whiteboardData,
      prescriptionImage: prescription.prescriptionImage,
      prescriptionPdf: prescription.prescriptionPdf,
      status: prescription.status,
      followUpRequired: prescription.followUpRequired,
      followUpDate: prescription.followUpDate,
      followUpNotes: prescription.followUpNotes,
      notes: prescription.notes,
      sentToPharmacyAt: prescription.sentToPharmacyAt,
      fulfilledAt: prescription.fulfilledAt,
      createdAt: prescription.createdAt,
      updatedAt: prescription.updatedAt
    };
    
    res.json({
      success: true,
      data: detailedPrescription
    });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({
      error: 'Failed to fetch prescription',
      code: 'FETCH_ERROR'
    });
  }
});

// Update prescription
app.patch('/api/prescriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Find and update prescription
    const prescription = await Prescription.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    .populate('patientId', 'firstName lastName email phone')
    .populate('doctorId', 'firstName lastName email')
    .populate('appointmentId', 'appointmentId scheduledAt');
    
    if (!prescription) {
      return res.status(404).json({
        error: 'Prescription not found',
        code: 'PRESCRIPTION_NOT_FOUND'
      });
    }
    
    const formattedPrescription = {
      id: prescription._id,
      prescriptionId: prescription.prescriptionId,
      patientName: `${prescription.patientId.firstName} ${prescription.patientId.lastName}`,
      doctorName: `Dr. ${prescription.doctorId.firstName} ${prescription.doctorId.lastName}`,
      date: prescription.createdAt.toISOString().split('T')[0],
      status: prescription.status,
      diagnosis: prescription.diagnosis,
      medications: prescription.medications.map(med => `${med.name} ${med.dosage} - ${med.frequency}`),
      medicationCount: prescription.medications.length,
      testCount: prescription.tests.length,
      phone: prescription.patientId.phone,
      email: prescription.patientId.email,
      appointmentId: prescription.appointmentId?.appointmentId,
      createdAt: prescription.createdAt,
      updatedAt: prescription.updatedAt
    };
    
    res.json({
      success: true,
      message: 'Prescription updated successfully',
      data: formattedPrescription
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({
      error: 'Failed to update prescription',
      code: 'UPDATE_ERROR'
    });
  }
});

// ===========================================
// PHARMACY ROUTES
// ===========================================

// Get pharmacy queue
app.get('/api/pharmacy', async (req, res) => {
  try {
    // Get prescriptions that are sent to pharmacy or pending fulfillment
    const prescriptions = await Prescription.find({
      status: { $in: ['sent-to-pharmacy', 'fulfilled'] }
    })
    .populate('patientId', 'firstName lastName email phone')
    .populate('doctorId', 'firstName lastName email')
    .populate('pharmacyId', 'firstName lastName email')
    .sort({ sentToPharmacyAt: -1, createdAt: -1 })
    .limit(100);
    
    const queue = prescriptions.map(prescription => ({
      id: prescription._id,
      prescriptionId: prescription.prescriptionId,
      patientName: `${prescription.patientId.firstName} ${prescription.patientId.lastName}`,
      doctorName: `Dr. ${prescription.doctorId.firstName} ${prescription.doctorId.lastName}`,
      pharmacistName: prescription.pharmacyId ? `${prescription.pharmacyId.firstName} ${prescription.pharmacyId.lastName}` : null,
      medications: prescription.medications.map(med => `${med.name} ${med.dosage} - ${med.frequency}`),
      medicationCount: prescription.medications.length,
      status: prescription.status,
      priority: prescription.tests.some(test => test.priority === 'urgent' || test.priority === 'stat') ? 'high' : 'normal',
      sentToPharmacyAt: prescription.sentToPharmacyAt,
      fulfilledAt: prescription.fulfilledAt,
      createdAt: prescription.createdAt,
      phone: prescription.patientId.phone,
      email: prescription.patientId.email,
      diagnosis: prescription.diagnosis
    }));
    
    res.json({
      success: true,
      data: queue
    });
  } catch (error) {
    console.error('Get pharmacy queue error:', error);
    res.status(500).json({
      error: 'Failed to fetch pharmacy queue',
      code: 'FETCH_ERROR'
    });
  }
});

// Fulfill prescription
app.patch('/api/pharmacy/:id/fulfill', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, pharmacyId } = req.body;
    
    // Find prescription
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({
        error: 'Prescription not found',
        code: 'PRESCRIPTION_NOT_FOUND'
      });
    }
    
    // Update prescription status
    prescription.status = status;
    if (pharmacyId) {
      prescription.pharmacyId = pharmacyId;
    }
    if (notes) {
      prescription.notes = notes;
    }
    
    // Set timing fields based on status
    if (status === 'sent-to-pharmacy') {
      prescription.sentToPharmacyAt = new Date();
    } else if (status === 'fulfilled') {
      prescription.fulfilledAt = new Date();
    }
    
    await prescription.save();
    
    // Populate the response
    await prescription.populate('patientId', 'firstName lastName email phone');
    await prescription.populate('doctorId', 'firstName lastName email');
    await prescription.populate('pharmacyId', 'firstName lastName email');
    
    const formattedPrescription = {
      id: prescription._id,
      prescriptionId: prescription.prescriptionId,
      patientName: `${prescription.patientId.firstName} ${prescription.patientId.lastName}`,
      doctorName: `Dr. ${prescription.doctorId.firstName} ${prescription.doctorId.lastName}`,
      pharmacistName: prescription.pharmacyId ? `${prescription.pharmacyId.firstName} ${prescription.pharmacyId.lastName}` : null,
      status: prescription.status,
      sentToPharmacyAt: prescription.sentToPharmacyAt,
      fulfilledAt: prescription.fulfilledAt,
      notes: prescription.notes,
      updatedAt: prescription.updatedAt
    };
    
    res.json({
      success: true,
      message: 'Prescription fulfillment updated',
      data: formattedPrescription
    });
  } catch (error) {
    console.error('Fulfill prescription error:', error);
    res.status(500).json({
      error: 'Failed to update fulfillment',
      code: 'UPDATE_ERROR'
    });
  }
});

// ===========================================
// ANALYTICS ROUTES
// ===========================================

// Get dashboard analytics
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    // Get real data from database
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalAppointments = await Appointment.countDocuments();
    const totalPrescriptions = await Prescription.countDocuments();
    
    // Calculate revenue (assuming average consultation fee)
    const appointments = await Appointment.find({ status: 'completed' });
    const revenue = appointments.reduce((sum, apt) => sum + (apt.consultationFee || 500), 0);
    
    // Get appointments by day for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const appointmentsByDay = await Appointment.aggregate([
      {
        $match: {
          scheduledAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$scheduledAt' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          day: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 1] }, then: 'Sun' },
                { case: { $eq: ['$_id', 2] }, then: 'Mon' },
                { case: { $eq: ['$_id', 3] }, then: 'Tue' },
                { case: { $eq: ['$_id', 4] }, then: 'Wed' },
                { case: { $eq: ['$_id', 5] }, then: 'Thu' },
                { case: { $eq: ['$_id', 6] }, then: 'Fri' },
                { case: { $eq: ['$_id', 7] }, then: 'Sat' }
              ],
              default: 'Unknown'
            }
          },
          count: 1
        }
      }
    ]);
    
    // Get revenue by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const revenueByMonth = await Appointment.aggregate([
      {
        $match: {
          scheduledAt: { $gte: sixMonthsAgo },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$scheduledAt' },
            month: { $month: '$scheduledAt' }
          },
          revenue: { $sum: '$consultationFee' }
        }
      },
      {
        $project: {
          month: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id.month', 1] }, then: 'Jan' },
                { case: { $eq: ['$_id.month', 2] }, then: 'Feb' },
                { case: { $eq: ['$_id.month', 3] }, then: 'Mar' },
                { case: { $eq: ['$_id.month', 4] }, then: 'Apr' },
                { case: { $eq: ['$_id.month', 5] }, then: 'May' },
                { case: { $eq: ['$_id.month', 6] }, then: 'Jun' },
                { case: { $eq: ['$_id.month', 7] }, then: 'Jul' },
                { case: { $eq: ['$_id.month', 8] }, then: 'Aug' },
                { case: { $eq: ['$_id.month', 9] }, then: 'Sep' },
                { case: { $eq: ['$_id.month', 10] }, then: 'Oct' },
                { case: { $eq: ['$_id.month', 11] }, then: 'Nov' },
                { case: { $eq: ['$_id.month', 12] }, then: 'Dec' }
              ],
              default: 'Unknown'
            }
          },
          revenue: 1
        }
      }
    ]);
    
    const analytics = {
      totalPatients,
      totalAppointments,
      totalPrescriptions,
      revenue,
      charts: {
        appointmentsByDay: appointmentsByDay.length > 0 ? appointmentsByDay : [
          { day: 'Mon', count: 0 },
          { day: 'Tue', count: 0 },
          { day: 'Wed', count: 0 },
          { day: 'Thu', count: 0 },
          { day: 'Fri', count: 0 },
          { day: 'Sat', count: 0 },
          { day: 'Sun', count: 0 }
        ],
        revenueByMonth: revenueByMonth.length > 0 ? revenueByMonth : [
          { month: 'Jan', revenue: 0 },
          { month: 'Feb', revenue: 0 },
          { month: 'Mar', revenue: 0 },
          { month: 'Apr', revenue: 0 },
          { month: 'May', revenue: 0 },
          { month: 'Jun', revenue: 0 }
        ]
      }
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      code: 'FETCH_ERROR'
    });
  }
});

// ===========================================
// DOCTOR ROUTES
// ===========================================

// Get all doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', isActive: true })
      .select('firstName lastName email doctorInfo')
      .sort({ firstName: 1 });
    
    const formattedDoctors = doctors.map(doctor => ({
      id: doctor._id,
      name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      email: doctor.email,
      specialty: doctor.doctorInfo?.specialization?.[0] || 'General Medicine',
      experience: doctor.doctorInfo?.experience || 0,
      qualification: doctor.doctorInfo?.qualification || '',
      consultationFee: doctor.doctorInfo?.consultationFee || 500,
      rating: 4.8 // Default rating, can be calculated from reviews later
    }));
    
    res.json({
      success: true,
      data: formattedDoctors
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      error: 'Failed to fetch doctors',
      code: 'FETCH_ERROR'
    });
  }
});

// ===========================================
// USER MANAGEMENT ROUTES (Admin only)
// ===========================================

// Create new doctor account
app.post('/api/admin/doctors', async (req, res) => {
  try {
    console.log('Clinic Service: Doctor creation request received');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      qualification, 
      specialization, 
      experience, 
      licenseNumber, 
      consultationFee 
    } = req.body;
    
    console.log('Creating doctor with data:', { firstName, lastName, email, phone });
    
    // Validation
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'MISSING_FIELDS'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        code: 'USER_EXISTS'
      });
    }
    
    // Hash the password
    const bcrypt = require('bcryptjs');
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash('doctor123', saltRounds);
    
    // Create doctor
    const doctor = new User({
      firstName,
      lastName,
      email,
      phone,
      role: 'doctor',
      password: hashedPassword,
      isActive: true,
      doctorInfo: {
        qualification: qualification || '',
        specialization: Array.isArray(specialization) ? specialization : (specialization ? [specialization] : ['General Medicine']),
        licenseNumber: licenseNumber || '',
        experience: experience || 0,
        consultationFee: consultationFee || 500
      }
    });
    
    console.log('Saving doctor to database...');
    await doctor.save();
    console.log('Doctor saved successfully');
    
    // Remove password from response
    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully',
      data: doctorResponse
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({
      error: 'Failed to create doctor account',
      code: 'CREATE_ERROR'
    });
  }
});

// Create new receptionist account
app.post('/api/admin/receptionists', async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    
    console.log('Creating receptionist with data:', { firstName, lastName, email, phone });
    
    // Validation
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'MISSING_FIELDS'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        code: 'USER_EXISTS'
      });
    }
    
    // Hash the password
    const bcrypt = require('bcryptjs');
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash('doctor123', saltRounds);
    
    // Create receptionist
    const receptionist = new User({
      firstName,
      lastName,
      email,
      phone,
      role: 'receptionist',
      password: hashedPassword,
      isActive: true
    });
    
    console.log('Saving receptionist to database...');
    await receptionist.save();
    console.log('Receptionist saved successfully');
    
    // Remove password from response
    const receptionistResponse = receptionist.toObject();
    delete receptionistResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'Receptionist account created successfully',
      data: receptionistResponse
    });
  } catch (error) {
    console.error('Create receptionist error:', error);
    res.status(500).json({
      error: 'Failed to create receptionist account',
      code: 'CREATE_ERROR'
    });
  }
});

// ===========================================
// PATIENT ROUTES
// ===========================================

// Get all patients
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      data: patients
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      error: 'Failed to fetch patients',
      code: 'FETCH_ERROR'
    });
  }
});

// Get patient by ID
app.get('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await User.findOne({ _id: id, role: 'patient' })
      .select('-password');
    
    if (!patient) {
      return res.status(404).json({
        error: 'Patient not found',
        code: 'PATIENT_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      error: 'Failed to fetch patient',
      code: 'FETCH_ERROR'
    });
  }
});

// Create new patient
app.post('/api/patients', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, dateOfBirth, gender, address } = req.body;
    
    // Validation
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'MISSING_FIELDS'
      });
    }
    
    // Check if patient already exists
    const existingPatient = await User.findOne({ email, role: 'patient' });
    if (existingPatient) {
      return res.status(409).json({
        error: 'Patient already exists',
        code: 'PATIENT_EXISTS'
      });
    }
    
    // Create patient
    const patient = new User({
      firstName,
      lastName,
      email,
      phone,
      role: 'patient',
      password: 'temp123', // Will be changed on first login
      isActive: true,
      patientInfo: {
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        address: address ? {
          street: address.street || '',
          city: address.city || '',
          state: address.state || '',
          zipCode: address.zipCode || '',
          country: address.country || 'India'
        } : undefined
      }
    });
    
    await patient.save();
    
    // Remove password from response
    const patientResponse = patient.toObject();
    delete patientResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: patientResponse
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({
      error: 'Failed to create patient',
      code: 'CREATE_ERROR'
    });
  }
});

// Update patient
app.patch('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove password from update data
    delete updateData.password;
    
    const patient = await User.findOneAndUpdate(
      { _id: id, role: 'patient' },
      updateData,
      { new: true, select: '-password' }
    );
    
    if (!patient) {
      return res.status(404).json({
        error: 'Patient not found',
        code: 'PATIENT_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: patient
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({
      error: 'Failed to update patient',
      code: 'UPDATE_ERROR'
    });
  }
});

// Delete patient
app.delete('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const patient = await User.findOneAndDelete({ _id: id, role: 'patient' });
    
    if (!patient) {
      return res.status(404).json({
        error: 'Patient not found',
        code: 'PATIENT_NOT_FOUND'
      });
    }
    
    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      error: 'Failed to delete patient',
      code: 'DELETE_ERROR'
    });
  }
});

// ===========================================
// NOTIFICATION ROUTES
// ===========================================

// Send notification
app.post('/api/notifications', async (req, res) => {
  try {
    const { type, recipient, message, data } = req.body;
    
    // Mock notification sending
    res.json({
      success: true,
      message: 'Notification sent successfully',
      data: { type, recipient, message }
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      error: 'Failed to send notification',
      code: 'SEND_ERROR'
    });
  }
});

// ===========================================
// HEALTH CHECK
// ===========================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Clinic Service',
    version: '1.0.0'
  });
});

// ===========================================
// ERROR HANDLING
// ===========================================

app.use((err, req, res, next) => {
  console.error('Clinic service error:', err);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND'
  });
});

// ===========================================
// START SERVER
// ===========================================

app.listen(PORT, () => {
  console.log(`🏥 Clinic Service running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

