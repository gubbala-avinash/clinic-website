import { useState } from 'react'
import { 
  Save, 
  Upload, 
  Bell, 
  Shield, 
  Users, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  Clock,
  Globe
} from 'lucide-react'

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    clinicName: 'MediCare Clinic',
    email: 'info@medicareclinic.com',
    phone: '+1 (555) 123-4567',
    address: '123 Medical Center Dr, Health City, HC 12345',
    website: 'https://medicareclinic.com',
    workingHours: {
      monday: '8:00 AM - 8:00 PM',
      tuesday: '8:00 AM - 8:00 PM',
      wednesday: '8:00 AM - 8:00 PM',
      thursday: '8:00 AM - 8:00 PM',
      friday: '8:00 AM - 8:00 PM',
      saturday: '9:00 AM - 5:00 PM',
      sunday: 'Closed'
    },
    notifications: {
      email: true,
      sms: true,
      push: false,
      appointmentReminders: true,
      prescriptionReady: true
    }
  })

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'users', name: 'Users', icon: Users }
  ]

  const handleSave = () => {
    // Simulate save
    console.log('Settings saved:', settings)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage clinic settings and preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Clinic Name</label>
                    <input 
                      className="form-input" 
                      value={settings.clinicName}
                      onChange={(e) => setSettings({...settings, clinicName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <input 
                      type="email"
                      className="form-input" 
                      value={settings.email}
                      onChange={(e) => setSettings({...settings, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input 
                      className="form-input" 
                      value={settings.phone}
                      onChange={(e) => setSettings({...settings, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">Website</label>
                    <input 
                      className="form-input" 
                      value={settings.website}
                      onChange={(e) => setSettings({...settings, website: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Address</label>
                  <textarea 
                    className="form-input" 
                    rows={3}
                    value={settings.address}
                    onChange={(e) => setSettings({...settings, address: e.target.value})}
                  />
                </div>

                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-4">Working Hours</h3>
                  <div className="grid gap-4">
                    {Object.entries(settings.workingHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center justify-between">
                        <span className="capitalize font-medium text-gray-700">{day}</span>
                        <input 
                          className="form-input w-48" 
                          value={hours}
                          onChange={(e) => setSettings({
                            ...settings, 
                            workingHours: {...settings.workingHours, [day]: e.target.value}
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h2>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Email Notifications</div>
                      <div className="text-sm text-gray-600">Receive notifications via email</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={settings.notifications.email}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {...settings.notifications, email: e.target.checked}
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">SMS Notifications</div>
                      <div className="text-sm text-gray-600">Receive notifications via SMS</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={settings.notifications.sms}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {...settings.notifications, sms: e.target.checked}
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Appointment Reminders</div>
                      <div className="text-sm text-gray-600">Send reminders before appointments</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={settings.notifications.appointmentReminders}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {...settings.notifications, appointmentReminders: e.target.checked}
                        })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-4">Password Policy</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Minimum Password Length</label>
                      <input type="number" className="form-input w-32" defaultValue="8" />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm text-gray-700">Require uppercase letters</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm text-gray-700">Require lowercase letters</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm text-gray-700">Require numbers</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-gray-700">Require special characters</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-4">Session Management</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Session Timeout (minutes)</label>
                      <input type="number" className="form-input w-32" defaultValue="30" />
                    </div>
                    <div>
                      <label className="form-label">Maximum Login Attempts</label>
                      <input type="number" className="form-input w-32" defaultValue="5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">User Management</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Dr. Sarah Sharma</div>
                      <div className="text-sm text-gray-600">General Medicine • Active</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-sm">Edit</button>
                    <button className="btn-secondary text-sm">Deactivate</button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Dr. Michael Rao</div>
                      <div className="text-sm text-gray-600">Cardiology • Active</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-sm">Edit</button>
                    <button className="btn-secondary text-sm">Deactivate</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <button onClick={handleSave} className="btn-primary inline-flex items-center">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
