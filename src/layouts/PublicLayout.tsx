import { Outlet, Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Phone, Mail, MapPin, Clock } from 'lucide-react'
export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="bg-blue-900 text-white py-2">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm">
            <div className="flex flex-col md:flex-row md:items-center md:gap-6">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@medicareclinic.com</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <Clock className="w-4 h-4" />
              <span>Mon-Fri: 8AM-8PM, Sat: 9AM-5PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">MediCare</div>
                <div className="text-sm text-blue-600 font-medium">Healthcare Excellence</div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              <NavLink to="/" className={({isActive}) => 
                `font-medium transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`
              }>
                Home
              </NavLink>
              <NavLink to="/services" className={({isActive}) => 
                `font-medium transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`
              }>
                Services
              </NavLink>
              <NavLink to="/doctors" className={({isActive}) => 
                `font-medium transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`
              }>
                Doctors
              </NavLink>
              <NavLink to="/about" className={({isActive}) => 
                `font-medium transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`
              }>
                About
              </NavLink>
              <NavLink to="/contact" className={({isActive}) => 
                `font-medium transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`
              }>
                Contact
              </NavLink>
            </nav>

            <div className="flex items-center gap-4">
              <Link to="/login" className="hidden md:inline-flex items-center px-4 py-2 text-blue-600 font-medium hover:text-blue-700 transition-colors">
                Staff Login
              </Link>
              <Link to="/booking" className="btn-primary">
                Book Appointment
              </Link>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-4">
                <NavLink to="/" className="font-medium text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </NavLink>
                <NavLink to="/services" className="font-medium text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                  Services
                </NavLink>
                <NavLink to="/doctors" className="font-medium text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                  Doctors
                </NavLink>
                <NavLink to="/about" className="font-medium text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                  About
                </NavLink>
                <NavLink to="/contact" className="font-medium text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                  Contact
                </NavLink>
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700" onClick={() => setMobileMenuOpen(false)}>
                  Staff Login
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <div>
                  <div className="text-xl font-bold">MediCare</div>
                  <div className="text-sm text-gray-400">Healthcare Excellence</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Providing world-class healthcare services with compassion, innovation, and excellence for over 20 years.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors">Our Services</Link></li>
                <li><Link to="/doctors" className="text-gray-400 hover:text-white transition-colors">Our Doctors</Link></li>
                <li><Link to="/booking" className="text-gray-400 hover:text-white transition-colors">Book Appointment</Link></li>
                <li><Link to="/emergency" className="text-gray-400 hover:text-white transition-colors">Emergency Care</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm">
                <li><span className="text-gray-400">General Medicine</span></li>
                <li><span className="text-gray-400">Cardiology</span></li>
                <li><span className="text-gray-400">Pediatrics</span></li>
                <li><span className="text-gray-400">Emergency Care</span></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400">123 Medical Center Dr, Health City, HC 12345</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400">info@medicareclinic.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} MediCare Clinic. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}


