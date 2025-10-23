# Clinic Management System - Database Schema Design

## 🏥 Overview

This document outlines the comprehensive database schema design for a professional clinic management system. Two complete schemas are provided:

1. **MongoDB Schema** (`mongodb-schemas.js`) - Document-based approach
2. **PostgreSQL Schema** (`postgresql-schema.sql`) - Relational approach

## 🎯 Design Principles

### **Professional Standards**
- **Medical-grade data integrity** with proper constraints
- **Audit trails** for all critical operations
- **Role-based access control** (RBAC) implementation
- **Scalable architecture** supporting growth
- **Performance optimization** with strategic indexing

### **Key Features**
- **Multi-role user management** (Admin, Doctor, Receptionist, Pharmacist, Patient)
- **Complete appointment lifecycle** management
- **Digital prescription system** with whiteboard support
- **Pharmacy workflow** integration
- **Inventory management** with real-time tracking
- **Comprehensive audit logging**
- **Notification system** with multiple channels

## 📊 Schema Architecture

### **Core Entities**

#### 1. **User Management**
```
Users (Base Entity)
├── Patients (Medical Records)
├── Doctors (Professional Info)
├── Pharmacists (License Info)
└── Admin/Receptionist (System Access)
```

#### 2. **Medical Data**
```
Patient Records
├── Medical History
├── Allergies
├── Current Medications
└── Vital Signs
```

#### 3. **Appointment System**
```
Appointments
├── Scheduling
├── Status Tracking
├── Doctor Availability
└── Billing Integration
```

#### 4. **Prescription Workflow**
```
Prescriptions
├── Digital Whiteboard
├── Medication Management
├── Test Orders
└── Pharmacy Integration
```

#### 5. **Pharmacy Operations**
```
Fulfillment Process
├── Inventory Management
├── Stock Tracking
├── Pricing
└── Movement Logs
```

## 🔧 MongoDB Schema Features

### **Document Structure**
- **Embedded documents** for related data (patient medical history)
- **Flexible schema** for evolving requirements
- **Array fields** for multiple values (allergies, medications)
- **Validation rules** with proper error handling

### **Key Collections**

#### **Users Collection**
```javascript
{
  _id: ObjectId,
  email: String (unique, validated),
  role: Enum ['admin', 'receptionist', 'doctor', 'pharmacist', 'patient'],
  profile: {
    firstName: String,
    lastName: String,
    phone: String (validated),
    // ... medical info
  },
  doctorInfo: { // Only for doctors
    qualification: String,
    specialization: [String],
    licenseNumber: String,
    consultationFee: Number
  }
}
```

#### **Appointments Collection**
```javascript
{
  _id: ObjectId,
  appointmentId: String (auto-generated: APT001, APT002),
  patientId: ObjectId,
  doctorId: ObjectId,
  scheduledAt: Date,
  status: Enum ['scheduled', 'confirmed', 'completed', 'cancelled'],
  // ... timing and billing fields
}
```

#### **Prescriptions Collection**
```javascript
{
  _id: ObjectId,
  prescriptionId: String (auto-generated: RX001, RX002),
  appointmentId: ObjectId,
  patientId: ObjectId,
  doctorId: ObjectId,
  diagnosis: String,
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  whiteboardData: String, // Base64 encoded drawing
  status: Enum ['draft', 'submitted', 'fulfilled']
}
```

### **MongoDB Advantages**
- **Flexible schema** for evolving medical requirements
- **Embedded documents** reduce joins
- **Array fields** for multiple medications/allergies
- **JSON-like structure** matches application data
- **Horizontal scaling** capabilities

## 🗄️ PostgreSQL Schema Features

### **Relational Structure**
- **Normalized tables** with proper foreign keys
- **ACID compliance** for data integrity
- **Complex queries** with JOINs and aggregations
- **Transaction support** for critical operations

### **Key Tables**

#### **Core Tables**
```sql
users (id, email, role, profile_info)
├── patients (user_id, patient_id, medical_info)
├── doctors (user_id, qualification, specialization)
├── pharmacists (user_id, license_number)
└── appointments (patient_id, doctor_id, scheduled_at)
```

#### **Medical Data Tables**
```sql
medical_history (patient_id, condition, diagnosis_date)
allergies (patient_id, allergen, severity)
current_medications (patient_id, medication_name, dosage)
vital_signs (patient_id, height, weight, blood_pressure)
```

#### **Prescription Tables**
```sql
prescriptions (appointment_id, diagnosis, whiteboard_data)
├── prescription_medications (medication_name, dosage, frequency)
└── prescription_tests (test_name, instructions, priority)
```

#### **Pharmacy Tables**
```sql
pharmacy_fulfillments (prescription_id, pharmacist_id, status)
├── fulfillment_items (medication_name, quantity, price)
└── inventory (medication_name, current_stock, pricing)
```

### **PostgreSQL Advantages**
- **ACID compliance** for medical data integrity
- **Complex queries** with JOINs and aggregations
- **Foreign key constraints** prevent orphaned records
- **Triggers and functions** for business logic
- **Full-text search** capabilities
- **JSON support** for flexible data

## 🔐 Security & Compliance

### **Data Protection**
- **Password hashing** with bcrypt
- **Role-based access control** (RBAC)
- **Audit logging** for all operations
- **Data encryption** at rest and in transit
- **GDPR compliance** for patient data

### **Medical Standards**
- **HIPAA-like compliance** for patient privacy
- **Audit trails** for prescription changes
- **Data retention** policies
- **Access logging** for security
- **Backup and recovery** procedures

## 📈 Performance Optimization

### **Indexing Strategy**

#### **MongoDB Indexes**
```javascript
// Compound indexes for common queries
{ patientId: 1, scheduledAt: 1 } // Appointments by patient
{ doctorId: 1, status: 1 } // Doctor's appointments
{ status: 1, createdAt: 1 } // Recent prescriptions
```

#### **PostgreSQL Indexes**
```sql
-- Performance indexes
CREATE INDEX idx_appointments_patient_doctor ON appointments(patient_id, doctor_id);
CREATE INDEX idx_prescriptions_status_date ON prescriptions(status, created_at);
CREATE INDEX idx_inventory_low_stock ON inventory(current_stock, minimum_stock);
```

### **Query Optimization**
- **Strategic indexing** for common queries
- **Query analysis** and optimization
- **Connection pooling** for scalability
- **Caching strategies** for frequently accessed data

## 🔄 Data Relationships

### **Entity Relationships**

```
Users (1) ──→ (1) Patients
Users (1) ──→ (1) Doctors
Users (1) ──→ (1) Pharmacists

Patients (1) ──→ (N) Appointments
Doctors (1) ──→ (N) Appointments
Appointments (1) ──→ (1) Prescriptions

Prescriptions (1) ──→ (N) Prescription_Medications
Prescriptions (1) ──→ (1) Pharmacy_Fulfillments
```

### **Business Logic Flow**

```
1. Patient Registration → User Account Creation
2. Appointment Booking → Doctor Assignment
3. Consultation → Prescription Creation
4. Prescription → Pharmacy Fulfillment
5. Inventory Management → Stock Updates
6. Audit Logging → All Operations Tracked
```

## 🚀 Implementation Guidelines

### **Database Selection**

#### **Choose MongoDB When:**
- **Rapid prototyping** and development
- **Flexible schema** requirements
- **Document-based** data structure
- **Horizontal scaling** needed
- **JSON-native** application stack

#### **Choose PostgreSQL When:**
- **ACID compliance** required
- **Complex queries** with JOINs
- **Data integrity** critical
- **Relational data** structure
- **Enterprise-grade** requirements

### **Migration Strategy**
1. **Start with MongoDB** for rapid development
2. **Implement PostgreSQL** for production
3. **Data synchronization** between systems
4. **Gradual migration** of critical data
5. **Performance testing** and optimization

## 📋 Schema Validation

### **Data Validation Rules**

#### **User Data**
- **Email format** validation
- **Phone number** format validation
- **Password strength** requirements
- **Role-based** field validation

#### **Medical Data**
- **Vital signs** range validation
- **Medication dosage** validation
- **Date consistency** checks
- **Required field** validation

#### **Business Logic**
- **Appointment scheduling** conflicts
- **Prescription validity** periods
- **Inventory stock** levels
- **Payment status** tracking

## 🔧 Maintenance & Monitoring

### **Database Maintenance**
- **Regular backups** with point-in-time recovery
- **Index optimization** and rebuilding
- **Query performance** monitoring
- **Storage optimization** and cleanup
- **Security updates** and patches

### **Monitoring Metrics**
- **Query performance** and slow queries
- **Connection pool** utilization
- **Storage usage** and growth
- **Error rates** and exceptions
- **User activity** patterns

## 📚 Additional Resources

### **Documentation**
- **API documentation** for data access
- **Schema migration** guides
- **Performance tuning** recommendations
- **Security best practices**
- **Backup and recovery** procedures

### **Tools & Libraries**
- **MongoDB**: Mongoose ODM, MongoDB Compass
- **PostgreSQL**: Prisma ORM, pgAdmin
- **Monitoring**: Prometheus, Grafana
- **Backup**: pg_dump, mongodump
- **Security**: bcrypt, JWT, OAuth2

---

## 🎯 Summary

This comprehensive schema design provides:

✅ **Medical-grade data integrity**  
✅ **Scalable architecture** for growth  
✅ **Role-based security** implementation  
✅ **Complete audit trails** for compliance  
✅ **Performance optimization** strategies  
✅ **Flexible deployment** options  

The schemas are production-ready and follow industry best practices for healthcare applications. Choose the approach that best fits your technical requirements and team expertise.
