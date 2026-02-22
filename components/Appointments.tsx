'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Video, MapPin, Eye, VideoIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'

interface Appointment {
  id: string
  petName: string
  petPhoto: string
  vetName: string
  type: 'Consultation' | 'Vaccination' | 'Training'
  date: string
  time: string
  mode: 'Online' | 'In-clinic'
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'Confirmed' | 'Cancelled'
  notes: string
  prescription?: string
}

export default function Appointments() {
  const router = useRouter()
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [vetFilter, setVetFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<'All' | 'Consultation' | 'Vaccination' | 'Training'>('All')

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.id) {
        setAppointments([])
        return
      }

      setLoading(true)
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('owner_id', user.id)
        .order('date', { ascending: true })

      setLoading(false)

      if (error) {
        console.error('Failed to fetch appointments:', error)
        setAppointments([])
        return
      }

      const mapped = (data || []).map((row: any): Appointment => ({
        id: String(row.id),
        petName: row.pet_name || 'Pet',
        petPhoto: row.pet_photo || 'Pet',
        vetName: row.vet_name || 'Veterinarian',
        type: ['Consultation', 'Vaccination', 'Training'].includes(row.type) ? row.type : 'Consultation',
        date: row.date || new Date().toISOString(),
        time: row.time || 'TBD',
        mode: row.mode === 'Online' ? 'Online' : 'In-clinic',
        status: ['Pending', 'Approved', 'Rejected', 'Completed', 'Confirmed', 'Cancelled'].includes(row.status)
          ? row.status
          : 'Pending',
        notes: row.notes || 'No notes provided.',
        prescription: row.prescription || undefined,
      }))

      setAppointments(mapped)
    }

    fetchAppointments()
  }, [user?.id])

  const today = new Date()

  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date)
    let statusMatch = true

    if (filter === 'upcoming') statusMatch = aptDate >= today && apt.status !== 'Cancelled'
    else if (filter === 'past') statusMatch = aptDate < today || apt.status === 'Completed'
    else if (filter === 'cancelled') statusMatch = apt.status === 'Cancelled'

    const vetMatch = vetFilter === '' || apt.vetName.toLowerCase().includes(vetFilter.toLowerCase())
    const typeMatch = typeFilter === 'All' || apt.type === typeFilter

    return statusMatch && vetMatch && typeMatch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      case 'Completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Consultation':
        return 'bg-purple-100 text-purple-800'
      case 'Vaccination':
        return 'bg-teal-100 text-teal-800'
      case 'Training':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600">Manage your pet consultations and sessions</p>
        <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full w-24 mt-4"></div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-wrap gap-2">
          {(['all', 'upcoming', 'past', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                filter === tab ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vet Name</label>
            <input
              type="text"
              placeholder="Filter by vet name..."
              value={vetFilter}
              onChange={(e) => setVetFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'All' | 'Consultation' | 'Vaccination' | 'Training')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option>All</option>
              <option>Consultation</option>
              <option>Vaccination</option>
              <option>Training</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 font-medium text-lg">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-700 flex-shrink-0 px-2 text-center">
                    {apt.petPhoto}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">{apt.petName}</h3>
                    <p className="text-gray-600 text-sm mb-3">with {apt.vetName}</p>

                    <div className="flex flex-wrap gap-2 items-center mb-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(apt.type)}`}>
                        {apt.type}
                      </span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(apt.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {apt.time}
                      </div>
                      <div className="flex items-center gap-1">
                        {apt.mode === 'Online' ? (
                          <>
                            <Video className="w-4 h-4" />
                            Online
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4" />
                            In-clinic
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setSelectedAppointment(apt)}
                    className="px-4 py-2 rounded-lg border border-teal-500 text-teal-600 hover:bg-teal-50 font-medium transition text-sm"
                  >
                    <Eye className="w-4 h-4 inline mr-2" />
                    View Details
                  </button>

                  {apt.mode === 'Online' && apt.status === 'Approved' && (
                    <button
                      onClick={() => router.push(`/user/video-call?roomID=apt_${apt.id}_${apt.vetName.replace(/\s+/g, '_')}`)}
                      className="px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 font-medium transition text-sm"
                    >
                      <VideoIcon className="w-4 h-4 inline mr-2" />
                      Join Session
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium text-lg">You have no appointments scheduled</p>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600">
        Showing {filteredAppointments.length} of {appointments.length} appointments
      </div>

      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{selectedAppointment.petName}'s Appointment</h2>
              <button onClick={() => setSelectedAppointment(null)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Pet Name</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedAppointment.petName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Veterinarian</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedAppointment.vetName}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedAppointment.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-semibold text-gray-900">{selectedAppointment.time}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Appointment Notes</p>
                <p className="text-gray-900">{selectedAppointment.notes}</p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
