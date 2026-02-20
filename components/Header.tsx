'use client'

import { Bell, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">I</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">INNOVET</h1>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <button className="text-gray-700 hover:text-teal-600 font-medium transition">
            🏠 Home
          </button>
          <button className="text-gray-700 hover:text-teal-600 font-medium transition">
            🏥 Vet Directory
          </button>
          <button className="text-gray-700 hover:text-teal-600 font-medium transition">
            💊 Pharmacy
          </button>
          <button className="text-gray-700 hover:text-teal-600 font-medium transition">
            📚 Training
          </button>
          <button className="text-gray-700 hover:text-teal-600 font-medium transition">
            ❤️ NGO
          </button>
          <button className="text-gray-700 hover:text-teal-600 font-medium transition">
            👥 Community
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <button className="relative p-2">
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-full px-6">
            + Add Pet
          </Button>
        </div>
      </div>
    </header>
  )
}
