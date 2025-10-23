import { useState } from 'react'
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical,
  User,
  Phone,
  Mail,
  Calendar,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'

type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  lastVisit: string;
  status: 'active' | 'inactive';
  medicalHistory: string[];
}

const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Rahul Kumar',
    email: 'rahul@example.com',
    phone: '+1 (555) 123-4567',
    age: 28,
    gender: 'Male',
    lastVisit: '2025-10-15',
    status: 'active',
    medicalHistory: ['Hypertension', 'Allergic to Penicillin']
  },
  {
    id: '2',
    name: 'Aisha Khan',
    email: 'aisha@example.com',
    phone: '+1 (555) 234-5678',
    age: 35,
    gender: 'Female',
    lastVisit: '2025-10-12',
    status: 'active',
    medicalHistory: ['Diabetes Type 2']
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    phone: '+1 (555) 345-6789',
    age: 42,
    gender: 'Female',
    lastVisit: '2025-10-10',
    status: 'active',
    medicalHistory: []
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david@example.com',
    phone: '+1 (555) 456-7890',
    age: 55,
    gender: 'Male',
    lastVisit: '2025-09-28',
    status: 'inactive',
    medicalHistory: ['High Cholesterol']
  }
]

export function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.phone.includes(searchQuery)
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: patients.length,
    active: patients.filter(p => p.status === 'active').length,
    inactive: patients.filter(p => p.status === 'inactive').length,
    newThisMonth: patients.filter(p => new Date(p.lastVisit) > new Date('2025-10-01')).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600">Manage patient records and medical history</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Patient
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Patients</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Patients</p>
              <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-blue-600">{stats.newThisMonth}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                placeholder="Search patients by name, email, or phone..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="btn-secondary inline-flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Patient</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Age/Gender</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Last Visit</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-500">ID: {patient.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        {patient.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {patient.phone}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-900">
                      {patient.age} years, {patient.gender}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-900">{patient.lastVisit}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      patient.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-md">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-md">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Patient</h2>
            <form className="space-y-4">
              <div>
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Enter patient name" />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="patient@example.com" />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="+1 (555) 123-4567" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Age</label>
                  <input type="number" className="form-input" placeholder="25" />
                </div>
                <div>
                  <label className="form-label">Gender</label>
                  <select className="form-input">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
