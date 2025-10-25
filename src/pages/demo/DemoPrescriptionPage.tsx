import { useState, useRef, useEffect } from 'react'
import { 
  Save,
  Send,
  Download,
  Palette,
  Eraser,
  Pen,
  RotateCcw,
  Plus,
  Trash2,
  FileText,
  Printer
} from 'lucide-react'
import { useToast, ToastContainer } from '../../components/ui/Toast'

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

const DEMO_PATIENT: Patient = {
  id: 'demo_1',
  name: 'John Smith',
  age: 35,
  gender: 'Male',
  phone: '+1 (555) 123-4567',
  email: 'john.smith@example.com',
  address: '123 Main Street, City, State 12345',
  medicalHistory: ['Hypertension', 'Allergic to Penicillin'],
  weight: 75,
  height: 175
}

export function DemoPrescriptionPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser'>('pen')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [zoom, setZoom] = useState(1)
  const [prescription, setPrescription] = useState<Prescription>({
    id: 'demo_prescription_1',
    patientId: DEMO_PATIENT.id,
    diagnosis: '',
    medications: [],
    tests: [],
    notes: '',
    doctorName: 'Dr. Sarah Johnson',
    doctorQualification: 'MBBS, MD (General Medicine)',
    doctorRegistration: 'Reg. No: 12345',
    clinicName: 'MediCare Clinic',
    clinicAddress: '123 Medical Center Dr, Health City, HC 12345',
    clinicPhone: '+1 (555) 123-4567',
    date: new Date().toLocaleDateString('en-US'),
    whiteboardData: ''
  })

  const [newMedication, setNewMedication] = useState('')
  const [newTest, setNewTest] = useState('')
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [doctorSignature, setDoctorSignature] = useState('')
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawingSignature, setIsDrawingSignature] = useState(false)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const { toasts, success, error: showError, removeToast } = useToast()

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

  // Signature canvas setup
  useEffect(() => {
    const signatureCanvas = signatureCanvasRef.current
    if (!signatureCanvas) return

    const ctx = signatureCanvas.getContext('2d')
    if (!ctx) return

    // Set signature canvas size
    const resizeSignatureCanvas = () => {
      const rect = signatureCanvas.getBoundingClientRect()
      signatureCanvas.width = rect.width * window.devicePixelRatio
      signatureCanvas.height = rect.height * window.devicePixelRatio
      
      // Scale the context to match the device pixel ratio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      
      // Set signature styles
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }

    resizeSignatureCanvas()
    
    // Re-resize on window resize
    const handleResize = () => resizeSignatureCanvas()
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  // Signature drawing functions
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
    e.preventDefault()
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
    
    // Convert signature to base64
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const signatureData = canvas.toDataURL('image/png').split(',')[1]
    setDoctorSignature(signatureData)
  }

  // Touch support for signature
  const getSignatureTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const touch = e.touches[0]
    
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    }
  }

  const startSignatureTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDrawingSignature(true)
    
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pos = getSignatureTouchPos(e)
    
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const drawSignatureTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingSignature) return
    
    e.preventDefault()
    
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pos = getSignatureTouchPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const stopSignatureTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    stopSignatureDrawing()
  }

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setDoctorSignature('')
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

  const savePrescription = async () => {
    try {
      // Convert canvas to base64 with higher quality
      const canvas = canvasRef.current
      if (!canvas) return

      // Create a high-resolution version of the canvas
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) return

      // Scale up the canvas for better quality
      const scale = 2 // 2x resolution
      tempCanvas.width = canvas.width * scale
      tempCanvas.height = canvas.height * scale
      
      // Draw the original canvas to the temp canvas with scaling
      tempCtx.scale(scale, scale)
      tempCtx.drawImage(canvas, 0, 0)
      
      const whiteboardData = tempCanvas.toDataURL('image/png', 1.0).split(',')[1] // High quality PNG
      
      const updatedPrescription = {
        ...prescription,
        whiteboardData
      }

      setPrescription(updatedPrescription)
      success('Prescription Saved', 'Prescription saved as draft successfully')
    } catch (error) {
      showError('Save Failed', 'Failed to save prescription')
      console.error('Save prescription error:', error)
    }
  }

  const generatePDF = async () => {
    setShowSignatureModal(true)
  }

  const confirmPDFGeneration = async () => {
    try {
      setIsGeneratingPDF(true)
      setShowSignatureModal(false)
      
      // Convert canvas to base64 with higher quality
      const canvas = canvasRef.current
      if (!canvas) return

      // Create a high-resolution version of the canvas
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) return

      // Scale up the canvas for better quality
      const scale = 2 // 2x resolution
      tempCanvas.width = canvas.width * scale
      tempCanvas.height = canvas.height * scale
      
      // Draw the original canvas to the temp canvas with scaling
      tempCtx.scale(scale, scale)
      tempCtx.drawImage(canvas, 0, 0)
      
      const whiteboardData = tempCanvas.toDataURL('image/png', 1.0).split(',')[1] // High quality PNG
      
      const prescriptionData = {
        // Required fields for database (demo uses mock IDs)
        appointmentId: 'demo_appointment_123',
        patientId: 'demo_patient_123',
        
        // Prescription data
        ...prescription,
        whiteboardData,
        doctorSignature,
        
        // Patient information
        patientName: DEMO_PATIENT.name,
        patientAge: DEMO_PATIENT.age,
        patientGender: DEMO_PATIENT.gender,
        patientPhone: DEMO_PATIENT.phone,
        patientEmail: DEMO_PATIENT.email,
        patientAddress: DEMO_PATIENT.address,
        
        // Prescription metadata
        prescriptionId: prescription.id,
        currentDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }

      const response = await fetch('http://localhost:3001/api/prescriptions/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescriptionData),
      })

      if (response.ok) {
        // Create blob and download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `prescription_${DEMO_PATIENT.name}_${Date.now()}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        success('PDF Generated', 'Prescription PDF generated and downloaded successfully')
      } else {
        const errorData = await response.json()
        showError('PDF Generation Failed', errorData.error || 'Failed to generate PDF')
      }
    } catch (error) {
      showError('PDF Generation Failed', 'Failed to generate PDF')
      console.error('Generate PDF error:', error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const generateAndSavePDF = async () => {
    setShowSignatureModal(true)
  }

  const confirmSavePDFGeneration = async () => {
    try {
      setIsGeneratingPDF(true)
      setShowSignatureModal(false)
      
      // Convert canvas to base64 with higher quality
      const canvas = canvasRef.current
      if (!canvas) return

      // Create a high-resolution version of the canvas
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) return

      // Scale up the canvas for better quality
      const scale = 2 // 2x resolution
      tempCanvas.width = canvas.width * scale
      tempCanvas.height = canvas.height * scale
      
      // Draw the original canvas to the temp canvas with scaling
      tempCtx.scale(scale, scale)
      tempCtx.drawImage(canvas, 0, 0)
      
      const whiteboardData = tempCanvas.toDataURL('image/png', 1.0).split(',')[1] // High quality PNG
      
      const prescriptionData = {
        // Required fields for database (demo uses mock IDs)
        appointmentId: 'demo_appointment_123',
        patientId: 'demo_patient_123',
        
        // Prescription data
        ...prescription,
        whiteboardData,
        doctorSignature,
        
        // Patient information
        patientName: DEMO_PATIENT.name,
        patientAge: DEMO_PATIENT.age,
        patientGender: DEMO_PATIENT.gender,
        patientPhone: DEMO_PATIENT.phone,
        patientEmail: DEMO_PATIENT.email,
        patientAddress: DEMO_PATIENT.address,
        
        // Prescription metadata
        prescriptionId: prescription.id,
        currentDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }

      const response = await fetch('http://localhost:3001/api/prescriptions/generate-and-save-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescriptionData),
      })

      if (response.ok) {
        const result = await response.json()
        success('PDF Generated & Saved', `Prescription PDF generated and saved successfully. File: ${result.data.filename}`)
      } else {
        const errorData = await response.json()
        showError('PDF Generation Failed', errorData.error || 'Failed to generate and save PDF')
      }
    } catch (error) {
      showError('PDF Generation Failed', 'Failed to generate and save PDF')
      console.error('Generate and save PDF error:', error)
    } finally {
      setIsGeneratingPDF(false)
    }
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
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 rounded disabled:opacity-50"
              >
                <Download className="w-3 h-3 mr-1 inline" />
                {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
              </button>
              <button 
                onClick={generateAndSavePDF}
                disabled={isGeneratingPDF}
                className="bg-white text-blue-600 hover:bg-gray-100 text-xs px-3 py-1 rounded font-medium disabled:opacity-50"
              >
                <Send className="w-3 h-3 mr-1 inline" />
                {isGeneratingPDF ? 'Saving...' : 'Save PDF'}
              </button>
            </div>
          </div>
        </div>

        {/* Patient & Doctor Details */}
        <div className="bg-white px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Demo Prescription</h2>
                <div className="flex items-center gap-6 mt-1">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Patient:</span> {DEMO_PATIENT.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Age:</span> {DEMO_PATIENT.age}y, {DEMO_PATIENT.gender}
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Weight:</span> {DEMO_PATIENT.weight}kg
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Height:</span> {DEMO_PATIENT.height}cm
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Signature Required</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please sign below to generate the prescription PDF
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
              <canvas
                ref={signatureCanvasRef}
                className="cursor-crosshair border border-gray-200 rounded w-full"
                style={{ height: '120px' }}
                onMouseDown={startSignatureDrawing}
                onMouseMove={drawSignature}
                onMouseUp={stopSignatureDrawing}
                onMouseLeave={stopSignatureDrawing}
                onTouchStart={startSignatureTouch}
                onTouchMove={drawSignatureTouch}
                onTouchEnd={stopSignatureTouch}
              />
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={clearSignature}
                className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Clear Signature
              </button>
              {doctorSignature && (
                <div className="text-sm text-green-600 flex items-center">
                  ✓ Signature captured
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignatureModal(false)}
                className="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmPDFGeneration}
                disabled={!doctorSignature || isGeneratingPDF}
                className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
              </button>
              <button
                onClick={confirmSavePDFGeneration}
                disabled={!doctorSignature || isGeneratingPDF}
                className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPDF ? 'Saving...' : 'Save PDF'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
