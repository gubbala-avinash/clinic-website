import { useState, useEffect, useRef } from 'react'
import { 
  Clock, 
  User, 
  Stethoscope, 
  Pill, 
  FileText, 
  Save, 
  Send, 
  Plus, 
  Trash2,
  Palette,
  Eraser,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  Edit,
  Heart,
  Activity,
  Thermometer,
  Weight,
  Droplets,
  Brain,
  Shield,
  History,
  Printer,
  MessageSquare,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { RichText } from '../../components/editor/RichText'
import { Link } from 'react-router-dom'
import { doctorApi, prescriptionsApi, type Appointment, type Prescription } from '../../services/api'
import { useToast, ToastContainer } from '../../components/ui/Toast'

type Patient = { 
  id: string; 
  name: string; 
  time: string; 
  reason: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  medicalHistory: string[];
  status: 'waiting' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  vitalSigns?: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weight: number;
  };
}

type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

type Prescription = {
  id: string;
  patientId: string;
  diagnosis: string;
  medications: Medication[];
  tests: string[];
  notes: string;
  whiteboardData?: string;
  status: 'draft' | 'submitted';
  createdAt: string;
}

const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Rahul Kumar',
    time: '09:00 AM',
    reason: 'Fever and cough',
    age: 28,
    gender: 'Male',
    phone: '+1 (555) 123-4567',
    email: 'rahul@example.com',
    medicalHistory: ['Hypertension', 'Allergic to Penicillin'],
    status: 'waiting',
    priority: 'high',
    vitalSigns: {
      bloodPressure: '140/90',
      heartRate: 95,
      temperature: 101.2,
      weight: 75
    }
  },
  {
    id: '2',
    name: 'Aisha Khan',
    time: '09:30 AM',
    reason: 'Routine checkup',
    age: 35,
    gender: 'Female',
    phone: '+1 (555) 234-5678',
    email: 'aisha@example.com',
    medicalHistory: ['Diabetes Type 2'],
    status: 'in-progress',
    priority: 'medium',
    vitalSigns: {
      bloodPressure: '120/80',
      heartRate: 72,
      temperature: 98.6,
      weight: 65
    }
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    time: '10:00 AM',
    reason: 'Back pain',
    age: 42,
    gender: 'Female',
    phone: '+1 (555) 345-6789',
    email: 'emily@example.com',
    medicalHistory: [],
    status: 'waiting',
    priority: 'low'
  },
  {
    id: '4',
    name: 'David Kim',
    time: '10:30 AM',
    reason: 'Follow-up consultation',
    age: 55,
    gender: 'Male',
    phone: '+1 (555) 456-7890',
    email: 'david@example.com',
    medicalHistory: ['High Cholesterol', 'Heart Disease'],
    status: 'completed',
    priority: 'medium'
  }
]

export function DoctorDashboard() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'patients' | 'prescription'>('patients')
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toasts, success, error: showError, removeToast } = useToast()

  // Load appointments and convert to patients
  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      setIsLoading(true)
      console.log('Loading doctor appointments...')
      const response = await doctorApi.getMyAppointments()
      console.log('Doctor appointments response:', response)
      
      if (response.success) {
        setAppointments(response.data)
        // Convert appointments to patient format
        const patientsData = response.data.map((apt: Appointment) => ({
          id: apt.id,
          name: apt.patientName,
          time: apt.time,
          reason: apt.reason,
          age: 30, // Default age since we don't have it in appointments
          gender: 'Unknown', // Default gender
          phone: apt.phone || '',
          email: apt.email || '',
          medicalHistory: [], // Will be populated from patient data
          status: apt.status === 'scheduled' ? 'waiting' : 
                 apt.status === 'confirmed' ? 'in-progress' : 
                 apt.status === 'completed' ? 'completed' : 'waiting',
          priority: 'medium' as const,
          vitalSigns: undefined
        }))
        setPatients(patientsData)
        success('My Appointments Loaded', `Found ${response.total} appointments for you`)
      } else {
        showError('Failed to load appointments', 'Please try again later')
      }
    } catch (err) {
      showError('Failed to load appointments', 'Please check your connection')
      console.error('Error loading doctor appointments:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Prescription state
  const [prescription, setPrescription] = useState<Prescription>({
    id: '',
    patientId: '',
    diagnosis: '',
    medications: [],
    tests: [],
    notes: '',
    whiteboardData: '',
    status: 'draft',
    createdAt: new Date().toISOString()
  })

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.reason.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || patient.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const stats = {
    total: patients.length,
    waiting: patients.filter(p => p.status === 'waiting').length,
    inProgress: patients.filter(p => p.status === 'in-progress').length,
    completed: patients.filter(p => p.status === 'completed').length,
    highPriority: patients.filter(p => p.priority === 'high').length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
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

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setActiveTab('prescription')
    setPrescription({
      id: `presc_${Date.now()}`,
      patientId: patient.id,
      diagnosis: '',
      medications: [],
      tests: [],
      notes: '',
      whiteboardData: '',
      status: 'draft',
      createdAt: new Date().toISOString()
    })
  }

  const addMedication = () => {
    const newMed: Medication = {
      id: `med_${Date.now()}`,
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      notes: ''
    }
    setPrescription({
      ...prescription,
      medications: [...prescription.medications, newMed]
    })
  }

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setPrescription({
      ...prescription,
      medications: prescription.medications.map(med =>
        med.id === id ? { ...med, [field]: value } : med
      )
    })
  }

  const removeMedication = (id: string) => {
    setPrescription({
      ...prescription,
      medications: prescription.medications.filter(med => med.id !== id)
    })
  }

  const addTest = () => {
    setPrescription({
      ...prescription,
      tests: [...prescription.tests, '']
    })
  }

  const updateTest = (index: number, value: string) => {
    const newTests = [...prescription.tests]
    newTests[index] = value
    setPrescription({ ...prescription, tests: newTests })
  }

  const removeTest = (index: number) => {
    setPrescription({
      ...prescription,
      tests: prescription.tests.filter((_, i) => i !== index)
    })
  }

  const savePrescription = () => {
    setPrescription({ ...prescription, status: 'draft' })
    console.log('Prescription saved as draft:', prescription)
  }

  const submitPrescription = () => {
    setPrescription({ ...prescription, status: 'submitted' })
    console.log('Prescription submitted:', prescription)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-600">Manage your patients and prescriptions</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary inline-flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
          <button className="btn-primary inline-flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
              <p className="text-sm font-medium text-gray-600">Waiting</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.waiting}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
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
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">My Appointments</h2>
              <span className="text-sm text-gray-500">{filteredPatients.length} appointments</span>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  placeholder="Search appointments..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="form-input pl-10" 
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-input text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="waiting">Waiting</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select 
                  value={priorityFilter} 
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="form-input text-sm"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Patient Cards */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredPatients.map((patient) => (
                <div 
                  key={patient.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedPatient?.id === patient.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => handlePatientSelect(patient)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{patient.name}</div>
                      <div className="text-sm text-gray-600">{patient.time} • {patient.age}y, {patient.gender}</div>
                    </div>
                    <div className="flex gap-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                        {patient.status}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(patient.priority)}`}>
                        {patient.priority}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">{patient.reason}</div>
                  {patient.medicalHistory.length > 0 && (
                    <div className="text-xs text-gray-500">
                      <strong>History:</strong> {patient.medicalHistory.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Patient Details & Prescription */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Patient Information</h2>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-sm">
                      <History className="w-4 h-4 mr-1" />
                      History
                    </button>
                    <button className="btn-secondary text-sm">
                      <Printer className="w-4 h-4 mr-1" />
                      Print
                    </button>
                    <Link 
                      to={`/doctor/prescription/${selectedPatient.id}`}
                      className="btn-primary text-sm inline-flex items-center"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Write Prescription
                    </Link>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{selectedPatient.name}</div>
                        <div className="text-sm text-gray-600">Patient</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{selectedPatient.age} years, {selectedPatient.gender}</div>
                        <div className="text-sm text-gray-600">Age & Gender</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{selectedPatient.phone}</div>
                        <div className="text-sm text-gray-600">Phone</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">{selectedPatient.email}</div>
                        <div className="text-sm text-gray-600">Email</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-900 mb-1">Reason for Visit</div>
                      <div className="text-blue-800">{selectedPatient.reason}</div>
                    </div>
                    
                    {selectedPatient.medicalHistory.length > 0 && (
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <div className="text-sm font-medium text-yellow-900 mb-1">Medical History</div>
                        <div className="text-yellow-800">{selectedPatient.medicalHistory.join(', ')}</div>
                      </div>
                    )}

                    {selectedPatient.vitalSigns && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-sm font-medium text-green-900 mb-2">Vital Signs</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-green-600" />
                            <span>BP: {selectedPatient.vitalSigns.bloodPressure}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-green-600" />
                            <span>HR: {selectedPatient.vitalSigns.heartRate} bpm</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Thermometer className="w-4 h-4 text-green-600" />
                            <span>Temp: {selectedPatient.vitalSigns.temperature}°F</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Weight className="w-4 h-4 text-green-600" />
                            <span>Weight: {selectedPatient.vitalSigns.weight} kg</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="card p-12 text-center">
              <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Patient</h3>
              <p className="text-gray-600">Choose a patient from the list to view details and create prescriptions</p>
            </div>
          )}
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}