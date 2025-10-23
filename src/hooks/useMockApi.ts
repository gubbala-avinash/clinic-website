import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useAppointments() {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      return [
        { id: '1', patient: 'Rahul Kumar', doctor: 'Dr. Sharma', datetime: '2025-10-18 15:00', status: 'booked' },
      ]
    },
  })
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => ({ id: String(Math.random()), ...payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}


