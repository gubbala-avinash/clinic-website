import { useState } from 'react'
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
  FileText
} from 'lucide-react'
import { Modal } from '../../components/ui/Dialog'

type Booking = { 
  id: string; 
  patient: string; 
  doctor: string; 
  datetime: string; 
  status: 'booked'|'checked-in'|'completed'|'cancelled';
  phone: string;
  email: string;
  reason: string;
}

const MOCK: Booking[] = [
  { id: '1', patient: 'Rahul Kumar', doctor: 'Dr. Sarah Sharma', datetime: '2025-10-18 15:00', status: 'booked', phone: '+1 (555) 123-4567', email: 'rahul@example.com', reason: 'Annual checkup' },
  { id: '2', patient: 'Aisha Khan', doctor: 'Dr. Michael Rao', datetime: '2025-10-18 16:00', status: 'checked-in', phone: '+1 (555) 234-5678', email: 'aisha@example.com', reason: 'Chest pain' },
  { id: '3', patient: 'Emily Rodriguez', doctor: 'Dr. Emily Chen', datetime: '2025-10-18 10:30', status: 'completed', phone: '+1 (555) 345-6789', email: 'emily@example.com', reason: 'Pediatric consultation' },
  { id: '4', patient: 'David Kim', doctor: 'Dr. David Kumar', datetime: '2025-10-18 14:00', status: 'cancelled', phone: '+1 (555) 456-7890', email: 'david@example.com', reason: 'Emergency follow-up' },
]

export function AdminDashboard() {
  const [items, setItems] = useState<Booking[]>(MOCK)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'booked': return <Clock className="w-4 h-4" />
      case 'checked-in': return <User className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-blue-100 text-blue-800'
      case 'checked-in': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.patient.toLowerCase().includes(query.toLowerCase()) ||
                         item.doctor.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: items.length,
    booked: items.filter(i => i.status === 'booked').length,
    checkedIn: items.filter(i => i.status === 'checked-in').length,
    completed: items.filter(i => i.status === 'completed').length,
  }

  const handleCreateBooking = () => {
    setShowCreateBookingModal(true)
  }

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault()
    const booking: Booking = {
      id: (items.length + 1).toString(),
      patient: newBooking.patientName,
      doctor: newBooking.doctorId,
      datetime: `${newBooking.date} ${newBooking.time}`,
      status: 'booked',
      phone: newBooking.patientPhone,
      email: newBooking.patientEmail,
      reason: newBooking.reason
    }
    setItems([...items, booking])
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
          <button className="btn-primary inline-flex items-center">
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
              <p className="text-sm font-medium text-gray-600">Booked</p>
              <p className="text-2xl font-bold text-blue-600">{stats.booked}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Checked In</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.checkedIn}</p>
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
              <option value="booked">Booked</option>
              <option value="checked-in">Checked In</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.patient}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                      {item.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{item.doctor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{item.datetime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{item.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{item.email}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Reason:</strong> {item.reason}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Modal title="Assign Doctor" trigger={
                    <button className="btn-secondary text-sm">
                      Assign
                    </button>
                  }>
                    <select className="form-input w-full mb-4">
                      <option>Dr. Sarah Sharma - General Medicine</option>
                      <option>Dr. Michael Rao - Cardiology</option>
                      <option>Dr. Emily Chen - Pediatrics</option>
                      <option>Dr. David Kumar - Emergency Medicine</option>
                    </select>
                    <div className="flex justify-end gap-2">
                      <button className="btn-secondary">Cancel</button>
                      <button className="btn-primary">Save</button>
                    </div>
                  </Modal>
                  <button className="btn-secondary text-sm">Reschedule</button>
                  <button className="btn-secondary text-sm">Cancel</button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Booking Modal */}
      {showCreateBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Appointment</h2>
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Patient Name</label>
                  <input 
                    className="form-input" 
                    placeholder="Enter patient name"
                    value={newBooking.patientName}
                    onChange={(e) => setNewBooking({...newBooking, patientName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Phone Number</label>
                  <input 
                    className="form-input" 
                    placeholder="+1 (555) 123-4567"
                    value={newBooking.patientPhone}
                    onChange={(e) => setNewBooking({...newBooking, patientPhone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input 
                    type="email"
                    className="form-input" 
                    placeholder="patient@example.com"
                    value={newBooking.patientEmail}
                    onChange={(e) => setNewBooking({...newBooking, patientEmail: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Doctor</label>
                  <select 
                    className="form-input"
                    value={newBooking.doctorId}
                    onChange={(e) => setNewBooking({...newBooking, doctorId: e.target.value})}
                    required
                  >
                    <option value="">Select Doctor</option>
                    <option value="Dr. Sarah Sharma">Dr. Sarah Sharma - General Medicine</option>
                    <option value="Dr. Michael Rao">Dr. Michael Rao - Cardiology</option>
                    <option value="Dr. Emily Chen">Dr. Emily Chen - Pediatrics</option>
                    <option value="Dr. David Kumar">Dr. David Kumar - Emergency Medicine</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Date</label>
                  <input 
                    type="date"
                    className="form-input"
                    value={newBooking.date}
                    onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Time</label>
                  <input 
                    type="time"
                    className="form-input"
                    value={newBooking.time}
                    onChange={(e) => setNewBooking({...newBooking, time: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Reason for Visit</label>
                <textarea 
                  className="form-input" 
                  rows={3}
                  placeholder="Describe the reason for the appointment..."
                  value={newBooking.reason}
                  onChange={(e) => setNewBooking({...newBooking, reason: e.target.value})}
                  required
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
                <button type="submit" className="btn-primary">
                  Create Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


