import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  User,
  Calendar,
  Pill,
  FileText,
  Save,
  Send
} from 'lucide-react'
import { useState } from 'react'
type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  notes: string;
  status: 'available' | 'out-of-stock' | 'substitute';
}

export function PharmacyDetailPage() {
  const { id } = useParams()
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Amoxicillin 500mg',
      dosage: '500mg',
      frequency: '3 times daily',
      duration: '7 days',
      quantity: 21,
      notes: 'Take with food',
      status: 'available'
    },
    {
      id: '2',
      name: 'Paracetamol 500mg',
      dosage: '500mg',
      frequency: 'As needed',
      duration: '5 days',
      quantity: 10,
      notes: 'For fever and pain',
      status: 'available'
    }
  ])
  const [isFulfilling, setIsFulfilling] = useState(false)
  const [notes, setNotes] = useState('')

  const prescription = {
    id: id,
    patient: 'Rahul Kumar',
    doctor: 'Dr. Sarah Sharma',
    date: '2025-10-18',
    time: '10:30 AM',
    diagnosis: 'Upper respiratory infection',
    status: 'pending'
  }

  const handleFulfill = async () => {
    setIsFulfilling(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsFulfilling(false)
  }

  const updateMedication = (id: string, field: keyof Medication, value: string | number) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'out-of-stock': return 'bg-red-100 text-red-800'
      case 'substitute': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/pharmacy" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prescription #{id}</h1>
            <p className="text-gray-600">Review and fulfill prescription</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary inline-flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </button>
          <button className="btn-secondary inline-flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </button>
        </div>
      </div>

      {/* Prescription Info */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Prescription Details</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">{prescription.patient}</div>
                <div className="text-sm text-gray-600">Patient</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">{prescription.doctor}</div>
                <div className="text-sm text-gray-600">Prescribing Doctor</div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">{prescription.date}</div>
                <div className="text-sm text-gray-600">Date</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">{prescription.time}</div>
                <div className="text-sm text-gray-600">Time</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-900 mb-1">Diagnosis</div>
          <div className="text-blue-800">{prescription.diagnosis}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Prescription Image */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prescription Image</h3>
          <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <div className="text-gray-500 text-sm">Prescription Image</div>
              <div className="text-gray-400 text-xs">Click to view full size</div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="btn-secondary text-sm">View Full Size</button>
            <button className="btn-secondary text-sm">Download</button>
          </div>
        </div>

        {/* Medications */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Medications</h3>
          <div className="space-y-4">
            {medications.map((med) => (
              <div key={med.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{med.name}</div>
                    <div className="text-sm text-gray-600">{med.dosage} • {med.frequency}</div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(med.status)}`}>
                    {med.status.replace('-', ' ')}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Quantity</label>
                    <input 
                      type="number"
                      className="form-input text-sm" 
                      value={med.quantity}
                      onChange={(e) => updateMedication(med.id, 'quantity', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Duration</label>
                    <input 
                      className="form-input text-sm" 
                      value={med.duration}
                      onChange={(e) => updateMedication(med.id, 'duration', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-700">Notes</label>
                  <textarea 
                    className="form-input text-sm" 
                    rows={2}
                    value={med.notes}
                    onChange={(e) => updateMedication(med.id, 'notes', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fulfillment Notes */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fulfillment Notes</h3>
        <textarea 
          className="form-input" 
          rows={4}
          placeholder="Add any notes about substitutions, availability, or special instructions..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button className="btn-secondary inline-flex items-center">
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </button>
        <button 
          onClick={handleFulfill}
          disabled={isFulfilling}
          className="btn-primary inline-flex items-center"
        >
          {isFulfilling ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Fulfilling...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Fulfilled
            </>
          )}
        </button>
      </div>
    </div>
  )
}


