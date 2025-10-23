const HOURS = Array.from({ length: 10 }).map((_, i) => 9 + i) // 9-18
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export function WeekCalendar({ items }: { items: Array<{ id: string; title: string; day: number; hour: number }> }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px] grid" style={{ gridTemplateColumns: `80px repeat(7, 1fr)` }}>
        <div />
        {DAYS.map(d => (
          <div key={d} className="text-center text-sm font-medium py-2 border-b">{d}</div>
        ))}
        {HOURS.map(h => (
          <>
            <div key={`h-${h}`} className="border-r text-xs text-gray-600 py-6 px-2">{h}:00</div>
            {DAYS.map((_, dayIdx) => (
              <div key={`c-${dayIdx}-${h}`} className="border min-h-16 relative">
                {items.filter(it => it.day===dayIdx && it.hour===h).map(it => (
                  <div key={it.id} className="absolute inset-1 rounded bg-blue-600/10 text-blue-700 text-xs p-2">
                    {it.title}
                  </div>
                ))}
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  )
}


