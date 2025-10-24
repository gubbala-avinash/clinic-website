import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PublicLayout } from './layouts/PublicLayout'
import { DashboardLayout } from './layouts/DashboardLayout'
import { HomePage } from './pages/HomePage'
import { BookingPage } from './pages/BookingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { UserManagementPage } from './pages/admin/UserManagementPage'
import { DemoPrescriptionPage } from './pages/demo/DemoPrescriptionPage'
import { PatientsPage } from './pages/admin/PatientsPage'
import { SettingsPage } from './pages/admin/SettingsPage'
import { DoctorDashboard } from './pages/doctor/DoctorDashboard'
import { PrescriptionPage } from './pages/doctor/PrescriptionPage'
import { PharmacyDashboard } from './pages/pharmacy/PharmacyDashboard'
import { PharmacyDetailPage } from './pages/pharmacy/PharmacyDetailPage'
import { AnalyticsPage } from './pages/analytics/AnalyticsPage'
import { AuditLogsPage } from './pages/admin/AuditLogsPage'
import { ServerStatusPage } from './pages/admin/ServerStatusPage'
import { useAuth } from './hooks/useApi'

const queryClient = new QueryClient()

function RoleRoute({ children, allow }: { children: React.ReactNode; allow: Array<'admin' | 'receptionist' | 'doctor' | 'pharmacist' | 'patient'> }) {
  const { isAuthenticated, user } = useAuth()
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }
  
  if (!allow.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}> 
            <Route index element={<HomePage />} />
            <Route path="booking" element={<BookingPage />} />
            <Route path="login" element={<LoginPage />} />
          </Route>

          <Route element={<DashboardLayout />}> 
            <Route
              path="admin"
              element={
                <RoleRoute allow={["admin", "receptionist"]}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="admin/users"
              element={
                <RoleRoute allow={["admin"]}>
                  <UserManagementPage />
                </RoleRoute>
              }
            />
            <Route path="demo/prescription" element={<DemoPrescriptionPage />} />
            <Route
              path="admin/patients"
              element={
                <RoleRoute allow={["admin", "receptionist"]}>
                  <PatientsPage />
                </RoleRoute>
              }
            />
            <Route
              path="admin/settings"
              element={
                <RoleRoute allow={["admin"]}>
                  <SettingsPage />
                </RoleRoute>
              }
            />
            <Route
              path="doctor"
              element={
                <RoleRoute allow={["doctor"]}>
                  <DoctorDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="doctor/prescription/:patientId"
              element={
                <RoleRoute allow={["doctor"]}>
                  <PrescriptionPage />
                </RoleRoute>
              }
            />
            <Route
              path="pharmacy"
              element={
                <RoleRoute allow={["pharmacist"]}>
                  <PharmacyDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="pharmacy/:id"
              element={
                <RoleRoute allow={["pharmacist"]}>
                  <PharmacyDetailPage />
                </RoleRoute>
              }
            />
            <Route
              path="analytics"
              element={
                <RoleRoute allow={["admin"]}>
                  <AnalyticsPage />
                </RoleRoute>
              }
            />
            <Route
              path="audit"
              element={
                <RoleRoute allow={["admin"]}>
                  <AuditLogsPage />
                </RoleRoute>
              }
            />
            <Route
              path="status"
              element={
                <RoleRoute allow={["admin"]}>
                  <ServerStatusPage />
                </RoleRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
