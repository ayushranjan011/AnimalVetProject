'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Search, Filter, Eye, Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

const mockRecords: MedicalRecord[] = [
  {
    id: '1',
    petName: 'Max',
    petType: 'Dog',
    recordType: 'Vaccination',
    vetName: 'Dr. Sarah Johnson',
    date: '2024-12-15',
    status: 'Completed',
    description: 'Annual rabies vaccination completed',
    document: 'VAC-2024-001.pdf',
    qrCode: 'QR-VAC-001'
  },
  {
    id: '2',
    petName: 'Luna',
    petType: 'Cat',
    recordType: 'Prescription',
    vetName: 'Dr. Michael Chen',
    date: '2024-12-10',
    status: 'Completed',
    description: 'Thyroid medication prescription',
    document: 'RX-2024-002.pdf',
    qrCode: 'QR-RX-002'
  },
  {
    id: '3',
    petName: 'Max',
    petType: 'Dog',
    recordType: 'Lab Report',
    vetName: 'Dr. Sarah Johnson',
    date: '2024-12-05',
    status: 'Pending',
    description: 'Blood work and urinalysis results',
    document: 'LAB-2024-003.pdf',
    qrCode: 'QR-LAB-003'
  },
  {
    id: '4',
    petName: 'Buddy',
    petType: 'Dog',
    recordType: 'Vaccination',
    vetName: 'Dr. Emily Patterson',
    date: '2024-11-28',
    status: 'Completed',
    description: 'DHPP vaccination',
    document: 'VAC-2024-004.pdf',
    qrCode: 'QR-VAC-004'
  },
  {
    id: '5',
    petName: 'Luna',
    petType: 'Cat',
    recordType: 'Lab Report',
    vetName: 'Dr. Michael Chen',
    date: '2024-11-20',
    status: 'Completed',
    description: 'FeLV/FIV test results',
    document: 'LAB-2024-005.pdf',
    qrCode: 'QR-LAB-005'
  }
]

export default function MedicalRecords() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'All' | 'Vaccination' | 'Prescription' | 'Lab Report'>('All')
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)

  const filteredRecords = mockRecords.filter(record => {
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
          <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center">
            <span className="text-white text-lg">📋</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
        </div>
        <p className="text-gray-600">View and manage your pet's medical documents and records</p>
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

        {filteredRecords.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No records found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredRecords.length} of {mockRecords.length} records
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
