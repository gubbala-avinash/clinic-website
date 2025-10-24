import { useState, useEffect } from 'react'
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
  AreaChart,
  ComposedChart,
  Legend
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
  AlertCircle,
  Loader2,
  Activity,
  DollarSign,
  UserCheck,
  Calendar as CalendarIcon,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react'
import { analyticsApi, type Analytics } from '../../services/api'
import { useToast, ToastContainer } from '../../components/ui/Toast'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

// Fallback data when API fails
const generateFallbackData = () => {
  return {
    appointmentsByDay: [
      { day: 'Mon', count: 0 },
      { day: 'Tue', count: 0 },
      { day: 'Wed', count: 0 },
      { day: 'Thu', count: 0 },
      { day: 'Fri', count: 0 },
      { day: 'Sat', count: 0 },
      { day: 'Sun', count: 0 }
    ],
    revenueByMonth: [
      { month: 'Jan', revenue: 0 },
      { month: 'Feb', revenue: 0 },
      { month: 'Mar', revenue: 0 },
      { month: 'Apr', revenue: 0 },
      { month: 'May', revenue: 0 },
      { month: 'Jun', revenue: 0 }
    ],
    appointmentStatusData: [
      { name: 'Scheduled', value: 0, count: 0 },
      { name: 'Confirmed', value: 0, count: 0 },
      { name: 'Completed', value: 0, count: 0 },
      { name: 'Cancelled', value: 0, count: 0 }
    ],
    doctorPerformance: [],
    patientAgeGroups: [
      { ageGroup: '0-18', count: 0 },
      { ageGroup: '19-35', count: 0 },
      { ageGroup: '36-50', count: 0 },
      { ageGroup: '51-65', count: 0 },
      { ageGroup: '65+', count: 0 }
    ],
    monthlyTrends: []
  }
}

export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedChart, setSelectedChart] = useState('overview')
  const { toasts, success, error: showError, removeToast } = useToast()

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await analyticsApi.getDashboardAnalytics()
      
      if (response.success) {
        console.log('Analytics data received:', response.data)
        setAnalytics(response.data)
        success('Analytics Loaded', 'Real-time data has been loaded successfully')
      } else {
        setError('Failed to load analytics data')
        showError('Failed to load analytics', 'Please try again later')
      }
    } catch (err) {
      setError('Failed to load analytics data')
      showError('Failed to load analytics', 'Please check your connection')
      console.error('Error loading analytics:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const handleExport = () => {
    success('Export Started', 'Analytics data is being prepared for download')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (error && !analytics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
            <button 
              onClick={loadAnalytics}
              className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
        <p className="text-gray-600">Analytics data will appear here once you have some activity.</p>
      </div>
    )
  }

  // Ensure charts data exists with fallbacks
  const charts = analytics.charts || {}
  const appointmentsByDay = charts.appointmentsByDay || []
  const revenueByMonth = charts.revenueByMonth || []
  const appointmentStatusData = charts.appointmentStatusData || []
  const doctorPerformance = charts.doctorPerformance || []
  const patientAgeGroups = charts.patientAgeGroups || []
  const monthlyTrends = charts.monthlyTrends || []

  return (
    <div className="space-y-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into clinic performance and patient care</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-input w-auto"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button 
            onClick={handleExport}
            className="btn-secondary inline-flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(analytics.totalPatients)}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12% from last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(analytics.totalAppointments)}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+8% from last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prescriptions</p>
              <p className="text-3xl font-bold text-gray-900">{formatNumber(analytics.totalPrescriptions)}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+15% from last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Pill className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(analytics.revenue)}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+22% from last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Navigation */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedChart('overview')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedChart === 'overview' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 mr-2 inline" />
          Overview
        </button>
        <button
          onClick={() => setSelectedChart('revenue')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedChart === 'revenue' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <DollarSign className="w-4 h-4 mr-2 inline" />
          Revenue
        </button>
        <button
          onClick={() => setSelectedChart('patients')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedChart === 'patients' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Users className="w-4 h-4 mr-2 inline" />
          Patients
        </button>
        <button
          onClick={() => setSelectedChart('doctors')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedChart === 'doctors' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Stethoscope className="w-4 h-4 mr-2 inline" />
          Doctors
        </button>
      </div>

      {/* Overview Charts */}
      {selectedChart === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Appointments by Day */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Appointments</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Appointments</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              {appointmentsByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="appointments" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No appointment data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Revenue</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Charts */}
      {selectedChart === 'revenue' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue by Month */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Revenue</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue vs Appointments */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue vs Appointments</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#10B981" name="Revenue" />
                  <Line yAxisId="right" type="monotone" dataKey="appointments" stroke="#3B82F6" strokeWidth={2} name="Appointments" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Patient Charts */}
      {selectedChart === 'patients' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patient Age Distribution */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Patient Age Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patientAgeGroups} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="ageGroup" type="category" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Patient Growth */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Patient Growth</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="patients" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Charts */}
      {selectedChart === 'doctors' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Doctor Performance */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Doctor Performance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={doctorPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="appointments" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Doctor Revenue */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Doctor Revenue</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={doctorPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointment Status Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Appointment Status</h3>
          <div className="h-64">
            {appointmentStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appointmentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appointmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <PieChartIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No status data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Doctors */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Doctors</h3>
          <div className="space-y-4">
            {doctorPerformance.slice(0, 5).map((doctor, index) => (
              <div key={doctor.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{doctor.name}</p>
                    <p className="text-xs text-gray-600">{doctor.specialty}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{doctor.appointments}</p>
                  <p className="text-xs text-gray-600">appointments</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">Avg. Wait Time</span>
              </div>
              <span className="text-sm font-medium text-gray-900">12 min</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Success Rate</span>
              </div>
              <span className="text-sm font-medium text-gray-900">98.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-4 h-4 text-purple-500 mr-2" />
                <span className="text-sm text-gray-600">New Patients</span>
              </div>
              <span className="text-sm font-medium text-gray-900">23</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Pill className="w-4 h-4 text-yellow-500 mr-2" />
                <span className="text-sm text-gray-600">Prescriptions</span>
              </div>
              <span className="text-sm font-medium text-gray-900">89</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-sm text-gray-600">Active Doctors</span>
              </div>
              <span className="text-sm font-medium text-gray-900">12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}