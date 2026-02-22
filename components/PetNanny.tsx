'use client'

import { useEffect, useState } from 'react'
import { Search, MapPin, Star, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'

interface PetNannyProfile {
  id: string
  name: string
  image: string
  distance: number
  rating: number
  reviews: number
  description: string
  services: string[]
  pricePerHour: number
  pricePerDay: number
  availability: 'available' | 'busy'
  petTypes: string[]
  experience: string
  reviews_list: Array<{ reviewer: string; rating: number; text: string }>
  availableTimes: string
}

export default function PetNanny() {
  const { user } = useAuth()
  const [nannies, setNannies] = useState<PetNannyProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [distance, setDistance] = useState('10')
  const [serviceType, setServiceType] = useState('all')
  const [petType, setPetType] = useState('all')
  const [selectedNanny, setSelectedNanny] = useState<PetNannyProfile | null>(null)

  useEffect(() => {
    const fetchNannies = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('pet_nannies')
        .select('*')
        .order('rating', { ascending: false })

      setLoading(false)

      if (error) {
        console.error('Failed to fetch pet nannies:', error)
        setNannies([])
        return
      }

      const mapped = (data || []).map((row: any): PetNannyProfile => ({
        id: String(row.id),
        name: row.name || 'Pet Nanny',
        image: row.image || 'Nanny',
        distance: Number(row.distance_km ?? row.distance ?? 0),
        rating: Number(row.rating ?? 0),
        reviews: Number(row.reviews_count ?? row.reviews ?? 0),
        description: row.description || 'No description provided.',
        services: Array.isArray(row.services)
          ? row.services
          : String(row.services || '')
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean),
        pricePerHour: Number(row.price_per_hour ?? 0),
        pricePerDay: Number(row.price_per_day ?? 0),
        availability: row.availability === 'busy' ? 'busy' : 'available',
        petTypes: Array.isArray(row.pet_types)
          ? row.pet_types
          : String(row.pet_types || '')
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean),
        experience: row.experience || 'Experience details not provided.',
        reviews_list: Array.isArray(row.reviews_list) ? row.reviews_list : [],
        availableTimes: row.available_times || 'Not specified',
      }))

      setNannies(mapped)
    }

    fetchNannies()
  }, [user?.id])

  const filteredNannies = nannies.filter((nanny) => {
    const matchesSearch = nanny.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDistance = nanny.distance <= parseInt(distance)
    const matchesService = serviceType === 'all' || nanny.services.includes(serviceType)
    const matchesPetType = petType === 'all' || nanny.petTypes.includes(petType)
    return matchesSearch && matchesDistance && matchesService && matchesPetType
  })

  const handleClearFilters = () => {
    setSearchTerm('')
    setDistance('10')
    setServiceType('all')
    setPetType('all')
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Nearby Pet Nannies</h1>
        <p className="text-gray-600 text-lg">Find trusted caregivers near you</p>
        <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full w-24 mt-4"></div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters and Search</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Distance</label>
            <select
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="1">1 km</option>
              <option value="3">3 km</option>
              <option value="5">5 km</option>
              <option value="10">10 km</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="all">All Services</option>
              <option value="Day care">Day care</option>
              <option value="Overnight stay">Overnight stay</option>
              <option value="Walking">Walking</option>
              <option value="Training">Training</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pet Type</label>
            <select
              value={petType}
              onChange={(e) => setPetType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="all">All Pets</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleClearFilters} variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Found {filteredNannies.length} pet {filteredNannies.length === 1 ? 'nanny' : 'nannies'}
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 font-medium text-lg">Loading pet nannies...</p>
        </div>
      ) : filteredNannies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNannies.map((nanny) => (
            <div key={nanny.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="bg-gradient-to-br from-teal-100 to-cyan-100 p-6 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-sm font-semibold text-gray-700 shadow-md text-center px-2">
                  {nanny.image}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{nanny.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {nanny.distance} km away
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${nanny.availability === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {nanny.availability === 'available' ? 'Available' : 'Busy'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(nanny.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                  <span className="ml-2 text-sm font-semibold text-gray-900">{nanny.rating} ({nanny.reviews} reviews)</span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">{nanny.description}</p>

                <div className="flex flex-wrap gap-2">
                  {nanny.services.map((service) => (
                    <span key={service} className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">{service}</span>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">${nanny.pricePerHour}</span>/hr or <span className="font-semibold text-gray-900">${nanny.pricePerDay}</span>/day
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button onClick={() => setSelectedNanny(nanny)} variant="outline" className="bg-white border-teal-300 text-teal-600 hover:bg-teal-50 font-medium">
                    View Profile
                  </Button>
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white font-medium">Request Care</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 font-medium text-lg">No pet nannies found nearby</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search criteria</p>
        </div>
      )}

      {selectedNanny && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">{selectedNanny.name}</h2>
              <button onClick={() => setSelectedNanny(null)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700">{selectedNanny.description}</p>
              <p className="text-gray-700"><span className="font-semibold">Experience:</span> {selectedNanny.experience}</p>
              <p className="text-gray-700"><span className="font-semibold">Available:</span> {selectedNanny.availableTimes}</p>
            </div>

            <div className="sticky bottom-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSelectedNanny(null)} className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
