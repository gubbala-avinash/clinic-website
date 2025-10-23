# 🔗 Frontend-Backend Integration Guide

## 🚀 **Quick Start**

### **Start Everything**
```bash
# Start both frontend and backend
npm run dev:full
```

### **Start Individually**
```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
npm run dev
```

## 🏗️ **Integration Architecture**

### **API Flow**
```
Frontend (React) → API Gateway (Port 3000) → Microservices
                                    ├── Clinic Service (Port 3001)
                                    └── Files Service (Port 3002)
```

### **Authentication Flow**
```
1. User Login → API Gateway → JWT Token → HttpOnly Cookie
2. Frontend → API Gateway (with Cookie) → Authenticated Request
3. API Gateway → Microservice → Response
```

## 🔧 **Key Integration Points**

### **1. API Service Layer** (`src/services/api.ts`)
- **HTTP Client**: Handles all API communication
- **Type Safety**: Full TypeScript support
- **Error Handling**: Centralized error management
- **Cookie Auth**: Automatic cookie inclusion

### **2. Authentication Store** (`src/store/auth.ts`)
- **Zustand Store**: Global authentication state
- **API Integration**: Real backend authentication
- **Role Management**: Role-based access control
- **Auto Login**: Persistent authentication

### **3. Custom Hooks** (`src/hooks/useApi.ts`)
- **useApi**: Generic API hook with loading/error states
- **useAuth**: Authentication state management
- **useRoleGuard**: Role-based access control

## 📊 **Updated Components**

### **AdminDashboard**
- ✅ **Real API Integration**: Uses `appointmentsApi`
- ✅ **Loading States**: Proper loading indicators
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Create Appointments**: Real appointment creation

### **AnalyticsPage**
- ✅ **Real Data**: Uses `analyticsApi`
- ✅ **Dynamic Charts**: Real-time data visualization
- ✅ **Responsive Design**: Mobile-friendly charts

### **LoginPage**
- ✅ **Backend Authentication**: Real login with backend
- ✅ **Role-based Redirect**: Automatic role-based navigation
- ✅ **Error Handling**: Proper error display
- ✅ **Demo Credentials**: Pre-filled test accounts

## 🔐 **Authentication System**

### **Login Credentials**
```
Admin: admin@clinic.com / admin123
Doctor: dr.smith@clinic.com / doctor123
Receptionist: reception@clinic.com / reception123
Pharmacist: pharmacist@clinic.com / pharmacist123
Patient: rahul@example.com / patient123
```

### **Authentication Flow**
1. **Login**: User enters credentials
2. **API Call**: Frontend calls `/api/auth/login`
3. **JWT Token**: Backend returns JWT in HttpOnly cookie
4. **State Update**: Frontend updates authentication state
5. **Redirect**: User redirected based on role
6. **Protected Routes**: Role-based access control

## 🛠️ **Development Workflow**

### **Backend Development**
```bash
cd backend
npm run dev          # Start all services
npm run dev:gateway  # Start only API Gateway
npm run dev:clinic   # Start only Clinic Service
npm run dev:files    # Start only Files Service
```

### **Frontend Development**
```bash
npm run dev          # Start frontend only
npm run dev:full     # Start frontend + backend
```

### **Database Seeding**
```bash
cd backend
npm run db:seed      # Seed database with sample data
```

## 🔄 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### **Appointments**
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `PATCH /api/appointments/:id` - Update appointment

### **Prescriptions**
- `GET /api/prescriptions` - Get all prescriptions
- `POST /api/prescriptions` - Create prescription
- `PATCH /api/prescriptions/:id` - Update prescription

### **Analytics**
- `GET /api/analytics/dashboard` - Get dashboard analytics

### **Files**
- `POST /api/files/upload` - Upload single file
- `POST /api/files/upload-multiple` - Upload multiple files
- `GET /api/files/:id` - Get file info
- `GET /api/files/download/:id` - Download file
- `DELETE /api/files/:id` - Delete file

## 🐛 **Troubleshooting**

### **Common Issues**

#### **CORS Errors**
```bash
# Check CORS_ORIGIN in backend/.env
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

#### **Authentication Issues**
```bash
# Check if backend is running
curl http://localhost:3000/api/health

# Check if database is connected
# Look for MongoDB connection logs in backend
```

#### **API Connection Issues**
```bash
# Test API Gateway
curl http://localhost:3000/api/health

# Test Clinic Service
curl http://localhost:3001/api/health

# Test Files Service
curl http://localhost:3002/api/health
```

### **Debug Mode**
```bash
# Enable debug logging
DEBUG=clinic:* npm run dev
```

## 📱 **Testing the Integration**

### **1. Start the System**
```bash
npm run dev:full
```

### **2. Test Authentication**
1. Go to `http://localhost:5173/login`
2. Use demo credentials to login
3. Verify role-based redirect

### **3. Test Admin Dashboard**
1. Login as admin
2. Check appointments load
3. Try creating new appointment
4. Verify real-time updates

### **4. Test Analytics**
1. Login as admin
2. Go to Analytics page
3. Verify charts load with real data

### **5. Test File Upload**
1. Login as doctor
2. Go to prescription page
3. Test file upload functionality

## 🚀 **Production Deployment**

### **Environment Variables**
```env
# Frontend (.env)
VITE_API_BASE_URL=https://api.yourdomain.com

# Backend (.env)
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-production-secret
CORS_ORIGIN=https://yourdomain.com
```

### **Build Commands**
```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build
```

## 📈 **Performance Optimization**

### **Frontend**
- ✅ **Code Splitting**: Dynamic imports for routes
- ✅ **Lazy Loading**: Components loaded on demand
- ✅ **Caching**: React Query for API caching
- ✅ **Bundle Size**: Optimized build output

### **Backend**
- ✅ **Rate Limiting**: Prevent API abuse
- ✅ **Compression**: Gzip compression enabled
- ✅ **Caching**: Response caching for static data
- ✅ **Database Indexing**: Optimized queries

## 🔒 **Security Features**

### **Authentication**
- ✅ **JWT Tokens**: Secure token-based auth
- ✅ **HttpOnly Cookies**: XSS protection
- ✅ **CSRF Protection**: SameSite cookies
- ✅ **Password Hashing**: bcrypt encryption

### **API Security**
- ✅ **Rate Limiting**: Request throttling
- ✅ **CORS Protection**: Cross-origin security
- ✅ **Input Validation**: Data sanitization
- ✅ **Error Handling**: Secure error responses

---

**🎉 Your clinic management system is now fully integrated!**
