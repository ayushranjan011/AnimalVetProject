'use client'

import { useEffect, useState } from 'react'
import { Search, MapPin, Star, Filter, X, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

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

interface BookingForm {
  petId: string
  startDate: string
  endDate: string
  serviceType: string
  notes: string
}

export default function PetNanny() {
  const { user } = useAuth()
  const [nannies, setNannies] = useState<PetNannyProfile[]>([])
  const [pets, setPets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [distance, setDistance] = useState('10')
  const [serviceType, setServiceType] = useState('all')
  const [petType, setPetType] = useState('all')
  const [selectedNanny, setSelectedNanny] = useState<PetNannyProfile | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingNanny, setBookingNanny] = useState<PetNannyProfile | null>(null)
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    petId: '',
    startDate: '',
    endDate: '',
    serviceType: '',
    notes: '',
  })
  const [bookingSubmitting, setBookingSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      // Fetch pets
      if (user?.id) {
        const { data: petsData } = await supabase
          .from('pets')
          .select('id, name, type')
          .eq('owner_id', user.id)
        if (petsData) {
          setPets(petsData)
        }
      }

      // Fetch nannies with deduplication
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

      // Deduplicate by ID and name
      const idSet = new Set()
      const nameSet = new Set()
      const mapped = (data || [])
        .map((row: any): PetNannyProfile => ({
          id: String(row.id),
          name: row.full_name || row.name || 'Pet Nanny',
          image: row.image || '👤',
          distance: Number(row.distance_km ?? row.distance ?? 0),
          rating: Number(row.rating ?? 0),
          reviews: Number(row.reviews_count ?? row.total_reviews ?? 0),
          description: row.description || row.bio || 'No description provided.',
          services: Array.isArray(row.services)
            ? row.services
            : String(row.services || '')
                .split(',')
                .map((x: string) => x.trim())
                .filter(Boolean),
          pricePerHour: Number(row.price_per_hour ?? 0),
          pricePerDay: Number(row.price_per_day ?? 0),
          availability: row.availability === 'busy' ? 'busy' : 'available',
          petTypes: Array.isArray(row.pet_types)
            ? row.pet_types
            : String(row.pet_types || '')
                .split(',')
                .map((x: string) => x.trim())
                .filter(Boolean),
          experience: row.experience || 'Experience details not provided.',
          reviews_list: Array.isArray(row.reviews_list) ? row.reviews_list : [],
          availableTimes: row.available_times || 'Not specified',
        }))
        .filter((nanny: PetNannyProfile) => {
          // Remove duplicates by ID or name
          const lowerName = nanny.name.toLowerCase().trim()
          if (idSet.has(nanny.id) || nameSet.has(lowerName)) return false
          idSet.add(nanny.id)
          nameSet.add(lowerName)
          return true
        })

      setNannies(mapped)
    }

    fetchData()
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

  const handleRequestCare = (nanny: PetNannyProfile) => {
    setBookingNanny(nanny)
    setShowBookingModal(true)
    setBookingForm({
      petId: pets.length > 0 ? pets[0].id : '',
      startDate: '',
      endDate: '',
      serviceType: nanny.services.length > 0 ? nanny.services[0] : '',
      notes: '',
    })
  }

  const handleSubmitBooking = async () => {
    if (!bookingNanny || !user?.id || !bookingForm.petId || !bookingForm.startDate || !bookingForm.endDate) {
      alert('Please fill in all required fields')
      return
    }

    setBookingSubmitting(true)
    try {
      const { error } = await supabase
        .from('pet_nanny_bookings')
        .insert({
          nanny_id: bookingNanny.id,
          owner_id: user.id,
          pet_id: bookingForm.petId,
          start_time: new Date(bookingForm.startDate).toISOString(),
          end_time: new Date(bookingForm.endDate).toISOString(),
          notes: bookingForm.notes,
          status: 'pending',
        })

      if (error) throw error

      alert('Care request sent successfully!')
      setShowBookingModal(false)
      setBookingForm({
        petId: '',
        startDate: '',
        endDate: '',
        serviceType: '',
        notes: '',
      })
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to send booking request')
    } finally {
      setBookingSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Nearby Pet Nannies & Care Centers</h1>
        <p className="text-gray-600 text-lg">Find trusted pet nannies and pet care centers for your pet when you are away</p>
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
                placeholder="Search by nanny or center name..."
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
              <option value="Pet care center">Pet care center</option>
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
        Found {filteredNannies.length} care {filteredNannies.length === 1 ? 'provider' : 'providers'}
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 font-medium text-lg">Loading pet care providers...</p>
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
                    <span className="font-semibold text-gray-900">₹{nanny.pricePerHour}</span>/hr or <span className="font-semibold text-gray-900">₹{nanny.pricePerDay}</span>/day
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button onClick={() => setSelectedNanny(nanny)} variant="outline" className="bg-white border-teal-300 text-teal-600 hover:bg-teal-50 font-medium">
                    View Profile
                  </Button>
                  <Button onClick={() => handleRequestCare(nanny)} className="bg-teal-500 hover:bg-teal-600 text-white font-medium">Request Care</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 font-medium text-lg">No pet nannies or care centers found nearby</p>
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

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Pet Care from {bookingNanny?.name}</DialogTitle>
            <DialogDescription>
              Fill in the details to request pet care services
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Pet Selection */}
            <div className="space-y-2">
              <Label htmlFor="pet">Select Pet *</Label>
              <select
                id="pet"
                value={bookingForm.petId}
                onChange={(e) => setBookingForm({ ...bookingForm, petId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="">Choose a pet</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} ({pet.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Service Type */}
            <div className="space-y-2">
              <Label htmlFor="service">Service Type *</Label>
              <select
                id="service"
                value={bookingForm.serviceType}
                onChange={(e) => setBookingForm({ ...bookingForm, serviceType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="">Select a service</option>
                {bookingNanny?.services.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={bookingForm.startDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={bookingForm.endDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, endDate: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="e.g., pet allergies, feeding instructions, special care requirements..."
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                className="min-h-24"
              />
            </div>

            {/* Pricing Summary */}
            {bookingForm.startDate && bookingForm.endDate && (
              <div className="bg-teal-50 p-4 rounded-lg space-y-2">
                <p className="font-semibold text-gray-900">Estimated Cost</p>
                <p className="text-sm text-gray-600">
                  Start: {new Date(bookingForm.startDate).toLocaleDateString()} {new Date(bookingForm.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-sm text-gray-600">
                  End: {new Date(bookingForm.endDate).toLocaleDateString()} {new Date(bookingForm.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                {bookingNanny && (
                  <p className="text-lg font-semibold text-teal-600">
                    ₹{bookingNanny.pricePerHour}/hr or ₹{bookingNanny.pricePerDay}/day
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowBookingModal(false)}
              disabled={bookingSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBooking}
              disabled={bookingSubmitting}
              className="bg-teal-500 hover:bg-teal-600"
            >
              {bookingSubmitting ? 'Sending Request...' : 'Send Request'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
