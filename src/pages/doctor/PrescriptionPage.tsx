import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
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

const MOCK_PATIENT: Patient = {
  id: '1',
  name: 'Rahul Kumar',
  age: 28,
  gender: 'Male',
  phone: '+1 (555) 123-4567',
  email: 'rahul@example.com',
  address: '123 Main Street, City, State 12345',
  medicalHistory: ['Hypertension', 'Allergic to Penicillin'],
  weight: 75,
  height: 175
}

export function PrescriptionPage() {
  const { patientId } = useParams()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser'>('pen')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [zoom, setZoom] = useState(1)
  const [prescription, setPrescription] = useState<Prescription>({
    id: `presc_${Date.now()}`,
    patientId: patientId || '',
    diagnosis: '',
    medications: [],
    tests: [],
    notes: '',
    doctorName: 'Dr. Sarah Sharma',
    doctorQualification: 'MBBS, MD (General Medicine)',
    doctorRegistration: 'Reg. No: 12345',
    clinicName: 'MediCare Clinic',
    clinicAddress: '123 Medical Center Dr, Health City, HC 12345',
    clinicPhone: '+1 (555) 123-4567',
    date: new Date().toLocaleDateString('en-IN'),
    whiteboardData: ''
  })

  const [newMedication, setNewMedication] = useState('')
  const [newTest, setNewTest] = useState('')

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
    console.log('Prescription saved:', prescription)
    // Save logic here
  }

  const submitPrescription = () => {
    console.log('Prescription submitted:', prescription)
    // Submit logic here
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
                    <span className="font-medium">Patient:</span> {MOCK_PATIENT.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Age:</span> {MOCK_PATIENT.age}y, {MOCK_PATIENT.gender}
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Weight:</span> {MOCK_PATIENT.weight}kg
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Height:</span> {MOCK_PATIENT.height}cm
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
    </div>
  )
}
