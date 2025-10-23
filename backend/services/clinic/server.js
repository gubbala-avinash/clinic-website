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
dotenv.config();

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

// Create appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const { patientName, doctorName, date, time, reason, phone, email } = req.body;
    
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
      // Create new patient
      patient = new User({
        firstName: patientName.split(' ')[0],
        lastName: patientName.split(' ')[1] || '',
        email: email || `${patientName.toLowerCase().replace(' ', '.')}@example.com`,
        phone: phone || '+91-0000000000',
        role: 'patient',
        password: 'temp123', // Will be changed on first login
        isActive: true
      });
      await patient.save();
    }
    
    // Find doctor
    const doctor = await User.findOne({ 
      role: 'doctor',
      $or: [
        { firstName: doctorName.split(' ')[1] },
        { lastName: doctorName.split(' ')[2] }
      ]
    });
    
    if (!doctor) {
      return res.status(400).json({
        error: 'Doctor not found',
        code: 'DOCTOR_NOT_FOUND'
      });
    }
    
    // Create appointment
    const appointment = new Appointment({
      appointmentId: `APT${Date.now()}`,
      patientId: patient._id,
      doctorId: doctor._id,
      scheduledAt: new Date(`${date}T${time}:00`),
      status: 'scheduled',
      reason: reason || 'General consultation',
      createdBy: req.user.userId
    });
    
    await appointment.save();
    
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

// Update appointment status
app.patch('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Mock appointment update
    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: { id, status }
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
    // Mock data
    const prescriptions = [
      {
        id: '1',
        patientName: 'Rahul Kumar',
        doctorName: 'Dr. Sarah Sharma',
        date: '2024-12-19',
        status: 'submitted',
        medications: ['Paracetamol 500mg', 'Amoxicillin 250mg']
      }
    ];
    
    res.json({
      success: true,
      data: prescriptions
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
    const { patientId, diagnosis, medications, tests, notes, whiteboardData } = req.body;
    
    // Mock prescription creation
    const prescription = {
      id: Date.now().toString(),
      patientId,
      diagnosis,
      medications: medications || [],
      tests: tests || [],
      notes,
      whiteboardData,
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: prescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      error: 'Failed to create prescription',
      code: 'CREATE_ERROR'
    });
  }
});

// Update prescription
app.patch('/api/prescriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    res.json({
      success: true,
      message: 'Prescription updated successfully',
      data: { id, ...updateData }
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
    // Mock pharmacy queue
    const queue = [
      {
        id: '1',
        prescriptionId: 'RX001',
        patientName: 'Rahul Kumar',
        medications: ['Paracetamol 500mg', 'Amoxicillin 250mg'],
        status: 'pending',
        priority: 'normal'
      }
    ];
    
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
    const { status, notes } = req.body;
    
    res.json({
      success: true,
      message: 'Prescription fulfillment updated',
      data: { id, status, notes }
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

