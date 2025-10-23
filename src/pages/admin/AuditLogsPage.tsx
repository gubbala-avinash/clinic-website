export function AuditLogsPage() {
  const logs = [
    { id: 'a1', user: 'admin@clinic.com', action: 'UPDATE', resource: 'prescription:123', time: '2025-10-18 15:12' },
    { id: 'a2', user: 'pharmacy@clinic.com', action: 'FULFILL', resource: 'prescription:124', time: '2025-10-18 16:40' },
  ]
  return (
    <div>
      <h1 className="text-xl font-semibold">Audit Logs</h1>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left">
            <tr>
              <th className="p-2 border-b">User</th>
              <th className="p-2 border-b">Action</th>
              <th className="p-2 border-b">Resource</th>
              <th className="p-2 border-b">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l=> (
              <tr key={l.id} className="odd:bg-gray-50">
                <td className="p-2 border-b">{l.user}</td>
                <td className="p-2 border-b">{l.action}</td>
                <td className="p-2 border-b">{l.resource}</td>
                <td className="p-2 border-b">{l.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


