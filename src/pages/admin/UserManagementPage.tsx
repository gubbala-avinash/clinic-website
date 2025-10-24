import { useState } from 'react'
import { 
  Users, 
  UserPlus, 
  Stethoscope, 
  UserCheck, 
  Mail, 
  Phone, 
  GraduationCap,
  Award,
  DollarSign,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Modal } from '../../components/ui/Dialog'
import { adminApi } from '../../services/api'

export function UserManagementPage() {
  const [showCreateDoctorModal, setShowCreateDoctorModal] = useState(false)
  const [showCreateReceptionistModal, setShowCreateReceptionistModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Doctor form state
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

  // Receptionist form state
  const [receptionistForm, setReceptionistForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Create and manage staff accounts</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
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
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Doctor Card */}
        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Stethoscope className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Add New Doctor</h3>
              <p className="text-gray-600">Create account for new doctor</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Create a new doctor account with specialization, experience, and consultation fee details.
          </p>
          <button 
            onClick={() => setShowCreateDoctorModal(true)}
            className="btn-primary w-full"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create Doctor Account
          </button>
        </div>

        {/* Create Receptionist Card */}
        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Add New Receptionist</h3>
              <p className="text-gray-600">Create account for new receptionist</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Create a new receptionist account for managing appointments and patient interactions.
          </p>
          <button 
            onClick={() => setShowCreateReceptionistModal(true)}
            className="btn-primary w-full"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create Receptionist Account
          </button>
        </div>
      </div>

      {/* Create Doctor Modal */}
      <Modal 
        isOpen={showCreateDoctorModal}
        onClose={() => setShowCreateDoctorModal(false)}
        title="Create New Doctor Account"
      >
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
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Create Doctor
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Receptionist Modal */}
      <Modal 
        isOpen={showCreateReceptionistModal}
        onClose={() => setShowCreateReceptionistModal(false)}
        title="Create New Receptionist Account"
      >
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
                  <UserCheck className="w-4 h-4 mr-2" />
                  Create Receptionist
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
