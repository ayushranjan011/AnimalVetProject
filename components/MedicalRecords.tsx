'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Search, Filter, Eye, Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'

// Dynamic import for QRCodeCanvas to handle SSR
const QRCodeCanvas = dynamic(() => import('qrcode.react').then(mod => mod.QRCodeCanvas), { 
  ssr: false,
  loading: () => <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center text-sm text-gray-500">QR Code</div>
})

interface MedicalRecord {
  id: string
  petName: string
  petType: string
  recordType: 'Vaccination' | 'Prescription' | 'Lab Report'
  vetName: string
  date: string
  status: 'Completed' | 'Pending'
  description: string
  document: string
  qrCode: string
}

const normalizeText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
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

const normalizeRecordType = (value: unknown): MedicalRecord['recordType'] => {
  const normalized = String(value || '').toLowerCase()
  if (normalized === 'vaccination') return 'Vaccination'
  if (normalized === 'prescription') return 'Prescription'
  return 'Lab Report'
}

export default function MedicalRecords() {
  const { user } = useAuth()
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'All' | 'Vaccination' | 'Prescription' | 'Lab Report'>('All')
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)

  useEffect(() => {
    const fetchRecords = async () => {
      if (!user?.id) {
        setRecords([])
        return
      }

      setLoading(true)
      let query = await supabase
        .from('medical_records')
        .select('*')
        .eq('owner_id', user.id)
        .order('date', { ascending: false })

      if (query.error && isMissingColumnError(query.error, 'owner_id')) {
        const petsQuery = await supabase
          .from('pets')
          .select('id')
          .eq('owner_id', user.id)

        const petIds = (petsQuery.data || []).map((row: any) => String(row?.id || '')).filter(Boolean)
        if (petsQuery.error) {
          setLoading(false)
          console.error('Failed to fetch pets for medical record fallback:', petsQuery.error)
          setRecords([])
          return
        }

        if (petIds.length === 0) {
          setLoading(false)
          setRecords([])
          return
        }

        query = await supabase
          .from('medical_records')
          .select('*')
          .in('pet_id', petIds)
          .order('record_date', { ascending: false })
      }

      if (query.error && isMissingColumnError(query.error, 'date')) {
        query = await supabase
          .from('medical_records')
          .select('*')
          .eq('owner_id', user.id)
          .order('record_date', { ascending: false })
      }

      if (query.error && isMissingColumnError(query.error, 'record_date')) {
        query = await supabase
          .from('medical_records')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
      }

      setLoading(false)
      const { data, error } = query

      if (error) {
        console.error('Failed to fetch medical records:', error)
        setRecords([])
        return
      }

      const rows = data || []
      const vetIds = Array.from(
        new Set(
          rows
            .map((row: any) => String(row?.vet_id || '').trim())
            .filter(Boolean)
        )
      )

      const vetNamesById: Record<string, string> = {}
      if (vetIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', vetIds)

        if (profileError) {
          console.warn('Could not fetch vet names for medical records:', profileError)
        } else {
          for (const profileRow of profileRows || []) {
            const vetId = String((profileRow as any)?.id || '').trim()
            const vetName = normalizeText((profileRow as any)?.name)
            const emailPrefix = normalizeText((profileRow as any)?.email).split('@')[0]?.trim() || ''
            const resolvedName = vetName || emailPrefix
            if (vetId && resolvedName) {
              vetNamesById[vetId] = resolvedName
            }
          }
        }

        const unresolvedVetIds = vetIds.filter((vetId) => !vetNamesById[vetId])
        if (unresolvedVetIds.length > 0) {
          const { data: usersRows, error: usersError } = await supabase
            .from('users')
            .select('id, full_name')
            .in('id', unresolvedVetIds)

          if (usersError) {
            console.warn('Could not fetch fallback vet names for medical records:', usersError)
          } else {
            for (const usersRow of usersRows || []) {
              const vetId = String((usersRow as any)?.id || '').trim()
              const vetName = normalizeText((usersRow as any)?.full_name)
              if (vetId && vetName) {
                vetNamesById[vetId] = vetName
              }
            }
          }
        }
      }

      const mapped = rows.map((row: any): MedicalRecord => ({
        id: String(row.id),
        petName: row.pet_name || 'Pet',
        petType: row.pet_type || 'Not specified',
        recordType: normalizeRecordType(row.record_type),
        vetName: normalizeText(row.vet_name) || vetNamesById[String(row?.vet_id || '')] || 'Veterinarian',
        date: row.date || row.record_date || row.created_at || new Date().toISOString(),
        status: row.status === 'Pending' ? 'Pending' : 'Completed',
        description: row.description || 'No description provided.',
        document: row.document || row.file_name || 'document.pdf',
        qrCode: row.qr_code || String(row.id),
      }))

      setRecords(mapped)
    }

    fetchRecords()
  }, [user?.id])

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.vetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'All' || record.recordType === filterType
    
    return matchesSearch && matchesType
  })

  const getRecordTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Vaccination':
        return 'bg-blue-100 text-blue-800'
      case 'Prescription':
        return 'bg-purple-100 text-purple-800'
      case 'Lab Report':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    return status === 'Completed' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-sm shadow-orange-200/60">
            <span className="text-white text-2xl">📋</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
            <p className="text-sm text-gray-600">View and manage your pet's medical documents and records</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by pet name, vet name, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        
        <div className="flex gap-2">
          <Filter className="w-5 h-5 text-gray-400 self-center" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="All">All Records</option>
            <option value="Vaccination">Vaccination</option>
            <option value="Prescription">Prescription</option>
            <option value="Lab Report">Lab Report</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Pet</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Record Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Veterinarian</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{record.petName}</p>
                      <p className="text-sm text-gray-500">{record.petType}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRecordTypeBadgeColor(record.recordType)}`}>
                      {record.recordType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{record.vetName}</td>
                  <td className="px-6 py-4 text-gray-900">
                    {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-800 font-medium transition"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">Loading records...</p>
          </div>
        )}

        {!loading && filteredRecords.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No records found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredRecords.length} of {records.length} records
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{selectedRecord.recordType}</h2>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Record Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Pet Name</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedRecord.petName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Pet Type</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedRecord.petType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Veterinarian</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedRecord.vetName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(selectedRecord.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Description</p>
                <p className="text-gray-900">{selectedRecord.description}</p>
              </div>

              {/* Document Preview */}
              <div>
                <p className="text-sm text-gray-600 font-medium mb-3">Document</p>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl">📄</span>
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">{selectedRecord.document}</p>
                  <p className="text-sm text-gray-600 mb-4">PDF Document</p>
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white gap-2">
                    <Download className="w-4 h-4" />
                    Download Document
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              <div>
                <p className="text-sm text-gray-600 font-medium mb-3">QR Code</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-center justify-center">
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center justify-center">
                    <QRCodeCanvas 
                      value={selectedRecord.qrCode} 
                      size={128}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Code: {selectedRecord.qrCode}</p>
              </div>

              {/* Status Badge */}
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Status</p>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeColor(selectedRecord.status)}`}>
                  {selectedRecord.status}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </Button>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
