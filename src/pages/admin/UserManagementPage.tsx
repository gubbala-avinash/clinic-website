import { useState, useEffect } from 'react'
import { 
  Plus, 
  Users, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  GraduationCap, 
  Stethoscope,
  Edit,
  Trash2,
  Search,
  Filter,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { adminApi, type Doctor } from '../../services/api'

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'doctor' | 'receptionist';
  isActive: boolean;
  doctorInfo?: {
    qualification: string;
    specialization: string[];
    experience: number;
    licenseNumber: string;
    consultationFee: number;
  };
  createdAt: string;
}

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [doctors, setDoctors] = useState<User[]>([])
  const [receptionists, setReceptionists] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'doctor' | 'receptionist'>('all')
  const [showCreateDoctorModal, setShowCreateDoctorModal] = useState(false)
  const [showCreateReceptionistModal, setShowCreateReceptionistModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form states
  const [doctorForm, setDoctorForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    qualification: '',
    specialization: '',
    experience: '',
    licenseNumber: '',
    consultationFee: ''
  })

  const [receptionistForm, setReceptionistForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

  // Load users on component mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await adminApi.getUsers()
      
      if (response.success) {
        setUsers(response.data)
        setDoctors(response.data.filter(user => user.role === 'doctor'))
        setReceptionists(response.data.filter(user => user.role === 'receptionist'))
      } else {
        setError('Failed to load users')
      }
    } catch (err) {
      setError('Failed to load users')
      console.error('Error loading users:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await adminApi.createDoctor({
        firstName: doctorForm.firstName,
        lastName: doctorForm.lastName,
        email: doctorForm.email,
        phone: doctorForm.phone,
        qualification: doctorForm.qualification,
        specialization: doctorForm.specialization ? [doctorForm.specialization] : undefined,
        experience: doctorForm.experience ? parseInt(doctorForm.experience) : undefined,
        licenseNumber: doctorForm.licenseNumber,
        consultationFee: doctorForm.consultationFee ? parseInt(doctorForm.consultationFee) : undefined
      })

      if (response.success) {
        setSuccess('Doctor account created successfully!')
        setDoctorForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          qualification: '',
          specialization: '',
          experience: '',
          licenseNumber: '',
          consultationFee: ''
        })
        setShowCreateDoctorModal(false)
        loadUsers() // Refresh users list
      } else {
        setError('Failed to create doctor account')
      }
    } catch (err) {
      setError('Failed to create doctor account')
      console.error('Error creating doctor:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateReceptionist = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await adminApi.createReceptionist({
        firstName: receptionistForm.firstName,
        lastName: receptionistForm.lastName,
        email: receptionistForm.email,
        phone: receptionistForm.phone
      })

      if (response.success) {
        setSuccess('Receptionist account created successfully!')
        setReceptionistForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: ''
        })
        setShowCreateReceptionistModal(false)
        loadUsers() // Refresh users list
      } else {
        setError('Failed to create receptionist account')
      }
    } catch (err) {
      setError('Failed to create receptionist account')
      console.error('Error creating receptionist:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">Manage doctors and receptionists</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateDoctorModal(true)}
                className="btn-primary inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Doctor
              </button>
              <button
                onClick={() => setShowCreateReceptionistModal(true)}
                className="btn-secondary inline-flex items-center"
              >
                <Users className="w-4 h-4 mr-2" />
                Add Receptionist
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">{success}</div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                <p className="text-2xl font-semibold text-gray-900">{doctors.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Users className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Receptionists</p>
                <p className="text-2xl font-semibold text-gray-900">{receptionists.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <User className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as 'all' | 'doctor' | 'receptionist')}
                >
                  <option value="all">All Users</option>
                  <option value="doctor">Doctors</option>
                  <option value="receptionist">Receptionists</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {filterRole === 'all' ? 'All Users' : 
               filterRole === 'doctor' ? 'Doctors' : 'Receptionists'} 
              ({filteredUsers.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${
                      user.role === 'doctor' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {user.role === 'doctor' ? <Stethoscope className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">{user.phone}</p>
                      {user.doctorInfo && (
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <GraduationCap className="w-4 h-4 mr-1" />
                            {user.doctorInfo.qualification}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {user.doctorInfo.experience} years
                          </span>
                          <span>₹{user.doctorInfo.consultationFee}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button className="p-2 text-gray-400 hover:text-blue-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Doctor Modal */}
        {showCreateDoctorModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Create New Doctor Account</h2>
                <button 
                  onClick={() => setShowCreateDoctorModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleCreateDoctor} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">First Name *</label>
                    <input 
                      className="form-input" 
                      placeholder="Enter first name" 
                      value={doctorForm.firstName} 
                      onChange={(e)=>setDoctorForm(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Last Name *</label>
                    <input 
                      className="form-input" 
                      placeholder="Enter last name" 
                      value={doctorForm.lastName} 
                      onChange={(e)=>setDoctorForm(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Email Address *</label>
                    <input 
                      type="email"
                      className="form-input" 
                      placeholder="doctor@clinic.com" 
                      value={doctorForm.email} 
                      onChange={(e)=>setDoctorForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Phone Number *</label>
                    <input 
                      className="form-input" 
                      placeholder="+91 9876543210" 
                      value={doctorForm.phone} 
                      onChange={(e)=>setDoctorForm(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Qualification</label>
                    <input 
                      className="form-input" 
                      placeholder="MBBS, MD, etc." 
                      value={doctorForm.qualification} 
                      onChange={(e)=>setDoctorForm(prev => ({ ...prev, qualification: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="form-label">Specialization</label>
                    <select 
                      className="form-input" 
                      value={doctorForm.specialization} 
                      onChange={(e)=>setDoctorForm(prev => ({ ...prev, specialization: e.target.value }))}
                    >
                      <option value="">Select Specialization</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Gynecology">Gynecology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Psychiatry">Psychiatry</option>
                      <option value="Emergency Medicine">Emergency Medicine</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Experience (Years)</label>
                    <input 
                      type="number"
                      className="form-input" 
                      placeholder="5" 
                      value={doctorForm.experience} 
                      onChange={(e)=>setDoctorForm(prev => ({ ...prev, experience: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="form-label">License Number</label>
                    <input 
                      className="form-input" 
                      placeholder="Medical license number" 
                      value={doctorForm.licenseNumber} 
                      onChange={(e)=>setDoctorForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="form-label">Consultation Fee (₹)</label>
                    <input 
                      type="number"
                      className="form-input" 
                      placeholder="500" 
                      value={doctorForm.consultationFee} 
                      onChange={(e)=>setDoctorForm(prev => ({ ...prev, consultationFee: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowCreateDoctorModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn-primary"
                    disabled={!doctorForm.firstName || !doctorForm.lastName || !doctorForm.email || !doctorForm.phone || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Doctor
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Receptionist Modal */}
        {showCreateReceptionistModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Create New Receptionist Account</h2>
                <button 
                  onClick={() => setShowCreateReceptionistModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleCreateReceptionist} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">First Name *</label>
                    <input 
                      className="form-input" 
                      placeholder="Enter first name" 
                      value={receptionistForm.firstName} 
                      onChange={(e)=>setReceptionistForm(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Last Name *</label>
                    <input 
                      className="form-input" 
                      placeholder="Enter last name" 
                      value={receptionistForm.lastName} 
                      onChange={(e)=>setReceptionistForm(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Email Address *</label>
                    <input 
                      type="email"
                      className="form-input" 
                      placeholder="receptionist@clinic.com" 
                      value={receptionistForm.email} 
                      onChange={(e)=>setReceptionistForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Phone Number *</label>
                    <input 
                      className="form-input" 
                      placeholder="+91 9876543210" 
                      value={receptionistForm.phone} 
                      onChange={(e)=>setReceptionistForm(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowCreateReceptionistModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn-primary"
                    disabled={!receptionistForm.firstName || !receptionistForm.lastName || !receptionistForm.email || !receptionistForm.phone || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Create Receptionist
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}