import { useState } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { 
  Calendar, 
  Users, 
  Stethoscope, 
  Pill, 
  TrendingUp, 
  TrendingDown,
  Download,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const appointmentData = [
  { name: 'Mon', appointments: 24, completed: 22, cancelled: 2 },
  { name: 'Tue', appointments: 31, completed: 28, cancelled: 3 },
  { name: 'Wed', appointments: 28, completed: 26, cancelled: 2 },
  { name: 'Thu', appointments: 35, completed: 32, cancelled: 3 },
  { name: 'Fri', appointments: 42, completed: 38, cancelled: 4 },
  { name: 'Sat', appointments: 18, completed: 16, cancelled: 2 },
  { name: 'Sun', appointments: 12, completed: 10, cancelled: 2 },
]

const monthlyRevenue = [
  { month: 'Jan', revenue: 45000, patients: 320 },
  { month: 'Feb', revenue: 52000, patients: 380 },
  { month: 'Mar', revenue: 48000, patients: 350 },
  { month: 'Apr', revenue: 61000, patients: 420 },
  { month: 'May', revenue: 55000, patients: 390 },
  { month: 'Jun', revenue: 67000, patients: 450 },
]

const doctorPerformance = [
  { name: 'Dr. Sarah Sharma', patients: 45, rating: 4.9, revenue: 12500 },
  { name: 'Dr. Michael Rao', patients: 38, rating: 4.8, revenue: 10800 },
  { name: 'Dr. Emily Chen', patients: 42, rating: 4.9, revenue: 11200 },
  { name: 'Dr. David Kumar', patients: 35, rating: 4.7, revenue: 9800 },
]

const prescriptionData = [
  { name: 'General Medicine', value: 45, color: '#3b82f6' },
  { name: 'Cardiology', value: 25, color: '#ef4444' },
  { name: 'Pediatrics', value: 20, color: '#10b981' },
  { name: 'Emergency', value: 10, color: '#f59e0b' },
]

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b']

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('week')
  const [selectedMetric, setSelectedMetric] = useState('appointments')

  const stats = {
    totalAppointments: 190,
    completedAppointments: 172,
    cancelledAppointments: 18,
    totalRevenue: 328000,
    averageRating: 4.8,
    totalPatients: 2310,
    prescriptionsFulfilled: 156,
    newPatients: 45
  }

  const getPercentageChange = (current: number, previous: number) => {
    return ((current - previous) / previous * 100).toFixed(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into clinic performance</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-input w-auto"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn-secondary inline-flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.5% from last week
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedAppointments}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8.2% from last week
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +15.3% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Patient Satisfaction</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.averageRating}/5.0</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +0.2 from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Trend - Full Width */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Appointments Trend</h2>
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1 rounded-md text-sm ${selectedMetric === 'appointments' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
              onClick={() => setSelectedMetric('appointments')}
            >
              Appointments
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm ${selectedMetric === 'completed' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
              onClick={() => setSelectedMetric('completed')}
            >
              Completed
            </button>
          </div>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={appointmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue vs Patients - Full Width */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue vs Patients Correlation</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} name="Revenue ($)" />
              <Line yAxisId="right" type="monotone" dataKey="patients" stroke="#10b981" strokeWidth={3} name="Patients" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Doctor Performance - Full Width */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Doctor Performance Comparison</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={doctorPerformance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="patients" fill="#3b82f6" name="Patients Treated" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row - Smaller Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Prescription Distribution */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Prescription Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={prescriptionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {prescriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Total Patients</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats.totalPatients}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Pill className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Prescriptions Fulfilled</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.prescriptionsFulfilled}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-900">New Patients</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{stats.newPatients}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-gray-900">Cancelled</span>
              </div>
              <span className="text-lg font-bold text-red-600">{stats.cancelledAppointments}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance Insights</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">High Completion Rate</span>
            </div>
            <p className="text-sm text-green-700">
              {((stats.completedAppointments / stats.totalAppointments) * 100).toFixed(1)}% of appointments completed successfully
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Revenue Growth</span>
            </div>
            <p className="text-sm text-blue-700">
              Revenue increased by 15.3% compared to last month
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-900">Patient Satisfaction</span>
            </div>
            <p className="text-sm text-yellow-700">
              Average rating of {stats.averageRating}/5.0 with positive trend
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


