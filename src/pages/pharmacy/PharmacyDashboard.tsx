import { Link } from 'react-router-dom'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Calendar, 
  Pill, 
  FileText,
  Eye,
  CheckSquare
} from 'lucide-react'

type Rx = { 
  id: string; 
  patient: string; 
  status: 'new'|'in-progress'|'fulfilled';
  doctor: string;
  date: string;
  time: string;
  medications: number;
  priority: 'low'|'medium'|'high';
}

const ITEMS: Rx[] = [
  { 
    id: 'r1', 
    patient: 'Rahul Kumar', 
    status: 'new', 
    doctor: 'Dr. Sarah Sharma',
    date: '2025-10-18',
    time: '10:30',
    medications: 3,
    priority: 'high'
  },
  { 
    id: 'r2', 
    patient: 'Aisha Khan', 
    status: 'in-progress', 
    doctor: 'Dr. Michael Rao',
    date: '2025-10-18',
    time: '11:00',
    medications: 2,
    priority: 'medium'
  },
  { 
    id: 'r3', 
    patient: 'Emily Rodriguez', 
    status: 'fulfilled', 
    doctor: 'Dr. Emily Chen',
    date: '2025-10-18',
    time: '09:45',
    medications: 1,
    priority: 'low'
  },
]

export function PharmacyDashboard() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="w-4 h-4" />
      case 'in-progress': return <Clock className="w-4 h-4" />
      case 'fulfilled': return <CheckCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'fulfilled': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = {
    new: ITEMS.filter(i => i.status === 'new').length,
    inProgress: ITEMS.filter(i => i.status === 'in-progress').length,
    fulfilled: ITEMS.filter(i => i.status === 'fulfilled').length,
    total: ITEMS.length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy Dashboard</h1>
          <p className="text-gray-600">Manage prescription fulfillment and medication dispensing</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New</p>
              <p className="text-2xl font-bold text-red-600">{stats.new}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fulfilled</p>
              <p className="text-2xl font-bold text-green-600">{stats.fulfilled}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Queue */}
      <div className="grid lg:grid-cols-3 gap-6">
        {(['new','in-progress','fulfilled'] as const).map(col => (
          <section key={col} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {col.replace('-', ' ')}
              </h2>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(col)}`}>
                {getStatusIcon(col)}
                {ITEMS.filter(i => i.status === col).length}
              </span>
            </div>
            <div className="space-y-3">
              {ITEMS.filter(i => i.status === col).map(item => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.patient}</h3>
                      <p className="text-sm text-gray-600">{item.doctor}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{item.date} at {item.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      <span>{item.medications} medication{item.medications !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Link 
                      to={`/pharmacy/${item.id}`} 
                      className="btn-secondary text-sm flex-1 inline-flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Link>
                    {item.status !== 'fulfilled' && (
                      <button className="btn-primary text-sm inline-flex items-center">
                        <CheckSquare className="w-4 h-4 mr-1" />
                        Fulfill
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {ITEMS.filter(i => i.status === col).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    {col === 'new' ? <AlertCircle className="w-6 h-6" /> :
                     col === 'in-progress' ? <Clock className="w-6 h-6" /> :
                     <CheckCircle className="w-6 h-6" />}
                  </div>
                  <p className="text-sm">No prescriptions in this category</p>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}


