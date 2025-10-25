import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doctorApi, httpClient, type Appointment } from '../../services/api'
import { useToast, ToastContainer } from '../../components/ui/Toast'
import { useAuthStore } from '../../store/auth'
import { 
  ArrowLeft,
  Save,
  Send,
  Palette,
  Eraser,
  Download,
  Upload,
  Printer,
  Pen,
  Circle,
  Square,
  Type,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react'

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  medicalHistory: string[];
  weight: number;
  height: number;
}

type Prescription = {
  id: string;
  patientId: string;
  diagnosis: string;
  medications: string[];
  tests: string[];
  notes: string;
  doctorName: string;
  doctorQualification: string;
  doctorRegistration: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  date: string;
  whiteboardData: string;
}

export function PrescriptionPage() {
  const { patientId } = useParams()
  const { user } = useAuthStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser'>('pen')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [zoom, setZoom] = useState(1)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toasts, success, error, removeToast } = useToast()
  const [prescription, setPrescription] = useState<Prescription>({
    id: `presc_${Date.now()}`,
    patientId: patientId || '',
    diagnosis: '',
    medications: [],
    tests: [],
    notes: '',
    doctorName: user?.firstName && user?.lastName ? `Dr. ${user.firstName} ${user.lastName}` : 'Dr. Unknown',
    doctorQualification: 'MBBS, MD (General Medicine)', // Default qualification
    doctorRegistration: `Reg. No: ${user?.id || 'Unknown'}`, // Use user ID as registration
    clinicName: 'MediCare Clinic', // Default clinic name
    clinicAddress: '123 Medical Center Dr, Health City, HC 12345', // Default clinic address
    clinicPhone: '+1 (555) 123-4567', // Default clinic phone
    date: new Date().toLocaleDateString('en-IN'),
    whiteboardData: ''
  })

  const [newMedication, setNewMedication] = useState('')
  const [newTest, setNewTest] = useState('')
  
  // Signature modal state
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [doctorSignature, setDoctorSignature] = useState<string>('')
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawingSignature, setIsDrawingSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match container
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      
      // Set default styles after resize
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [strokeColor, strokeWidth])

  // Load patient data
  useEffect(() => {
    loadPatientData()
  }, [patientId])

  const loadPatientData = async () => {
    try {
      setIsLoading(true)
      console.log('Loading patient data for ID:', patientId)
      
      // Get all doctor appointments to find the specific patient
      const response = await doctorApi.getMyAppointments()
      
      if (response.success) {
        // Find the appointment for this patient
        const appointment = response.data.find(apt => apt.id === patientId)
        
        if (appointment) {
          // Convert appointment data to patient format
          const patientData: Patient = {
            id: appointment.id,
            name: appointment.patientName,
            age: 30, // Default age since we don't have it in appointments
            gender: 'Unknown', // Default gender
            phone: appointment.phone || '',
            email: appointment.email || '',
            address: 'Address not available', // Default address
            medicalHistory: [], // Will be populated from patient data
            weight: 70, // Default weight
            height: 170 // Default height
          }
          
          setPatient(patientData)
          success('Patient Data Loaded', `Loaded data for ${appointment.patientName}`)
          
          // Start prescription process - update appointment status to in-progress
          try {
            await doctorApi.startPrescription(patientId)
            console.log('Prescription started for appointment:', patientId)
          } catch (error) {
            console.error('Failed to start prescription:', error)
            // Don't show error to user as this is background operation
          }
        } else {
          error('Patient Not Found', 'Could not find patient with this ID')
        }
      } else {
        error('Failed to load patient data', 'Please try again later')
      }
    } catch (err) {
      error('Failed to load patient data', 'Please check your connection')
      console.error('Error loading patient data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDrawing(true)
    
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pos = getMousePos(e)
    
    // Set stroke properties
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
    } else {
      ctx.globalCompositeOperation = 'source-over'
    }

    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    
    e.preventDefault()
    
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pos = getMousePos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  // Signature canvas functions
  const getSignatureMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const startSignatureDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawingSignature(true)
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pos = getSignatureMousePos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const drawSignature = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingSignature) return
    
    e.preventDefault()
    
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pos = getSignatureMousePos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const stopSignatureDrawing = () => {
    setIsDrawingSignature(false)
  }

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setDoctorSignature('')
  }

  // Initialize signature canvas
  useEffect(() => {
    const signatureCanvas = signatureCanvasRef.current
    if (!signatureCanvas) return

    const ctx = signatureCanvas.getContext('2d')
    if (!ctx) return

    const resizeSignatureCanvas = () => {
      const rect = signatureCanvas.getBoundingClientRect()
      signatureCanvas.width = rect.width * window.devicePixelRatio
      signatureCanvas.height = rect.height * window.devicePixelRatio
      
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }

    resizeSignatureCanvas()
    
    const handleResize = () => resizeSignatureCanvas()
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // PDF generation functions
  const generatePDF = async () => {
    if (!patient) {
      error('Patient data not loaded', 'Please wait for patient data to load')
      return
    }

    try {
      setIsGeneratingPDF(true)
      
      // Get whiteboard content as base64
      const canvas = canvasRef.current
      if (!canvas) {
        error('Canvas not found', 'Please try again')
        return
      }

      // Create high-resolution canvas for better PDF quality
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) return

      tempCanvas.width = canvas.width * 2
      tempCanvas.height = canvas.height * 2
      tempCtx.scale(2, 2)
      tempCtx.drawImage(canvas, 0, 0)
      
      const whiteboardData = tempCanvas.toDataURL('image/png')
      
      // Get signature as base64
      const signatureCanvas = signatureCanvasRef.current
      const signatureData = signatureCanvas ? signatureCanvas.toDataURL('image/png') : ''

      const prescriptionData = {
        patientName: patient.name,
        patientAge: patient.age,
        patientGender: patient.gender,
        patientPhone: patient.phone,
        patientEmail: patient.email,
        doctorName: prescription.doctorName,
        doctorQualification: prescription.doctorQualification,
        doctorRegistration: prescription.doctorRegistration,
        clinicName: prescription.clinicName,
        clinicAddress: prescription.clinicAddress,
        clinicPhone: prescription.clinicPhone,
        diagnosis: prescription.diagnosis,
        medications: prescription.medications,
        tests: prescription.tests,
        notes: prescription.notes,
        whiteboardData: whiteboardData,
        doctorSignature: signatureData,
        currentDate: new Date().toLocaleDateString('en-IN'),
        prescriptionId: prescription.id
      }

      console.log('Generating PDF with data:', prescriptionData)
      
      // Get token and debug
      const token = localStorage.getItem('authToken')
      console.log('Auth token:', token ? 'Present' : 'Missing')
      
      // Call backend to generate PDF (direct to clinic service like demo)
      const response = await fetch('http://localhost:3001/api/prescriptions/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(prescriptionData)
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `prescription-${patient.name}-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        success('PDF Generated', 'Prescription PDF has been downloaded successfully')
      } else {
        const errorData = await response.json()
        error('PDF Generation Failed', errorData.error || 'Failed to generate PDF')
      }
    } catch (err) {
      console.error('PDF generation error:', err)
      error('PDF Generation Failed', 'Please check your connection and try again')
    } finally {
      setIsGeneratingPDF(false)
      setShowSignatureModal(false)
    }
  }

  const generateAndSavePDF = async () => {
    if (!patient) {
      error('Patient data not loaded', 'Please wait for patient data to load')
      return
    }

    try {
      setIsGeneratingPDF(true)
      
      // Get whiteboard content as base64
      const canvas = canvasRef.current
      if (!canvas) {
        error('Canvas not found', 'Please try again')
        return
      }

      // Create high-resolution canvas for better PDF quality
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) return

      tempCanvas.width = canvas.width * 2
      tempCanvas.height = canvas.height * 2
      tempCtx.scale(2, 2)
      tempCtx.drawImage(canvas, 0, 0)
      
      const whiteboardData = tempCanvas.toDataURL('image/png')
      
      // Get signature as base64
      const signatureCanvas = signatureCanvasRef.current
      const signatureData = signatureCanvas ? signatureCanvas.toDataURL('image/png') : ''

      const prescriptionData = {
        // Required fields for database - ONLY ESSENTIAL
        appointmentId: patientId,
        patientId: patientId,
        
        // PDF content for generation (all the visual data)
        patientName: patient.name,
        patientAge: patient.age,
        patientGender: patient.gender,
        patientPhone: patient.phone,
        patientEmail: patient.email,
        doctorName: prescription.doctorName,
        doctorQualification: prescription.doctorQualification,
        doctorRegistration: prescription.doctorRegistration,
        clinicName: prescription.clinicName,
        clinicAddress: prescription.clinicAddress,
        clinicPhone: prescription.clinicPhone,
        diagnosis: prescription.diagnosis,
        medications: prescription.medications,
        tests: prescription.tests,
        notes: prescription.notes,
        whiteboardData: whiteboardData,
        doctorSignature: signatureData,
        currentDate: new Date().toLocaleDateString('en-IN'),
        prescriptionId: prescription.id
      }

      console.log('Generating and saving PDF with data:', prescriptionData)
      
      // Get token and debug
      const token = localStorage.getItem('authToken')
      console.log('Auth token for save:', token ? 'Present' : 'Missing')
      
      // Call backend to generate and save PDF (direct to clinic service like demo)
      const response = await fetch('http://localhost:3001/api/prescriptions/generate-and-save-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(prescriptionData)
      })

      if (response.ok) {
        const result = await response.json()
        success('PDF Saved', `Prescription PDF has been saved successfully. File: ${result.fileName}`)
        
        // Complete prescription process - update appointment status to completed
        try {
          await doctorApi.completePrescription(patientId, result.prescriptionId || prescription.id)
          console.log('Prescription completed for appointment:', patientId)
          success('Prescription Completed', 'Appointment has been marked as completed and sent to pharmacy')
        } catch (error) {
          console.error('Failed to complete prescription:', error)
          // Show warning but don't fail the whole process
          error('Status Update Failed', 'PDF saved but failed to update appointment status')
        }
      } else {
        const errorData = await response.json()
        error('PDF Save Failed', errorData.error || 'Failed to save PDF')
      }
    } catch (err) {
      console.error('PDF save error:', err)
      error('PDF Save Failed', 'Please check your connection and try again')
    } finally {
      setIsGeneratingPDF(false)
      setShowSignatureModal(false)
    }
  }

  const handleSavePrescription = () => {
    setShowSignatureModal(true)
  }

  const handleSubmitPrescription = () => {
    setShowSignatureModal(true)
  }

  const confirmPDFGeneration = () => {
    generatePDF()
  }

  const confirmSavePDFGeneration = () => {
    generateAndSavePDF()
  }

  const addMedication = () => {
    if (newMedication.trim()) {
      setPrescription({
        ...prescription,
        medications: [...prescription.medications, newMedication.trim()]
      })
      setNewMedication('')
    }
  }

  const removeMedication = (index: number) => {
    setPrescription({
      ...prescription,
      medications: prescription.medications.filter((_, i) => i !== index)
    })
  }

  const addTest = () => {
    if (newTest.trim()) {
      setPrescription({
        ...prescription,
        tests: [...prescription.tests, newTest.trim()]
      })
      setNewTest('')
    }
  }

  const removeTest = (index: number) => {
    setPrescription({
      ...prescription,
      tests: prescription.tests.filter((_, i) => i !== index)
    })
  }

  const savePrescription = () => {
    if (!patient) {
      error('Patient data not loaded', 'Please wait for patient data to load')
      return
    }
    setShowSignatureModal(true)
  }

  const submitPrescription = () => {
    if (!patient) {
      error('Patient data not loaded', 'Please wait for patient data to load')
      return
    }
    setShowSignatureModal(true)
  }

  return (
    <div className="fixed inset-0 bg-white z-50">
      {/* Compact Header with Branding */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b border-gray-200">
        {/* Hospital Branding Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">M</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">{prescription.clinicName}</h1>
                <p className="text-xs opacity-90">{prescription.clinicAddress} • {prescription.clinicPhone}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={savePrescription}
                className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 rounded"
              >
                <Save className="w-3 h-3 mr-1 inline" />
                Save
              </button>
              <button 
                onClick={submitPrescription}
                className="bg-white text-blue-600 hover:bg-gray-100 text-xs px-3 py-1 rounded font-medium"
              >
                <Send className="w-3 h-3 mr-1 inline" />
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* Patient & Doctor Details */}
        <div className="bg-white px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/doctor" className="p-1 hover:bg-gray-100 rounded">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Digital Prescription</h2>
                <div className="flex items-center gap-6 mt-1">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Patient:</span> {patient?.name || 'Loading...'}
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Age:</span> {patient?.age || 'N/A'}y, {patient?.gender || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Weight:</span> {patient?.weight || 'N/A'}kg
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Height:</span> {patient?.height || 'N/A'}cm
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-gray-600">
              <div className="font-medium text-gray-900">{prescription.doctorName}</div>
              <div className="text-gray-500">{prescription.doctorQualification}</div>
              <div className="text-gray-500">{prescription.doctorRegistration}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Whiteboard Container */}
      <div className="absolute inset-0 overflow-auto bg-white" style={{ top: '100px' }}>
        <div className="relative" style={{ width: '200%', height: '200%', minHeight: '100vh' }}>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair bg-white"
            style={{ width: '100%', height: '100%' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={(e) => {
              e.preventDefault()
              const touch = e.touches[0]
              const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
              })
              startDrawing(mouseEvent as any)
            }}
            onTouchMove={(e) => {
              e.preventDefault()
              const touch = e.touches[0]
              const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
              })
              draw(mouseEvent as any)
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              stopDrawing()
            }}
          />
        </div>
      </div>
      
      {/* Floating Tools - Bottom Row */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2">
        <button
          onClick={() => setCurrentTool('pen')}
          className={`p-2 rounded ${currentTool === 'pen' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Pen"
        >
          <Pen className="w-4 h-4" />
        </button>
        <button
          onClick={() => setCurrentTool('eraser')}
          className={`p-2 rounded ${currentTool === 'eraser' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Eraser"
        >
          <Eraser className="w-4 h-4" />
        </button>
        <button
          onClick={clearCanvas}
          className="p-2 rounded text-gray-600 hover:bg-gray-100"
          title="Clear"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <input
          type="color"
          value={strokeColor}
          onChange={(e) => setStrokeColor(e.target.value)}
          className="w-8 h-8 border-0 rounded cursor-pointer"
          title="Color"
        />
        <input
          type="range"
          min="1"
          max="10"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="w-16"
          title="Size"
        />
      </div>


      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Doctor Signature</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please sign below to confirm the prescription:
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
              <canvas
                ref={signatureCanvasRef}
                className="w-full h-32 border border-gray-200 rounded cursor-crosshair"
                onMouseDown={startSignatureDrawing}
                onMouseMove={drawSignature}
                onMouseUp={stopSignatureDrawing}
                onMouseLeave={stopSignatureDrawing}
              />
            </div>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={clearSignature}
                className="btn-secondary text-sm px-3 py-2"
              >
                Clear
              </button>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignatureModal(false)}
                className="btn-secondary flex-1"
                disabled={isGeneratingPDF}
              >
                Cancel
              </button>
              <button
                onClick={confirmPDFGeneration}
                className="btn-primary flex-1"
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
              </button>
              <button
                onClick={confirmSavePDFGeneration}
                className="btn-secondary flex-1"
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? 'Saving...' : 'Save & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
