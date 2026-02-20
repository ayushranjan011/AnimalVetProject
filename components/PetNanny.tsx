'use client'

import { useState } from 'react'
import { Search, MapPin, Star, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PetNanny {
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

const mockNannies: PetNanny[] = [
  {
    id: '1',
    name: 'Sarah Anderson',
    image: '👩‍🦰',
    distance: 2.4,
    rating: 4.9,
    reviews: 48,
    description: '5 years experience with dogs and cats. Certified pet care provider.',
    services: ['Day care', 'Walking', 'Training'],
    pricePerHour: 15,
    pricePerDay: 80,
    availability: 'available',
    petTypes: ['Dog', 'Cat'],
    experience: '5+ years in professional pet care with certification in pet first aid',
    reviews_list: [
      { reviewer: 'John M.', rating: 5, text: 'Excellent care for my Golden Retriever!' },
      { reviewer: 'Lisa K.', rating: 5, text: 'Very trustworthy and responsible.' }
    ],
    availableTimes: 'Monday - Friday: 8 AM - 6 PM, Saturday: 10 AM - 4 PM'
  },
  {
    id: '2',
    name: 'Michael Chen',
    image: '👨‍💼',
    distance: 1.8,
    rating: 4.8,
    reviews: 35,
    description: 'Specialized in dog walking and overnight care. Experienced with large breeds.',
    services: ['Day care', 'Overnight stay', 'Walking'],
    pricePerHour: 18,
    pricePerDay: 100,
    availability: 'available',
    petTypes: ['Dog'],
    experience: '7+ years specializing in dog care, experienced with all breed sizes',
    reviews_list: [
      { reviewer: 'Emma R.', rating: 5, text: 'My dog loves Michael! Highly recommended.' },
      { reviewer: 'David L.', rating: 4, text: 'Professional and reliable service.' }
    ],
    availableTimes: 'Daily: 7 AM - 10 PM'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    image: '👩‍🦱',
    distance: 3.2,
    rating: 4.7,
    reviews: 52,
    description: 'Cat specialist with gentle handling. Provides medication administration if needed.',
    services: ['Day care', 'Overnight stay', 'Training'],
    pricePerHour: 12,
    pricePerDay: 70,
    availability: 'busy',
    petTypes: ['Cat'],
    experience: '6+ years specializing in feline care and behavior training',
    reviews_list: [
      { reviewer: 'Sophie T.', rating: 5, text: 'My anxious cat was so calm with Emily.' },
      { reviewer: 'Mark N.', rating: 5, text: 'Best cat sitter I\'ve found!' }
    ],
    availableTimes: 'Tuesday - Sunday: 9 AM - 7 PM'
  },
  {
    id: '4',
    name: 'James Wilson',
    image: '👨‍🦳',
    distance: 4.1,
    rating: 4.6,
    reviews: 41,
    description: 'Multi-pet specialist. Comfortable with dogs, cats, and birds.',
    services: ['Day care', 'Walking', 'Training'],
    pricePerHour: 16,
    pricePerDay: 85,
    availability: 'available',
    petTypes: ['Dog', 'Cat', 'Bird'],
    experience: '8+ years caring for multiple pet types with behavioral training expertise',
    reviews_list: [
      { reviewer: 'Rachel G.', rating: 5, text: 'Handles all my pets with care!' },
      { reviewer: 'Tom H.', rating: 4, text: 'Dependable and professional.' }
    ],
    availableTimes: 'Monday - Saturday: 8 AM - 8 PM'
  },
  {
    id: '5',
    name: 'Jessica Park',
    image: '👩‍🦱',
    distance: 2.9,
    rating: 4.9,
    reviews: 62,
    description: 'Energetic pet care with lots of playtime and socialization. Dog trainer certified.',
    services: ['Day care', 'Walking', 'Training'],
    pricePerHour: 17,
    pricePerDay: 90,
    availability: 'available',
    petTypes: ['Dog'],
    experience: '6+ years in dog daycare and certified professional dog trainer',
    reviews_list: [
      { reviewer: 'Alex B.', rating: 5, text: 'My dog improved so much with her training!' },
      { reviewer: 'Nicole M.', rating: 5, text: 'Highly professional and caring.' }
    ],
    availableTimes: 'Monday - Friday: 7 AM - 7 PM, Saturday: 9 AM - 5 PM'
  },
  {
    id: '6',
    name: 'Robert Thompson',
    image: '👨‍🏫',
    distance: 5.2,
    rating: 4.5,
    reviews: 28,
    description: 'Overnight specialist. Comfortable with puppies and senior dogs.',
    services: ['Overnight stay', 'Day care'],
    pricePerHour: 14,
    pricePerDay: 75,
    availability: 'available',
    petTypes: ['Dog'],
    experience: '9+ years in pet care with special focus on puppies and senior dogs',
    reviews_list: [
      { reviewer: 'Carol W.', rating: 5, text: 'Perfect overnight care for my puppy!' },
      { reviewer: 'George K.', rating: 4, text: 'Very trustworthy with my senior dog.' }
    ],
    availableTimes: 'Daily: All times'
  }
]

export default function PetNanny() {
  const [searchTerm, setSearchTerm] = useState('')
  const [distance, setDistance] = useState('10')
  const [serviceType, setServiceType] = useState('all')
  const [petType, setPetType] = useState('all')
  const [selectedNanny, setSelectedNanny] = useState<PetNanny | null>(null)

  const filteredNannies = mockNannies.filter(nanny => {
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
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Nearby Pet Nannies</h1>
        <p className="text-gray-600 text-lg">Find trusted caregivers near you</p>
        <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full w-24 mt-4"></div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Distance */}
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

          {/* Service Type */}
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

          {/* Pet Type */}
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

        {/* Clear Filters Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleClearFilters}
            variant="outline"
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Found {filteredNannies.length} pet {filteredNannies.length === 1 ? 'nanny' : 'nannies'}
      </div>

      {/* Nanny Listings */}
      {filteredNannies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNannies.map((nanny) => (
            <div
              key={nanny.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Profile Photo */}
              <div className="bg-gradient-to-br from-teal-100 to-cyan-100 p-6 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-5xl shadow-md">
                  {nanny.image}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 space-y-4">
                {/* Name and Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{nanny.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {nanny.distance} km away
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      nanny.availability === 'available'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {nanny.availability === 'available' ? 'Available' : 'Busy'}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(nanny.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-semibold text-gray-900">
                    {nanny.rating} ({nanny.reviews} reviews)
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2">{nanny.description}</p>

                {/* Services */}
                <div className="flex flex-wrap gap-2">
                  {nanny.services.map((service) => (
                    <span
                      key={service}
                      className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium"
                    >
                      {service}
                    </span>
                  ))}
                </div>

                {/* Price Range */}
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">${nanny.pricePerHour}</span>/hr or{' '}
                    <span className="font-semibold text-gray-900">${nanny.pricePerDay}</span>/day
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    onClick={() => setSelectedNanny(nanny)}
                    variant="outline"
                    className="bg-white border-teal-300 text-teal-600 hover:bg-teal-50 font-medium"
                  >
                    View Profile
                  </Button>
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white font-medium">
                    Request Care
                  </Button>
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

      {/* Map Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-3">🗺️</div>
            <p className="text-gray-600 font-medium">Map view coming soon</p>
            <p className="text-gray-500 text-sm mt-1">See nanny locations on an interactive map</p>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {selectedNanny && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">{selectedNanny.name}</h2>
              <button
                onClick={() => setSelectedNanny(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Profile Info */}
              <div className="flex gap-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center text-6xl shadow-md flex-shrink-0">
                  {selectedNanny.image}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{selectedNanny.name}</h3>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        selectedNanny.availability === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {selectedNanny.availability === 'available' ? 'Available' : 'Busy'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(selectedNanny.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-semibold text-gray-900">
                      {selectedNanny.rating} ({selectedNanny.reviews} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    {selectedNanny.distance} km away
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedNanny.services.map((service) => (
                      <span
                        key={service}
                        className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* About */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                <p className="text-gray-700">{selectedNanny.description}</p>
              </div>

              {/* Experience */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
                <p className="text-gray-700">{selectedNanny.experience}</p>
              </div>

              {/* Pets Cared For */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Pets I care for</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedNanny.petTypes.map((pet) => (
                    <span key={pet} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
                      {pet}
                    </span>
                  ))}
                </div>
              </div>

              {/* Available Times */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Available Times</h4>
                <p className="text-gray-700">{selectedNanny.availableTimes}</p>
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Pricing</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Per Hour</p>
                    <p className="text-2xl font-bold text-teal-600">${selectedNanny.pricePerHour}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Per Day</p>
                    <p className="text-2xl font-bold text-teal-600">${selectedNanny.pricePerDay}</p>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Recent Reviews</h4>
                <div className="space-y-4">
                  {selectedNanny.reviews_list.map((review, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">{review.reviewer}</p>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedNanny(null)}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Close
              </Button>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white font-medium">
                Request Care
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
