import { useState } from 'react'
import { Calendar, Clock, User, Phone, Mail, Stethoscope, CheckCircle, ArrowRight } from 'lucide-react'

export function BookingPage() {
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    date: '', 
    time: '', 
    doctorId: '', 
    reason: '',
    age: '',
    gender: ''
  })
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const doctors = [
    { id: 'doc_1', name: 'Dr. Sarah Sharma', specialty: 'General Medicine', experience: '15 years', rating: 4.9 },
    { id: 'doc_2', name: 'Dr. Michael Rao', specialty: 'Cardiology', experience: '12 years', rating: 4.8 },
    { id: 'doc_3', name: 'Dr. Emily Chen', specialty: 'Pediatrics', experience: '10 years', rating: 4.9 },
    { id: 'doc_4', name: 'Dr. David Kumar', specialty: 'Emergency Medicine', experience: '8 years', rating: 4.7 }
  ]

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setStep(3) // Success step
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointment Booked!</h2>
          <p className="text-gray-600 mb-6">
            Your appointment has been successfully scheduled. You'll receive a confirmation email shortly.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-blue-800">
              <div className="font-semibold">Appointment Details:</div>
              <div className="mt-2 space-y-1">
                <div>Date: {form.date}</div>
                <div>Time: {form.time}</div>
                <div>Doctor: {doctors.find(d => d.id === form.doctorId)?.name}</div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => { setStep(1); setForm({ name: '', phone: '', email: '', date: '', time: '', doctorId: '', reason: '', age: '', gender: '' }) }}
            className="btn-primary w-full"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-responsive-lg font-bold text-gray-900 mb-4">
            Book Your Appointment
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Schedule your visit with our experienced healthcare professionals. 
            Quick, easy, and secure booking process.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 2 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="card p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <User className="w-6 h-6 mr-3 text-blue-600" />
                    Personal Information
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">Full Name *</label>
                      <input 
                        className="form-input" 
                        placeholder="Enter your full name" 
                        value={form.name} 
                        onChange={(e)=>update('name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Phone Number *</label>
                      <input 
                        className="form-input" 
                        placeholder="+1 (555) 123-4567" 
                        value={form.phone} 
                        onChange={(e)=>update('phone', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Email Address *</label>
                      <input 
                        type="email"
                        className="form-input" 
                        placeholder="your.email@example.com" 
                        value={form.email} 
                        onChange={(e)=>update('email', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Age</label>
                      <input 
                        type="number"
                        className="form-input" 
                        placeholder="25" 
                        value={form.age} 
                        onChange={(e)=>update('age', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="form-label">Gender</label>
                      <select 
                        className="form-input" 
                        value={form.gender} 
                        onChange={(e)=>update('gender', e.target.value)}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-8">
                    <button 
                      type="button"
                      onClick={() => setStep(2)}
                      className="btn-primary inline-flex items-center"
                      disabled={!form.name || !form.phone || !form.email}
                    >
                      Next Step
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="card p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Calendar className="w-6 h-6 mr-3 text-blue-600" />
                    Appointment Details
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label">Preferred Date *</label>
                        <input 
                          type="date" 
                          className="form-input" 
                          value={form.date} 
                          onChange={(e)=>update('date', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">Preferred Time *</label>
                        <select 
                          className="form-input" 
                          value={form.time} 
                          onChange={(e)=>update('time', e.target.value)}
                          required
                        >
                          <option value="">Select Time</option>
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Select Doctor (Optional)</label>
                      <div className="grid gap-3">
                        {doctors.map(doctor => (
                          <label key={doctor.id} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                            <input 
                              type="radio" 
                              name="doctor" 
                              value={doctor.id}
                              checked={form.doctorId === doctor.id}
                              onChange={(e)=>update('doctorId', e.target.value)}
                              className="mr-3"
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{doctor.name}</div>
                              <div className="text-sm text-gray-600">{doctor.specialty} • {doctor.experience}</div>
                              <div className="flex items-center mt-1">
                                <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < Math.floor(doctor.rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600 ml-2">{doctor.rating}</span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Reason for Visit</label>
                      <textarea 
                        className="form-input" 
                        rows={4} 
                        placeholder="Please describe your symptoms or reason for the appointment..."
                        value={form.reason} 
                        onChange={(e)=>update('reason', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-8">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn-secondary"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      className="btn-primary inline-flex items-center"
                      disabled={!form.date || !form.time || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Booking...
                        </>
                      ) : (
                        <>
                          <Stethoscope className="w-4 h-4 mr-2" />
                          Book Appointment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Choose Us?</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Same-day appointments available</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Digital prescriptions sent instantly</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">HIPAA compliant and secure</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">24/7 emergency care</span>
                </li>
              </ul>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-blue-600 mr-3" />
                  <span className="text-gray-600">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-blue-600 mr-3" />
                  <span className="text-gray-600">info@medicareclinic.com</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-blue-600 mr-3" />
                  <span className="text-gray-600">Mon-Fri: 8AM-8PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


