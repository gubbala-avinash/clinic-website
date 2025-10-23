import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Users, 
  Clock, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Loader2
} from 'lucide-react'
import { Modal } from '../../components/ui/Dialog'
import { appointmentsApi, type Appointment } from '../../services/api'

export function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateBookingModal, setShowCreateBookingModal] = useState(false)
  const [newBooking, setNewBooking] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  })

  // Load appointments on component mount
  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await appointmentsApi.getAppointments()
      
      if (response.success) {
        setAppointments(response.data)
      } else {
        setError('Failed to load appointments')
      }
    } catch (err) {
      setError('Failed to load appointments')
      console.error('Error loading appointments:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBooking = () => {
    setShowCreateBookingModal(true)
  }

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const appointmentData = {
        patientName: newBooking.patientName,
        doctorName: 'Dr. Sarah Sharma', // Default doctor for now
        date: newBooking.date,
        time: newBooking.time,
        reason: newBooking.reason,
        status: 'scheduled' as const,
        phone: newBooking.patientPhone,
        email: newBooking.patientEmail
      }

      const response = await appointmentsApi.createAppointment(appointmentData)
      
      if (response.success) {
        setAppointments(prev => [response.data, ...prev])
        setNewBooking({
          patientName: '',
          patientPhone: '',
          patientEmail: '',
          doctorId: '',
          date: '',
          time: '',
          reason: ''
        })
        setShowCreateBookingModal(false)
      } else {
        setError('Failed to create appointment')
      }
    } catch (err) {
      setError('Failed to create appointment')
      console.error('Error creating appointment:', err)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />
      case 'confirmed': return <User className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(query.toLowerCase()) ||
                         appointment.doctorName.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading appointments...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
          <p className="text-gray-600">Manage patient appointments and schedules</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary inline-flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button 
            onClick={handleCreateBooking}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Booking
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <button 
                onClick={loadAppointments}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.confirmed}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={handleCreateBooking}
            className="btn-primary inline-flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </button>
          <button className="btn-secondary inline-flex items-center justify-center">
            <Users className="w-4 h-4 mr-2" />
            Add Patient
          </button>
          <button className="btn-secondary inline-flex items-center justify-center">
            <Calendar className="w-4 h-4 mr-2" />
            View Schedule
          </button>
          <button className="btn-secondary inline-flex items-center justify-center">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                placeholder="Search patients or doctors..." 
                value={query} 
                onChange={(e)=>setQuery(e.target.value)} 
                className="form-input pl-10" 
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input w-auto"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600 mb-4">
                {query || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by creating your first appointment'
                }
              </p>
              {!query && statusFilter === 'all' && (
                <button 
                  onClick={handleCreateBooking}
                  className="btn-primary"
                >
                  Create First Appointment
                </button>
              )}
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{appointment.patientName}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        {appointment.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{appointment.doctorName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{appointment.date} at {appointment.time}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Reason:</strong> {appointment.reason}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-sm">Reschedule</button>
                    <button className="btn-secondary text-sm">Cancel</button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Booking Modal */}
      <Modal 
        isOpen={showCreateBookingModal}
        onClose={() => setShowCreateBookingModal(false)}
        title="Create New Appointment"
      >
        <form onSubmit={handleSubmitBooking} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Patient Name *</label>
              <input 
                className="form-input" 
                placeholder="Enter patient name" 
                value={newBooking.patientName} 
                onChange={(e)=>setNewBooking(prev => ({ ...prev, patientName: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="form-label">Phone Number *</label>
              <input 
                className="form-input" 
                placeholder="+1 (555) 123-4567" 
                value={newBooking.patientPhone} 
                onChange={(e)=>setNewBooking(prev => ({ ...prev, patientPhone: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="form-label">Email Address *</label>
              <input 
                type="email"
                className="form-input" 
                placeholder="patient@example.com" 
                value={newBooking.patientEmail} 
                onChange={(e)=>setNewBooking(prev => ({ ...prev, patientEmail: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="form-label">Doctor</label>
              <select 
                className="form-input" 
                value={newBooking.doctorId} 
                onChange={(e)=>setNewBooking(prev => ({ ...prev, doctorId: e.target.value }))}
              >
                <option value="">Select Doctor</option>
                <option value="dr1">Dr. Sarah Sharma - General Medicine</option>
                <option value="dr2">Dr. Michael Rao - Cardiology</option>
                <option value="dr3">Dr. Emily Chen - Pediatrics</option>
              </select>
            </div>
            <div>
              <label className="form-label">Date *</label>
              <input 
                type="date" 
                className="form-input" 
                value={newBooking.date} 
                onChange={(e)=>setNewBooking(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="form-label">Time *</label>
              <select 
                className="form-input" 
                value={newBooking.time} 
                onChange={(e)=>setNewBooking(prev => ({ ...prev, time: e.target.value }))}
                required
              >
                <option value="">Select Time</option>
                <option value="09:00">09:00 AM</option>
                <option value="09:30">09:30 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="14:00">02:00 PM</option>
                <option value="14:30">02:30 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="15:30">03:30 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="16:30">04:30 PM</option>
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Reason for Visit</label>
            <textarea 
              className="form-input" 
              rows={3} 
              placeholder="Please describe the reason for the appointment..."
              value={newBooking.reason} 
              onChange={(e)=>setNewBooking(prev => ({ ...prev, reason: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setShowCreateBookingModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-primary"
              disabled={!newBooking.patientName || !newBooking.patientPhone || !newBooking.patientEmail || !newBooking.date || !newBooking.time}
            >
              Create Appointment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}