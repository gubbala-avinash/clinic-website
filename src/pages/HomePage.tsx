import { Link } from 'react-router-dom'
import { 
  Heart, 
  Stethoscope, 
  Shield, 
  Clock, 
  Users, 
  Award, 
  CheckCircle, 
  Star,
  ArrowRight,
  Phone,
  Calendar,
  MapPin,
  ChevronRight
} from 'lucide-react'

export function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dbeafe' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                <Award className="w-4 h-4 mr-2" />
                Trusted Healthcare Provider Since 2003
              </div>
              
              <h1 className="text-responsive-xl font-bold text-gray-900 leading-tight mb-6">
                Your Health is Our 
                <span className="text-blue-600"> Priority</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Experience world-class healthcare with our comprehensive medical services, 
                advanced technology, and compassionate care. Book appointments seamlessly 
                and receive digital prescriptions with instant pharmacy fulfillment.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/booking" className="btn-primary inline-flex items-center justify-center group">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Appointment
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/emergency" className="btn-secondary inline-flex items-center justify-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Emergency Care
                </Link>
              </div>
              
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">50K+</div>
                  <div className="text-sm text-gray-600">Patients Served</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">20+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">98%</div>
                  <div className="text-sm text-gray-600">Satisfaction Rate</div>
                </div>
              </div>
            </div>
            
            <div className="relative animate-fade-in">
              <div className="relative">
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-blue-800/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Stethoscope className="w-24 h-24 mx-auto mb-4 opacity-80" />
                      <div className="text-2xl font-bold">Advanced Medical Care</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating cards */}
                <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">24/7 Emergency</div>
                      <div className="text-sm text-gray-600">Always Available</div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">HIPAA Compliant</div>
                      <div className="text-sm text-gray-600">Secure & Private</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-responsive-lg font-bold text-gray-900 mb-4">
              Comprehensive Healthcare Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From routine checkups to specialized treatments, we provide complete healthcare 
              solutions with cutting-edge technology and compassionate care.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Stethoscope,
                title: "General Medicine",
                description: "Comprehensive primary care services for all ages with experienced physicians.",
                features: ["Annual Checkups", "Chronic Disease Management", "Preventive Care"]
              },
              {
                icon: Heart,
                title: "Cardiology",
                description: "Advanced heart care with state-of-the-art diagnostic and treatment facilities.",
                features: ["Echocardiograms", "Stress Testing", "Cardiac Rehabilitation"]
              },
              {
                icon: Users,
                title: "Pediatrics",
                description: "Specialized care for children from infancy through adolescence.",
                features: ["Well-Child Visits", "Vaccinations", "Developmental Screening"]
              },
              {
                icon: Shield,
                title: "Emergency Care",
                description: "24/7 emergency services with rapid response and expert medical care.",
                features: ["Trauma Care", "Critical Care", "Emergency Surgery"]
              },
              {
                icon: Clock,
                title: "Digital Prescriptions",
                description: "Seamless prescription management with instant pharmacy fulfillment.",
                features: ["E-Prescriptions", "Medication Tracking", "Pharmacy Integration"]
              },
              {
                icon: Award,
                title: "Specialized Care",
                description: "Expert care in various medical specialties with advanced treatment options.",
                features: ["Oncology", "Neurology", "Orthopedics"]
              }
            ].map((service, index) => (
              <div key={index} className="card p-8 group hover:scale-105 transition-all duration-300">
                <div className="medical-icon mb-6 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-responsive-lg font-bold text-gray-900 mb-4">
              Why Choose MediCare?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine medical excellence with innovative technology to deliver 
              the best possible healthcare experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Award,
                title: "Board Certified Doctors",
                description: "Our physicians are board-certified with years of experience in their specialties."
              },
              {
                icon: Clock,
                title: "Minimal Wait Times",
                description: "Efficient scheduling and streamlined processes ensure you're seen on time."
              },
              {
                icon: Shield,
                title: "Advanced Technology",
                description: "State-of-the-art equipment and digital health solutions for better outcomes."
              },
              {
                icon: Heart,
                title: "Patient-Centered Care",
                description: "Every decision is made with your health and comfort as our top priority."
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="medical-icon mx-auto mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-responsive-lg font-bold text-gray-900 mb-4">
              What Our Patients Say
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from real patients who trust us with their healthcare.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Patient",
                content: "The digital prescription system is amazing! I got my medication within minutes of my appointment. The doctor was thorough and caring.",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Patient",
                content: "Emergency care was exceptional. The staff was professional and efficient. I felt safe and well-cared for throughout my visit.",
                rating: 5
              },
              {
                name: "Emily Rodriguez",
                role: "Patient",
                content: "The booking system is so convenient. I can schedule appointments online and get reminders. The whole experience is seamless.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-responsive-lg font-bold text-white mb-4">
            Ready to Experience Better Healthcare?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied patients who trust MediCare for their healthcare needs. 
            Book your appointment today and experience the future of healthcare.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking" className="bg-white text-blue-600 hover:bg-gray-100 font-medium px-8 py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center">
              <Calendar className="w-5 h-5 mr-2" />
              Book Appointment Now
            </Link>
            <Link to="/contact" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-medium px-8 py-4 rounded-lg transition-all duration-200 inline-flex items-center justify-center">
              <MapPin className="w-5 h-5 mr-2" />
              Visit Our Clinic
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}


