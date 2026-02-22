'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Video,
  MessageSquare,
  Eye,
  Phone,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'

interface VetAppointment {
  id: string
  petName: string
  ownerName: string
  type: 'Online' | 'In-clinic'
  date: string
  time: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed'
  mode: string
  notes: string
  ownerPhone?: string
  ownerEmail?: string
}

interface VetAppointmentPanelProps {
  onVideoCallInitiate?: (appointmentId: string) => void
}

const normalizeStatus = (status: unknown): VetAppointment['status'] => {
  if (status === 'Approved' || status === 'Rejected' || status === 'Completed' || status === 'Pending') {
    return status
  }
  if (status === 'Confirmed') return 'Approved'
  if (status === 'Cancelled') return 'Rejected'
  return 'Pending'
}

const normalizeType = (mode: unknown, type: unknown): VetAppointment['type'] => {
  if (mode === 'Online' || type === 'Online') {
    return 'Online'
  }
  return 'In-clinic'
}

const formatSupabaseError = (error: any) => {
  if (!error) return 'Unknown error'
  const parts = [error?.message, error?.details, error?.hint, error?.code]
    .filter(Boolean)
    .map((item) => String(item))
  return parts.length > 0 ? parts.join(' | ') : JSON.stringify(error)
}

const isMissingColumnError = (error: any, columnName?: string) => {
  const text = formatSupabaseError(error).toLowerCase()
  if (columnName) {
    return text.includes(columnName.toLowerCase())
  }
  return error?.code === 'PGRST204' || error?.code === '42703' || text.includes('column')
}

const isSetupPendingError = (error: any) => {
  const text = formatSupabaseError(error).toLowerCase()
  return (
    text.includes('permission denied') ||
    text.includes('does not exist') ||
    text.includes('relation') ||
    text.includes('schema cache') ||
    text.includes('rls')
  )
}

export default function VetAppointmentPanel({ onVideoCallInitiate }: VetAppointmentPanelProps) {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<VetAppointment[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'completed'>('all')
  const [selectedAppointment, setSelectedAppointment] = useState<VetAppointment | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [rejectReasonOpen, setRejectReasonOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.id) {
        setAppointments([])
        return
      }

      setLoading(true)
      setErrorMessage('')
      let query = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })

      if (query.error && isMissingColumnError(query.error, 'date')) {
        query = await supabase
          .from('appointments')
          .select('*')
          .order('created_at', { ascending: true })
      }

      if (query.error && isMissingColumnError(query.error, 'created_at')) {
        query = await supabase
          .from('appointments')
          .select('*')
      }

      setLoading(false)

      const { data, error } = query

      if (error) {
        const formattedError = formatSupabaseError(error)
        if (isSetupPendingError(error)) {
          console.warn('Vet appointments setup pending:', formattedError)
          setErrorMessage('Appointments database setup pending. Please configure table/policies.')
        } else {
          console.warn('Failed to fetch vet appointments:', formattedError)
          setErrorMessage('Could not load appointments.')
        }
        setAppointments([])
        return
      }

      const normalizedVetName = user.name?.trim().toLowerCase() || ''
      const vetNameVariants = [normalizedVetName, normalizedVetName ? `dr. ${normalizedVetName}` : ''].filter(Boolean)

      const ownedRows = (data || []).filter((row: any) => {
        const rowVetId = row?.vet_id ? String(row.vet_id) : ''
        if (rowVetId) {
          return rowVetId === user.id
        }

        const rowVetName = typeof row?.vet_name === 'string' ? row.vet_name.trim().toLowerCase() : ''
        if (!rowVetName || vetNameVariants.length === 0) {
          return false
        }

        return vetNameVariants.some((candidate) => rowVetName === candidate || rowVetName.includes(candidate))
      })

      const mappedAppointments: VetAppointment[] = ownedRows.map((row: any) => ({
        id: String(row.id),
        petName: row.pet_name || 'Pet',
        ownerName: row.owner_name || row.owner_full_name || row.owner_email || 'Pet Owner',
        type: normalizeType(row.mode, row.type),
        date: row.date || new Date().toISOString(),
        time: row.time || 'TBD',
        status: normalizeStatus(row.status),
        mode: row.mode || normalizeType(row.mode, row.type),
        notes: row.notes || 'No notes provided.',
        ownerPhone: row.owner_phone || undefined,
        ownerEmail: row.owner_email || undefined,
      }))

      setAppointments(mappedAppointments)
    }

    fetchAppointments()
  }, [user?.id, user?.name])

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true
    return apt.status.toLowerCase() === filter
  })

  const updateAppointmentStatus = async (id: string, status: VetAppointment['status']) => {
    setActionLoadingId(id)
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)

    setActionLoadingId(null)

    if (error) {
      console.error('Failed to update appointment status:', error)
      alert(`Could not update appointment: ${error.message}`)
      return false
    }

    setAppointments((prev) => prev.map((apt) => (apt.id === id ? { ...apt, status } : apt)))
    return true
  }

  const handleApproveAppointment = async (id: string) => {
    const updated = await updateAppointmentStatus(id, 'Approved')
    if (updated) {
      setDetailsModalOpen(false)
    }
  }

  const handleRejectAppointment = async (id: string) => {
    const updated = await updateAppointmentStatus(id, 'Rejected')
    if (updated) {
      setRejectReasonOpen(false)
      setRejectReason('')
      setDetailsModalOpen(false)
    }
  }

  const handleInitiateVideoCall = (appointmentId: string) => {
    onVideoCallInitiate?.(appointmentId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      case 'Completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'Online' ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-600">Review and manage appointment requests from pet owners</p>
        <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full w-24 mt-4"></div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
              filter === tab
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium text-lg">Loading appointments...</p>
          </div>
        ) : errorMessage ? (
          <div className="bg-white rounded-lg border border-red-200 p-12 text-center">
            <p className="text-red-600 font-medium text-lg">{errorMessage}</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                {/* Left Section */}
                <div className="flex gap-4 flex-1 min-w-0">
                  <Avatar className="w-16 h-16 border-2 border-teal-200">
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-lg">
                      {apt.petName[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">{apt.petName}</h3>
                    <p className="text-gray-600 text-sm mb-3">Owner: {apt.ownerName}</p>

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
                        {apt.type === 'Online' ? (
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

                {/* Right Section - Actions */}
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <Button
                    onClick={() => {
                      setSelectedAppointment(apt)
                      setDetailsModalOpen(true)
                    }}
                    variant="outline"
                    className="border-teal-500 text-teal-600 hover:bg-teal-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>

                  {apt.status === 'Pending' && (
                    <>
                      <Button
                        onClick={() => handleApproveAppointment(apt.id)}
                        disabled={actionLoadingId === apt.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {actionLoadingId === apt.id ? 'Saving...' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedAppointment(apt)
                          setRejectReasonOpen(true)
                        }}
                        disabled={actionLoadingId === apt.id}
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}

                  {apt.status === 'Approved' && apt.type === 'Online' && (
                    <Button
                      onClick={() => handleInitiateVideoCall(apt.id)}
                      className="bg-teal-500 hover:bg-teal-600 text-white"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Start Call
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium text-lg">No appointments found</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedAppointment && (
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedAppointment.petName}'s Appointment</DialogTitle>
              <DialogDescription>
                Owner: {selectedAppointment.ownerName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Appointment Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pet Name:</span>
                  <span className="font-semibold">{selectedAppointment.petName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Owner Name:</span>
                  <span className="font-semibold">{selectedAppointment.ownerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type:</span>
                  <Badge variant={selectedAppointment.type === 'Online' ? 'default' : 'secondary'}>
                    {selectedAppointment.type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold">{formatDate(selectedAppointment.date)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-semibold">{selectedAppointment.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge className={getStatusColor(selectedAppointment.status)}>
                    {selectedAppointment.status}
                  </Badge>
                </div>
              </div>

              {/* Owner Contact */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Owner Contact</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    {selectedAppointment.ownerPhone}
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    {selectedAppointment.ownerEmail}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Appointment Notes</h4>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-gray-700">
                  {selectedAppointment.notes}
                </div>
              </div>

              {/* Actions */}
              {selectedAppointment.status === 'Pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleApproveAppointment(selectedAppointment.id)}
                    disabled={actionLoadingId === selectedAppointment.id}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {actionLoadingId === selectedAppointment.id ? 'Saving...' : 'Approve Appointment'}
                  </Button>
                  <Button
                    onClick={() => {
                      setDetailsModalOpen(false)
                      setRejectReasonOpen(true)
                    }}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Reason Modal */}
      {selectedAppointment && (
        <Dialog open={rejectReasonOpen} onOpenChange={setRejectReasonOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Appointment</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this appointment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Textarea
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setRejectReasonOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleRejectAppointment(selectedAppointment.id)}
                  disabled={actionLoadingId === selectedAppointment.id}
                  variant="destructive"
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
