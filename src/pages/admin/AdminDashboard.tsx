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
  FileText,
  Loader2
} from 'lucide-react'
import { appointmentsApi, doctorsApi, adminApi, publicBookingApi, type Appointment, type Doctor } from '../../services/api'
import { useToast, ToastContainer } from '../../components/ui/Toast'

export function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toasts, success, error, removeToast } = useToast()
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateBookingModal, setShowCreateBookingModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [newBooking, setNewBooking] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  })
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: ''
  })

  // Load appointments and doctors on component mount
  useEffect(() => {
    loadAppointments()
    loadDoctors()
  }, [])

  const loadAppointments = async () => {
    try {
      setIsLoading(true)
      setApiError(null)
      const response = await appointmentsApi.getAppointments()
      
      if (response.success) {
        setAppointments(response.data)
      } else {
        error('Failed to load appointments', 'Please try again later')
      }
    } catch (err) {
      error('Failed to load appointments', 'Please check your connection')
      console.error('Error loading appointments:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadDoctors = async () => {
    try {
      setIsLoadingDoctors(true)
      const response = await doctorsApi.getDoctors()
      
      if (response.success) {
        setDoctors(response.data)
      }
    } catch (err) {
      console.error('Error loading doctors:', err)
    } finally {
      setIsLoadingDoctors(false)
    }
  }

  const handleCreateBooking = () => {
    setShowCreateBookingModal(true)
  }

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setRescheduleData({
      date: appointment.date,
      time: appointment.time
    })
    setShowRescheduleModal(true)
  }

  const handleCancel = async (appointment: Appointment) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const response = await appointmentsApi.cancelAppointment(appointment.id)
        if (response.success) {
          setAppointments(prev => prev.map(apt => 
            apt.id === appointment.id ? { ...apt, status: 'cancelled' } : apt
          ))
          success('Appointment Cancelled', `${appointment.patientName}'s appointment has been cancelled`)
        } else {
          error('Failed to cancel appointment', 'Please try again')
        }
      } catch (err) {
        error('Failed to cancel appointment', 'Please check your connection')
        console.error('Error cancelling appointment:', err)
      }
    }
  }

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAppointment) return

    try {
      const response = await appointmentsApi.rescheduleAppointment(
        selectedAppointment.id,
        rescheduleData.date,
        rescheduleData.time
      )
      
      if (response.success) {
        setAppointments(prev => prev.map(apt => 
          apt.id === selectedAppointment.id ? { ...apt, date: rescheduleData.date, time: rescheduleData.time } : apt
        ))
        setShowRescheduleModal(false)
        setSelectedAppointment(null)
        setRescheduleData({ date: '', time: '' })
        success('Appointment Rescheduled', `${selectedAppointment.patientName}'s appointment has been rescheduled`)
      } else {
        error('Failed to reschedule appointment', 'Please try again')
      }
    } catch (err) {
      error('Failed to reschedule appointment', 'Please check your connection')
      console.error('Error rescheduling appointment:', err)
    }
  }


  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const selectedDoctor = doctors.find(d => d.id === newBooking.doctorId)
      const appointmentData = {
        patientName: newBooking.patientName,
        doctorName: selectedDoctor?.name || 'General Doctor',
        date: newBooking.date,
        time: newBooking.time,
        reason: newBooking.reason,
        status: 'scheduled' as const,
        phone: newBooking.patientPhone,
        email: newBooking.patientEmail
      }

      console.log('Admin creating appointment with data:', appointmentData)
      console.log('Selected doctor:', selectedDoctor)

      const response = await publicBookingApi.createAppointment(appointmentData)
      console.log('Admin appointment API response:', response)
      
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
        success('Appointment Created', `New appointment created for ${appointmentData.patientName}`)
      } else {
        error('Failed to create appointment', 'Please try again')
      }
    } catch (err) {
      error('Failed to create appointment', 'Please check your connection')
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={handleCreateBooking}
            className="btn-primary inline-flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </button>
          <button 
            onClick={() => window.location.href = '/admin/patients'}
            className="btn-secondary inline-flex items-center justify-center"
          >
            <User className="w-4 h-4 mr-2" />
            View Patients
          </button>
          <button 
            onClick={() => window.location.href = '/admin/analytics'}
            className="btn-secondary inline-flex items-center justify-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Analytics
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
                    <button 
                      onClick={() => handleReschedule(appointment)}
                      className="btn-secondary text-sm"
                    >
                      Reschedule
                    </button>
                    <button 
                      onClick={() => handleCancel(appointment)}
                      className="btn-secondary text-sm text-red-600 hover:text-red-700"
                    >
                      Cancel
                    </button>
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
      {showCreateBookingModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create New Appointment</h2>
              <button 
                onClick={() => setShowCreateBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
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
              {isLoadingDoctors ? (
                <div className="flex items-center p-3 border rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-gray-600">Loading doctors...</span>
                </div>
              ) : (
                <select 
                  className="form-input" 
                  value={newBooking.doctorId} 
                  onChange={(e)=>setNewBooking(prev => ({ ...prev, doctorId: e.target.value }))}
                >
                  <option value="">Select Doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialty}
                    </option>
                  ))}
                </select>
              )}
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
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Reschedule Appointment</h2>
              <button 
                onClick={() => setShowRescheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Current Appointment</h3>
                <p className="text-sm text-gray-600">
                  <strong>Patient:</strong> {selectedAppointment.patientName}<br/>
                  <strong>Doctor:</strong> {selectedAppointment.doctorName}<br/>
                  <strong>Current Date:</strong> {selectedAppointment.date} at {selectedAppointment.time}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">New Date *</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={rescheduleData.date} 
                    onChange={(e)=>setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">New Time *</label>
                  <select 
                    className="form-input" 
                    value={rescheduleData.time} 
                    onChange={(e)=>setRescheduleData(prev => ({ ...prev, time: e.target.value }))}
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
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-primary"
                  disabled={!rescheduleData.date || !rescheduleData.time}
                >
                  Reschedule Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}