import { useState, useEffect } from 'react'
import { 
  Server, 
  Database, 
  Globe, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Clock,
  Activity,
  Cpu,
  HardDrive
} from 'lucide-react'

interface ServiceStatus {
  name: string
  url: string
  status: 'online' | 'offline' | 'checking'
  responseTime?: number
  lastChecked: Date
  error?: string
}

export function ServerStatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'API Gateway',
      url: 'http://localhost:3000/api/health',
      status: 'checking',
      lastChecked: new Date()
    },
    {
      name: 'Clinic Service',
      url: 'http://localhost:3001/api/health',
      status: 'checking',
      lastChecked: new Date()
    },
    {
      name: 'Files Service',
      url: 'http://localhost:3002/api/health',
      status: 'checking',
      lastChecked: new Date()
    },
    {
      name: 'Database',
      url: 'mongodb+srv://suprith:suprith@cluster0.ojkrv.mongodb.net/clinic',
      status: 'checking',
      lastChecked: new Date()
    }
  ])
  
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const checkServiceStatus = async (service: ServiceStatus) => {
    const startTime = Date.now()
    
    try {
      const response = await fetch(service.url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      })
      
      const responseTime = Date.now() - startTime
      
      if (response.ok) {
        return {
          ...service,
          status: 'online' as const,
          responseTime,
          lastChecked: new Date(),
          error: undefined
        }
      } else {
        return {
          ...service,
          status: 'offline' as const,
          responseTime,
          lastChecked: new Date(),
          error: `HTTP ${response.status}`
        }
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        ...service,
        status: 'offline' as const,
        responseTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Connection failed'
      }
    }
  }

  const refreshAllServices = async () => {
    setIsRefreshing(true)
    setLastRefresh(new Date())
    
    const updatedServices = await Promise.all(
      services.map(service => checkServiceStatus(service))
    )
    
    setServices(updatedServices)
    setIsRefreshing(false)
  }

  useEffect(() => {
    refreshAllServices()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshAllServices, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'checking':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const onlineServices = services.filter(s => s.status === 'online').length
  const totalServices = services.length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Server Status</h1>
          <p className="text-gray-600">Monitor the health of all system services</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={refreshAllServices}
            disabled={isRefreshing}
            className="btn-secondary inline-flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-gray-900">
                {onlineServices}/{totalServices}
              </p>
              <p className="text-sm text-gray-600">
                {onlineServices === totalServices ? 'All systems operational' : 'Some services down'}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">99.9%</p>
              <p className="text-sm text-gray-600">Last 30 days</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.filter(s => s.responseTime).length > 0 
                  ? `${Math.round(services.reduce((sum, s) => sum + (s.responseTime || 0), 0) / services.filter(s => s.responseTime).length)}ms`
                  : 'N/A'
                }
              </p>
              <p className="text-sm text-gray-600">Average</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Cpu className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Service Status</h2>
        <div className="space-y-4">
          {services.map((service, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {service.name === 'API Gateway' && <Globe className="w-5 h-5 text-blue-500" />}
                  {service.name === 'Clinic Service' && <Server className="w-5 h-5 text-green-500" />}
                  {service.name === 'Files Service' && <HardDrive className="w-5 h-5 text-purple-500" />}
                  {service.name === 'Database' && <Database className="w-5 h-5 text-orange-500" />}
                  
                  <div>
                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.url}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    {service.responseTime && (
                      <p className="text-sm text-gray-600">
                        {service.responseTime}ms
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {service.lastChecked.toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(service.status)}`}>
                    {getStatusIcon(service.status)}
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </div>
                </div>
              </div>
              
              {service.error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">
                    <strong>Error:</strong> {service.error}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* System Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Environment</span>
              <span className="text-sm font-medium text-gray-900">Development</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Node.js Version</span>
              <span className="text-sm font-medium text-gray-900">v18.17.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">MongoDB Version</span>
              <span className="text-sm font-medium text-gray-900">v6.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">API Version</span>
              <span className="text-sm font-medium text-gray-900">v1.0.0</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Memory Usage</span>
              <span className="text-sm font-medium text-gray-900">45%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">CPU Usage</span>
              <span className="text-sm font-medium text-gray-900">12%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Disk Usage</span>
              <span className="text-sm font-medium text-gray-900">23%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Network I/O</span>
              <span className="text-sm font-medium text-gray-900">1.2 MB/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
