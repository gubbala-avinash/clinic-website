import { useState } from 'react'
import { useAuthStore } from '../../store/auth'
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin'|'receptionist'|'doctor'|'pharmacist'|'patient'>('admin')
  const { login } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <div className="mt-6 space-y-3">
        <input className="border rounded-md px-3 py-2 w-full" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input type="password" className="border rounded-md px-3 py-2 w-full" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <select className="border rounded-md px-3 py-2 w-full" value={role} onChange={(e)=>setRole(e.target.value as any)}>
          <option value="admin">Admin</option>
          <option value="receptionist">Receptionist</option>
          <option value="doctor">Doctor</option>
          <option value="pharmacist">Pharmacist</option>
          <option value="patient">Patient</option>
        </select>
        <button onClick={()=> { login({ email, role }); const map: Record<string,string> = { admin:'/admin', receptionist:'/admin', doctor:'/doctor', pharmacist:'/pharmacy', patient:'/' }; navigate(map[role] || '/') }} className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700">Continue</button>
      </div>
    </div>
  )
}


