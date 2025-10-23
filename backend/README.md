# 🏥 Clinic Management System - Backend

## 🚀 **Quick Start**

### **Prerequisites**
- **Node.js** >= 16.0.0
- **MongoDB** >= 5.0
- **npm** >= 8.0.0

### **Installation**
```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your configuration
# Set MONGODB_URI, JWT_SECRET, etc.

# Seed database with sample data
npm run db:seed

# Start all services
npm run dev
```

## 🏗️ **Architecture**

### **3-Service Architecture**
- **🚪 API Gateway** (Port 3000) - Authentication, routing, middleware
- **🏥 Clinic Service** (Port 3001) - Appointments, prescriptions, pharmacy, analytics
- **📁 Files Service** (Port 3002) - File uploads, document management

### **Service Communication**
```
Client → API Gateway → Clinic Service
                    → Files Service
```

## 🔧 **Development**

### **Start Services**
```bash
# Start all services
npm run dev

# Start individual services
npm run dev:gateway    # Port 3000
npm run dev:clinic     # Port 3001
npm run dev:files      # Port 3002
```

### **Environment Variables**
```env
# Server Configuration
NODE_ENV=development
PORT=3000
CLINIC_PORT=3001
FILES_PORT=3002

# Database
MONGODB_URI=mongodb://localhost:27017/clinic-management

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

## 📊 **API Endpoints**

### **Authentication (API Gateway)**
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me
```

### **Appointments (Clinic Service)**
```
GET    /api/appointments
POST   /api/appointments
PATCH  /api/appointments/:id
```

### **Prescriptions (Clinic Service)**
```
GET    /api/prescriptions
POST   /api/prescriptions
PATCH  /api/prescriptions/:id
```

### **Pharmacy (Clinic Service)**
```
GET    /api/pharmacy
PATCH  /api/pharmacy/:id/fulfill
```

### **Analytics (Clinic Service)**
```
GET    /api/analytics/dashboard
```

### **Files (Files Service)**
```
POST   /api/files/upload
POST   /api/files/upload-multiple
GET    /api/files/:id
GET    /api/files/download/:id
DELETE /api/files/:id
```

## 🗄️ **Database Models**

### **User Model**
- **Authentication**: email, password, role
- **Profile**: firstName, lastName, phone
- **Role-specific**: doctorInfo, pharmacistInfo, patientInfo
- **System**: isActive, lastLogin, preferences

### **Appointment Model**
- **Core**: appointmentId, patientId, doctorId, scheduledAt
- **Status**: status, type, reason, notes
- **Timing**: checkedInAt, startedAt, completedAt
- **Billing**: consultationFee, paymentStatus

### **Prescription Model**
- **Core**: prescriptionId, appointmentId, patientId, doctorId
- **Content**: diagnosis, symptoms, medications, tests
- **Digital**: whiteboardData, prescriptionImage, prescriptionPdf
- **Workflow**: status, pharmacyId, sentToPharmacyAt, fulfilledAt

## 🔐 **Authentication**

### **JWT in HttpOnly Cookies**
- **Secure**: HttpOnly cookies prevent XSS
- **Automatic**: Cookies sent with every request
- **CSRF Protection**: SameSite=strict
- **Expiry**: 7 days default

### **Role-Based Access**
- **Admin**: Full system access
- **Doctor**: Patient management, prescriptions
- **Receptionist**: Appointment booking, patient registration
- **Pharmacist**: Prescription fulfillment, inventory
- **Patient**: Own data access only

## 📁 **File Management**

### **Supported Types**
- **Images**: JPEG, PNG, GIF
- **Documents**: PDF
- **Size Limit**: 10MB per file
- **Multiple Files**: Up to 5 files per request

### **Features**
- **Thumbnail Generation**: Automatic for images
- **File Compression**: Optimized storage
- **Secure Upload**: File type validation
- **CDN Ready**: CloudFlare/AWS integration

## 🧪 **Testing**

### **Run Tests**
```bash
# Run all tests
npm test

# Run specific test
npm test -- --grep "authentication"
```

### **Test Coverage**
- **Unit Tests**: Individual functions
- **Integration Tests**: API endpoints
- **E2E Tests**: Complete workflows

## 🚀 **Deployment**

### **Production Build**
```bash
# Build for production
npm run build

# Start production
npm start
```

### **Docker Deployment**
```bash
# Build Docker image
docker build -t clinic-backend .

# Run with Docker Compose
docker-compose up -d
```

### **Environment Setup**
- **Development**: Local MongoDB, file storage
- **Staging**: Cloud MongoDB, S3 storage
- **Production**: Clustered MongoDB, CDN

## 📊 **Monitoring**

### **Health Checks**
- **API Gateway**: `GET /api/health`
- **Clinic Service**: `GET /api/health`
- **Files Service**: `GET /api/health`

### **Logging**
- **Development**: Morgan dev format
- **Production**: Combined format
- **Error Tracking**: Sentry integration

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Database Connection**
```bash
# Check MongoDB status
mongod --version

# Restart MongoDB
brew services restart mongodb-community
```

#### **Port Conflicts**
```bash
# Kill process on port
npx kill-port 3000
npx kill-port 3001
npx kill-port 3002
```

#### **Dependencies**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📚 **API Documentation**

### **Request Format**
```javascript
// Headers
{
  "Content-Type": "application/json",
  "Cookie": "auth_token=jwt_token_here"
}

// Response Format
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### **Error Codes**
- **NO_TOKEN**: No authentication token provided
- **INVALID_TOKEN**: Invalid or expired token
- **MISSING_FIELDS**: Required fields missing
- **USER_EXISTS**: User already exists
- **SERVICE_UNAVAILABLE**: Microservice unavailable

## 🤝 **Contributing**

### **Development Workflow**
1. **Fork** the repository
2. **Create** feature branch
3. **Make** changes
4. **Test** thoroughly
5. **Submit** pull request

### **Code Standards**
- **ESLint**: Follow configured rules
- **Prettier**: Consistent formatting
- **Conventional Commits**: Standard commit messages
- **TypeScript**: Strict typing

---

**🚀 Ready to build amazing healthcare solutions!**

