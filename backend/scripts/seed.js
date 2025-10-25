import bcrypt from 'bcryptjs';
import { connectDB } from '../services/shared/database.js';
import { User } from '../services/shared/models/User.js';
import { Appointment } from '../services/shared/models/Appointment.js';
import { Prescription } from '../services/shared/models/Prescription.js';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    
    // Create users
    console.log('👥 Creating users...');
    
    // Admin user
    const admin = new User({
      email: 'admin@clinic.com',
      password: await bcrypt.hash('admin123', 12),
      firstName: 'Admin',
      lastName: 'User',
      phone: '+91-9876543210',
      role: 'admin',
      isActive: true
    });
    await admin.save();
    
    // Doctor user
    const doctor = new User({
      email: 'dr.smith@clinic.com',
      password: await bcrypt.hash('doctor123', 12),
      firstName: 'Dr. John',
      lastName: 'Smith',
      phone: '+91-9876543211',
      role: 'doctor',
      isActive: true,
      doctorInfo: {
        qualification: 'MBBS, MD (General Medicine)',
        specialization: ['General Medicine', 'Cardiology'],
        licenseNumber: 'DOC12345',
        experience: 10,
        consultationFee: 500,
        availableSlots: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true },
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isActive: true },
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isActive: true },
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isActive: true },
          { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isActive: true }
        ]
      }
    });
    await doctor.save();
    
    // Receptionist user
    const receptionist = new User({
      email: 'reception@clinic.com',
      password: await bcrypt.hash('reception123', 12),
      firstName: 'Reception',
      lastName: 'Staff',
      phone: '+91-9876543212',
      role: 'receptionist',
      isActive: true
    });
    await receptionist.save();
    
    // Pharmacist user
    const pharmacist = new User({
      email: 'pharmacy@clinic.com',
      password: await bcrypt.hash('pharmacy123', 12),
      firstName: 'Pharmacy',
      lastName: 'Manager',
      phone: '+91-9876543213',
      role: 'pharmacy',
      isActive: true,
      pharmacistInfo: {
        licenseNumber: 'PHM12345',
        specialization: ['General Pharmacy', 'Clinical Pharmacy']
      }
    });
    await pharmacist.save();
    
    // Patient users
    const patient1 = new User({
      email: 'rahul@example.com',
      password: await bcrypt.hash('patient123', 12),
      firstName: 'Rahul',
      lastName: 'Kumar',
      phone: '+91-9876543214',
      role: 'patient',
      isActive: true,
      patientInfo: {
        dateOfBirth: new Date('1995-06-15'),
        gender: 'male',
        address: {
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        emergencyContact: {
          name: 'Priya Kumar',
          relationship: 'Wife',
          phone: '+91-9876543215'
        },
        medicalHistory: [
          {
            condition: 'Hypertension',
            diagnosisDate: new Date('2023-01-15'),
            status: 'active',
            notes: 'Controlled with medication'
          }
        ],
        allergies: [
          {
            allergen: 'Penicillin',
            severity: 'severe',
            reaction: 'Rash and breathing difficulty',
            notes: 'Avoid all penicillin-based antibiotics'
          }
        ],
        insurance: {
          provider: 'Health Insurance Co.',
          policyNumber: 'HI123456',
          expiryDate: new Date('2025-12-31'),
          coverage: 80
        }
      }
    });
    await patient1.save();
    
    const patient2 = new User({
      email: 'priya@example.com',
      password: await bcrypt.hash('patient123', 12),
      firstName: 'Priya',
      lastName: 'Singh',
      phone: '+91-9876543216',
      role: 'patient',
      isActive: true,
      patientInfo: {
        dateOfBirth: new Date('1988-03-22'),
        gender: 'female',
        address: {
          street: '456 Park Avenue',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India'
        },
        emergencyContact: {
          name: 'Raj Singh',
          relationship: 'Husband',
          phone: '+91-9876543217'
        },
        medicalHistory: [
          {
            condition: 'Diabetes Type 2',
            diagnosisDate: new Date('2022-08-10'),
            status: 'active',
            notes: 'Well controlled with diet and medication'
          }
        ],
        allergies: [],
        insurance: {
          provider: 'MediCare Insurance',
          policyNumber: 'MI789012',
          expiryDate: new Date('2025-06-30'),
          coverage: 90
        }
      }
    });
    await patient2.save();
    
    // Create appointments
    console.log('📅 Creating appointments...');
    
    const appointment1 = new Appointment({
      appointmentId: 'APT001',
      patientId: patient1._id,
      doctorId: doctor._id,
      scheduledAt: new Date('2024-12-20T10:00:00Z'),
      duration: 30,
      status: 'scheduled',
      type: 'consultation',
      reason: 'General checkup and blood pressure monitoring',
      notes: 'Patient has hypertension, monitor BP',
      consultationFee: 500,
      paymentStatus: 'pending',
      createdBy: receptionist._id
    });
    await appointment1.save();
    
    const appointment2 = new Appointment({
      appointmentId: 'APT002',
      patientId: patient2._id,
      doctorId: doctor._id,
      scheduledAt: new Date('2024-12-20T11:00:00Z'),
      duration: 30,
      status: 'confirmed',
      type: 'follow-up',
      reason: 'Diabetes follow-up and medication review',
      notes: 'Patient has diabetes, check blood sugar levels',
      consultationFee: 500,
      paymentStatus: 'paid',
      createdBy: receptionist._id
    });
    await appointment2.save();
    
    // Create prescriptions
    console.log('💊 Creating prescriptions...');
    
    const prescription1 = new Prescription({
      prescriptionId: 'RX001',
      appointmentId: appointment1._id,
      patientId: patient1._id,
      doctorId: doctor._id,
      diagnosis: 'Hypertension - Well controlled',
      symptoms: ['Elevated blood pressure', 'Mild headache'],
      medications: [
        {
          name: 'Amlodipine 5mg',
          genericName: 'Amlodipine Besylate',
          dosage: '5mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take with food',
          quantity: 30,
          unit: 'tablets'
        },
        {
          name: 'Losartan 50mg',
          genericName: 'Losartan Potassium',
          dosage: '50mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take in the morning',
          quantity: 30,
          unit: 'tablets'
        }
      ],
      tests: [
        {
          name: 'Blood Pressure Monitoring',
          type: 'blood',
          instructions: 'Check BP weekly',
          priority: 'routine'
        },
        {
          name: 'Lipid Profile',
          type: 'blood',
          instructions: 'Fasting blood test',
          priority: 'routine'
        }
      ],
      status: 'submitted',
      notes: 'Patient responding well to current medication. Continue current regimen.',
      followUpRequired: true,
      followUpDate: new Date('2025-01-20'),
      followUpNotes: 'Schedule follow-up in 1 month'
    });
    await prescription1.save();
    
    const prescription2 = new Prescription({
      prescriptionId: 'RX002',
      appointmentId: appointment2._id,
      patientId: patient2._id,
      doctorId: doctor._id,
      diagnosis: 'Diabetes Type 2 - Well controlled',
      symptoms: ['Elevated blood sugar', 'Increased thirst'],
      medications: [
        {
          name: 'Metformin 500mg',
          genericName: 'Metformin Hydrochloride',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '30 days',
          instructions: 'Take with meals',
          quantity: 60,
          unit: 'tablets'
        }
      ],
      tests: [
        {
          name: 'HbA1c',
          type: 'blood',
          instructions: 'Fasting blood test',
          priority: 'routine'
        },
        {
          name: 'Fasting Blood Sugar',
          type: 'blood',
          instructions: '12-hour fasting required',
          priority: 'routine'
        }
      ],
      status: 'draft',
      notes: 'Patient maintaining good blood sugar control. Continue current medication.',
      followUpRequired: true,
      followUpDate: new Date('2025-01-20'),
      followUpNotes: 'Schedule follow-up in 1 month'
    });
    await prescription2.save();
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Created:');
    console.log(`👥 Users: ${await User.countDocuments()}`);
    console.log(`📅 Appointments: ${await Appointment.countDocuments()}`);
    console.log(`💊 Prescriptions: ${await Prescription.countDocuments()}`);
    
    console.log('\n🔑 Test Credentials:');
    console.log('Admin: admin@clinic.com / admin123');
    console.log('Doctor: dr.smith@clinic.com / doctor123');
    console.log('Receptionist: reception@clinic.com / reception123');
    console.log('Pharmacy: pharmacy@clinic.com / pharmacy123');
    console.log('Patient 1: rahul@example.com / patient123');
    console.log('Patient 2: priya@example.com / patient123');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();

