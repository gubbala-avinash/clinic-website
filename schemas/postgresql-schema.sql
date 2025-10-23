-- ===========================================
-- CLINIC MANAGEMENT SYSTEM - POSTGRESQL SCHEMA
-- Professional database design with proper relationships, constraints, and indexing
-- ===========================================

-- Enable UUID extension for better primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ===========================================
-- ENUMS AND TYPES
-- ===========================================

-- User roles
CREATE TYPE user_role AS ENUM ('admin', 'receptionist', 'doctor', 'pharmacist', 'patient');

-- Gender options
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');

-- Appointment status
CREATE TYPE appointment_status AS ENUM (
    'scheduled', 'confirmed', 'checked-in', 'in-progress', 
    'completed', 'cancelled', 'no-show'
);

-- Prescription status
CREATE TYPE prescription_status AS ENUM (
    'draft', 'submitted', 'sent-to-pharmacy', 'fulfilled', 'cancelled'
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
    'pending', 'paid', 'partial', 'waived', 'refunded'
);

-- Notification types
CREATE TYPE notification_type AS ENUM (
    'info', 'success', 'warning', 'error', 'appointment', 'prescription'
);

-- ===========================================
-- CORE TABLES
-- ===========================================

-- Users table (all system users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Profile information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    gender gender_type,
    
    -- Address
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_zip_code VARCHAR(20),
    address_country VARCHAR(100) DEFAULT 'India',
    
    -- Emergency contact
    emergency_contact_name VARCHAR(100),
    emergency_contact_relationship VARCHAR(50),
    emergency_contact_phone VARCHAR(20),
    
    -- Preferences
    language VARCHAR(5) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (phone ~ '^\+?[\d\s\-\(\)]+$')
);

-- Patients table (extends users)
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id VARCHAR(20) UNIQUE NOT NULL, -- P001, P002, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Insurance information
    insurance_provider VARCHAR(100),
    insurance_policy_number VARCHAR(50),
    insurance_expiry_date DATE,
    insurance_coverage INTEGER CHECK (insurance_coverage >= 0 AND insurance_coverage <= 100)
);

-- Doctors table (extends users)
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    qualification VARCHAR(255) NOT NULL,
    specialization TEXT[],
    license_number VARCHAR(50) UNIQUE NOT NULL,
    experience_years INTEGER DEFAULT 0,
    consultation_fee DECIMAL(10,2) DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pharmacists table (extends users)
CREATE TABLE pharmacists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    specialization TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- MEDICAL DATA TABLES
-- ===========================================

-- Medical history
CREATE TABLE medical_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    condition VARCHAR(255) NOT NULL,
    diagnosis_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'chronic')),
    notes TEXT,
    doctor_id UUID REFERENCES doctors(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Allergies
CREATE TABLE allergies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    allergen VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
    reaction TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Current medications
CREATE TABLE current_medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    prescribed_by UUID REFERENCES doctors(id),
    prescribed_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vital signs
CREATE TABLE vital_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    recorded_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,
    temperature_celsius DECIMAL(4,2),
    recorded_by UUID REFERENCES users(id),
    
    -- Constraints
    CONSTRAINT valid_height CHECK (height_cm > 0 AND height_cm < 300),
    CONSTRAINT valid_weight CHECK (weight_kg > 0 AND weight_kg < 500),
    CONSTRAINT valid_bp_systolic CHECK (blood_pressure_systolic > 0 AND blood_pressure_systolic < 300),
    CONSTRAINT valid_bp_diastolic CHECK (blood_pressure_diastolic > 0 AND blood_pressure_diastolic < 200),
    CONSTRAINT valid_heart_rate CHECK (heart_rate > 0 AND heart_rate < 300),
    CONSTRAINT valid_temperature CHECK (temperature_celsius > 30 AND temperature_celsius < 50)
);

-- ===========================================
-- APPOINTMENT MANAGEMENT
-- ===========================================

-- Appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id VARCHAR(20) UNIQUE NOT NULL, -- APT001, APT002, etc.
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status appointment_status DEFAULT 'scheduled',
    type VARCHAR(20) DEFAULT 'consultation' CHECK (type IN ('consultation', 'follow-up', 'emergency', 'telemedicine')),
    reason TEXT NOT NULL,
    notes TEXT,
    
    -- Timing
    checked_in_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Billing
    consultation_fee DECIMAL(10,2) DEFAULT 0,
    payment_status payment_status DEFAULT 'pending',
    
    -- System fields
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_duration CHECK (duration_minutes > 0 AND duration_minutes <= 480),
    CONSTRAINT valid_scheduled_time CHECK (scheduled_at > created_at)
);

-- Doctor availability slots
CREATE TABLE doctor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT unique_doctor_day_time UNIQUE (doctor_id, day_of_week, start_time)
);

-- ===========================================
-- PRESCRIPTION MANAGEMENT
-- ===========================================

-- Prescriptions
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id VARCHAR(20) UNIQUE NOT NULL, -- RX001, RX002, etc.
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    
    -- Prescription content
    diagnosis TEXT NOT NULL,
    symptoms TEXT[],
    
    -- Digital prescription
    whiteboard_data TEXT, -- Base64 encoded drawing
    prescription_image_url VARCHAR(500),
    prescription_pdf_url VARCHAR(500),
    
    -- Status
    status prescription_status DEFAULT 'draft',
    
    -- Pharmacy workflow
    pharmacy_id UUID REFERENCES pharmacists(id),
    sent_to_pharmacy_at TIMESTAMP WITH TIME ZONE,
    fulfilled_at TIMESTAMP WITH TIME ZONE,
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    follow_up_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescription medications
CREATE TABLE prescription_medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    instructions TEXT,
    quantity INTEGER DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'tablets' CHECK (unit IN ('tablets', 'capsules', 'ml', 'mg', 'g')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescription tests
CREATE TABLE prescription_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(20) DEFAULT 'blood' CHECK (test_type IN ('blood', 'urine', 'imaging', 'other')),
    instructions TEXT,
    priority VARCHAR(10) DEFAULT 'routine' CHECK (priority IN ('routine', 'urgent', 'stat')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- PHARMACY MANAGEMENT
-- ===========================================

-- Pharmacy fulfillments
CREATE TABLE pharmacy_fulfillments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    pharmacist_id UUID NOT NULL REFERENCES pharmacists(id) ON DELETE CASCADE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'fulfilled', 'partial', 'cancelled')),
    
    -- Notes
    notes TEXT,
    instructions TEXT,
    
    -- Pricing
    total_amount DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fulfillment items
CREATE TABLE fulfillment_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fulfillment_id UUID NOT NULL REFERENCES pharmacy_fulfillments(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    prescribed_quantity INTEGER NOT NULL,
    dispensed_quantity INTEGER NOT NULL,
    unit VARCHAR(20) NOT NULL,
    batch_number VARCHAR(50),
    expiry_date DATE,
    price DECIMAL(10,2) NOT NULL,
    is_substituted BOOLEAN DEFAULT false,
    substitute_reason TEXT,
    
    -- Constraints
    CONSTRAINT valid_quantities CHECK (prescribed_quantity > 0 AND dispensed_quantity > 0),
    CONSTRAINT valid_price CHECK (price >= 0)
);

-- ===========================================
-- INVENTORY MANAGEMENT
-- ===========================================

-- Inventory
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    
    -- Stock information
    current_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER NOT NULL DEFAULT 0,
    maximum_stock INTEGER NOT NULL DEFAULT 0,
    
    -- Pricing
    unit_price DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    
    -- Product details
    manufacturer VARCHAR(255),
    batch_number VARCHAR(50),
    expiry_date DATE,
    unit VARCHAR(20) DEFAULT 'tablets' CHECK (unit IN ('tablets', 'capsules', 'ml', 'mg', 'g')),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_prescription_required BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_stock CHECK (current_stock >= 0 AND minimum_stock >= 0 AND maximum_stock >= 0),
    CONSTRAINT valid_prices CHECK (unit_price >= 0 AND selling_price >= 0)
);

-- Inventory movements
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    reason TEXT,
    reference VARCHAR(100), -- Order ID, prescription ID, etc.
    performed_by UUID NOT NULL REFERENCES users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_quantity CHECK (quantity != 0)
);

-- ===========================================
-- SYSTEM TABLES
-- ===========================================

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID NOT NULL,
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    is_sent BOOLEAN DEFAULT false,
    
    -- Delivery channels
    email_sent BOOLEAN DEFAULT false,
    sms_sent BOOLEAN DEFAULT false,
    push_sent BOOLEAN DEFAULT false,
    
    -- Related data
    related_id UUID,
    related_type VARCHAR(50),
    
    -- Timing
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System configuration
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Patient indexes
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_patient_id ON patients(patient_id);

-- Doctor indexes
CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_doctors_license ON doctors(license_number);
CREATE INDEX idx_doctors_available ON doctors(is_available);

-- Appointment indexes
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_created_by ON appointments(created_by);

-- Prescription indexes
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescriptions_pharmacy_id ON prescriptions(pharmacy_id);

-- Pharmacy indexes
CREATE INDEX idx_fulfillments_prescription_id ON pharmacy_fulfillments(prescription_id);
CREATE INDEX idx_fulfillments_pharmacist_id ON pharmacy_fulfillments(pharmacist_id);
CREATE INDEX idx_fulfillments_status ON pharmacy_fulfillments(status);

-- Inventory indexes
CREATE INDEX idx_inventory_medication_name ON inventory(medication_name);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_active ON inventory(is_active);
CREATE INDEX idx_inventory_low_stock ON inventory(current_stock, minimum_stock) WHERE current_stock <= minimum_stock;

-- Audit log indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Notification indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ===========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pharmacists_updated_at BEFORE UPDATE ON pharmacists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fulfillments_updated_at BEFORE UPDATE ON pharmacy_fulfillments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ===========================================

-- Function to generate patient ID
CREATE OR REPLACE FUNCTION generate_patient_id()
RETURNS TEXT AS $$
DECLARE
    next_id INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(patient_id FROM 2) AS INTEGER)), 0) + 1
    INTO next_id
    FROM patients;
    
    RETURN 'P' || LPAD(next_id::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate appointment ID
CREATE OR REPLACE FUNCTION generate_appointment_id()
RETURNS TEXT AS $$
DECLARE
    next_id INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(appointment_id FROM 4) AS INTEGER)), 0) + 1
    INTO next_id
    FROM appointments;
    
    RETURN 'APT' || LPAD(next_id::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate prescription ID
CREATE OR REPLACE FUNCTION generate_prescription_id()
RETURNS TEXT AS $$
DECLARE
    next_id INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(prescription_id FROM 3) AS INTEGER)), 0) + 1
    INTO next_id
    FROM prescriptions;
    
    RETURN 'RX' || LPAD(next_id::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- VIEWS FOR COMMON QUERIES
-- ===========================================

-- Patient summary view
CREATE VIEW patient_summary AS
SELECT 
    p.id,
    p.patient_id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    u.date_of_birth,
    u.gender,
    p.insurance_provider,
    p.created_at
FROM patients p
JOIN users u ON p.user_id = u.id
WHERE u.is_active = true;

-- Doctor summary view
CREATE VIEW doctor_summary AS
SELECT 
    d.id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    d.qualification,
    d.specialization,
    d.license_number,
    d.experience_years,
    d.consultation_fee,
    d.is_available
FROM doctors d
JOIN users u ON d.user_id = u.id
WHERE u.is_active = true;

-- Appointment summary view
CREATE VIEW appointment_summary AS
SELECT 
    a.id,
    a.appointment_id,
    a.scheduled_at,
    a.status,
    a.type,
    a.reason,
    ps.first_name as patient_first_name,
    ps.last_name as patient_last_name,
    ps.patient_id,
    ds.first_name as doctor_first_name,
    ds.last_name as doctor_last_name,
    ds.specialization,
    a.consultation_fee,
    a.payment_status
FROM appointments a
JOIN patient_summary ps ON a.patient_id = ps.id
JOIN doctor_summary ds ON a.doctor_id = ds.id;

-- ===========================================
-- SAMPLE DATA INSERTION
-- ===========================================

-- Insert sample users
INSERT INTO users (email, password_hash, role, first_name, last_name, phone, gender) VALUES
('admin@clinic.com', '$2b$10$example_hash', 'admin', 'Admin', 'User', '+91-9876543210', 'male'),
('reception@clinic.com', '$2b$10$example_hash', 'receptionist', 'Reception', 'Staff', '+91-9876543211', 'female'),
('dr.smith@clinic.com', '$2b$10$example_hash', 'doctor', 'Dr. John', 'Smith', '+91-9876543212', 'male'),
('pharmacist@clinic.com', '$2b$10$example_hash', 'pharmacist', 'Pharmacy', 'Manager', '+91-9876543213', 'female'),
('patient1@example.com', '$2b$10$example_hash', 'patient', 'Rahul', 'Kumar', '+91-9876543214', 'male');

-- Insert sample system configuration
INSERT INTO system_config (key, value, category, description) VALUES
('clinic_name', '"MediCare Clinic"', 'general', 'Name of the clinic'),
('clinic_address', '"123 Medical Center Dr, Health City, HC 12345"', 'general', 'Clinic address'),
('clinic_phone', '"+1 (555) 123-4567"', 'general', 'Clinic phone number'),
('appointment_duration', '30', 'appointments', 'Default appointment duration in minutes'),
('prescription_validity_days', '30', 'prescriptions', 'Prescription validity in days');

-- ===========================================
-- SECURITY AND PERMISSIONS
-- ===========================================

-- Create roles for different access levels
CREATE ROLE clinic_admin;
CREATE ROLE clinic_doctor;
CREATE ROLE clinic_receptionist;
CREATE ROLE clinic_pharmacist;
CREATE ROLE clinic_patient;

-- Grant permissions (this would be done in production with proper security)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO clinic_admin;
-- GRANT SELECT, INSERT, UPDATE ON appointments, prescriptions TO clinic_doctor;
-- GRANT SELECT, INSERT, UPDATE ON appointments, patients TO clinic_receptionist;
-- GRANT SELECT, INSERT, UPDATE ON pharmacy_fulfillments, inventory TO clinic_pharmacist;
-- GRANT SELECT ON appointments, prescriptions WHERE patient_id = current_user_id TO clinic_patient;
