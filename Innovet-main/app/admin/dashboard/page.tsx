'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmergencySOS } from '@/components/emergency-sos'
import { useAuth } from '@/contexts/auth-context'
import {
  Menu,
  BarChart3,
  Users,
  PawPrint,
  CheckCircle,
  MapPin,
  Briefcase,
  DollarSign,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  TrendingUp,
  AlertCircle,
  Shield,
  Eye,
  Trash2,
  Lock,
  Unlock,
  Search,
  Filter,
  Download,
  ChevronRight,
} from 'lucide-react'

type AdminSection = 'dashboard' | 'users' | 'pets' | 'verification' | 'sos' | 'adoption' | 'donations' | 'moderation' | 'directory' | 'settings'

export default function AdminPanel() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Demo Mode: Allow all users to access admin panel for development
    // In production, uncomment the admin check below
    
    setLoading(false)

    /* PRODUCTION: Uncomment this to enable admin-only access
    if (!user) {
      router.push('/login')
      return
    }

    const isAdmin = user.email === 'admin@innovet.com' || user.role === 'admin'
    
    if (!isAdmin) {
      router.push('/')
      return
    }

    setLoading(false)
    */
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // Mock Data
  const stats = [
    { label: 'Total Users', value: '12,458', change: '+12%', icon: Users, color: 'from-blue-500 to-indigo-500' },
    { label: 'Registered Pets', value: '28,942', change: '+23%', icon: PawPrint, color: 'from-teal-500 to-cyan-500' },
    { label: 'Active SOS Alerts', value: '24', change: '-5%', icon: AlertCircle, color: 'from-red-500 to-orange-500' },
    { label: 'Pending Verifications', value: '156', change: '+8%', icon: CheckCircle, color: 'from-emerald-500 to-teal-500' },
    { label: 'Total Donations', value: '$542,890', change: '+34%', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
    { label: 'Adoptions (Month)', value: '487', change: '+18%', icon: Heart, color: 'from-rose-500 to-pink-500' },
  ]

  const users = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@email.com', role: 'Pet Owner', status: 'active', joined: '2026-01-15' },
    { id: 2, name: 'Dr. Sarah Johnson', email: 'sarah.vet@email.com', role: 'Veterinarian', status: 'active', joined: '2026-01-10' },
    { id: 3, name: 'Animal Care NGO', email: 'contact@animalcare.org', role: 'NGO', status: 'pending', joined: '2026-01-20' },
    { id: 4, name: 'Priya Sharma', email: 'priya@email.com', role: 'Pet Owner', status: 'blocked', joined: '2026-01-05' },
  ]

  const pets = [
    { id: 'PET-001', name: 'Max', owner: 'Rajesh Kumar', species: 'Dog', breed: 'Golden Retriever', status: 'verified' },
    { id: 'PET-002', name: 'Luna', owner: 'Priya Sharma', species: 'Cat', breed: 'Persian', status: 'pending' },
    { id: 'PET-003', name: 'Bella', owner: 'John Doe', species: 'Dog', breed: 'Labrador', status: 'verified' },
  ]

  const verifications = [
    { id: 'VER-001', applicant: 'Dr. Michael Chen', type: 'Vet License', status: 'pending', submitted: '2026-01-18' },
    { id: 'VER-002', applicant: 'Pet Rescue Foundation', type: 'NGO Certificate', status: 'approved', submitted: '2026-01-16' },
    { id: 'VER-003', applicant: 'Dr. Emily Rodriguez', type: 'Vet License', status: 'rejected', submitted: '2026-01-12' },
  ]

  const sosAlerts = [
    { id: 'SOS-001', location: 'Mumbai, Maharashtra', type: 'Animal Abuse', status: 'active', time: '15 mins ago', van: 'Van-01' },
    { id: 'SOS-002', location: 'Delhi, NCR', type: 'Injured Pet', status: 'resolved', time: '2 hours ago', van: 'Van-03' },
    { id: 'SOS-003', location: 'Bangalore, Karnataka', type: 'Stray Rescue', status: 'pending', time: '45 mins ago', van: 'Unassigned' },
  ]

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'pets', label: 'Pet Registry', icon: PawPrint },
    { id: 'verification', label: 'Verifications', icon: CheckCircle },
    { id: 'sos', label: 'SOS Monitoring', icon: AlertCircle },
    { id: 'adoption', label: 'Adoption Logs', icon: Heart },
    { id: 'donations', label: 'Donations', icon: DollarSign },
    { id: 'moderation', label: 'Content Moderation', icon: MessageSquare },
    { id: 'directory', label: 'Directory', icon: Briefcase },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-6">Admin Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-xl transition-all">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-slate-600 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-sm text-emerald-600 mt-2">{stat.change} from last month</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50">
                <h3 className="font-semibold text-slate-800 mb-4">Daily Registrations</h3>
                <div className="h-64 bg-gradient-to-br from-teal-100/50 to-cyan-100/50 rounded-xl flex items-center justify-center text-slate-500">
                  Chart Placeholder - Integrate Chart.js
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50">
                <h3 className="font-semibold text-slate-800 mb-4">SOS Trends</h3>
                <div className="h-64 bg-gradient-to-br from-red-100/50 to-orange-100/50 rounded-xl flex items-center justify-center text-slate-500">
                  Chart Placeholder - Integrate Chart.js
                </div>
              </div>
            </div>
          </div>
        )

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-slate-800">User Management</h2>
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500">Export Users</Button>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="bg-white/50">
                <Filter className="w-4 h-4 mr-2" /> Filter
              </Button>
            </div>

            <div className="space-y-4">
              {users.map((u) => (
                <div key={u.id} className="p-5 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12 border-2 border-teal-200">
                        <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
                          {u.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-slate-800">{u.name}</h3>
                        <p className="text-sm text-slate-500">{u.email}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge className="bg-teal-100 text-teal-700">{u.role}</Badge>
                          <Badge className={u.status === 'active' ? 'bg-green-100 text-green-700' : u.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                            {u.status}
                          </Badge>
                          <span className="text-xs text-slate-500">Joined {u.joined}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {u.status === 'blocked' ? (
                        <Button size="sm" variant="outline" className="border-green-200 text-green-600 bg-transparent hover:bg-green-50">
                          <Unlock className="w-4 h-4 mr-1" /> Unblock
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="border-red-200 text-red-600 bg-transparent hover:bg-red-50">
                          <Lock className="w-4 h-4 mr-1" /> Block
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="border-red-200 text-red-600 bg-transparent hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'pets':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Pet Registry</h2>

            <div className="overflow-x-auto rounded-2xl border border-white/50">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-teal-100/50 to-cyan-100/50 border-b border-white/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Pet ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Owner</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Species</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Breed</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pets.map((pet) => (
                    <tr key={pet.id} className="border-b border-white/50 hover:bg-white/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-700">{pet.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">{pet.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{pet.owner}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{pet.species}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{pet.breed}</td>
                      <td className="px-6 py-4">
                        <Badge className={pet.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                          {pet.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button size="sm" variant="ghost" className="text-teal-600 hover:bg-teal-50">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'verification':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Verification Requests</h2>

            <div className="space-y-4">
              {verifications.map((ver) => (
                <div key={ver.id} className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-800">{ver.applicant}</h3>
                      <p className="text-sm text-slate-500">{ver.type}</p>
                      <p className="text-xs text-slate-400 mt-1">Submitted: {ver.submitted}</p>
                    </div>
                    <Badge className={ver.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ver.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {ver.status}
                    </Badge>
                  </div>
                  {ver.status === 'pending' && (
                    <div className="flex gap-3">
                      <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                        ✓ Approve
                      </Button>
                      <Button variant="outline" className="border-red-200 text-red-600 bg-transparent hover:bg-red-50">
                        ✕ Reject
                      </Button>
                      <Button variant="outline" className="bg-transparent hover:bg-slate-50">
                        📋 Request Info
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )

      case 'sos':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-800">SOS & Emergency Monitoring</h2>
              <Badge className="bg-red-100 text-red-700 animate-pulse">Active: {sosAlerts.filter(s => s.status === 'active').length}</Badge>
            </div>

            <div className="space-y-4">
              {sosAlerts.map((sos) => (
                <div key={sos.id} className={`p-6 rounded-2xl border backdrop-blur-sm ${sos.status === 'active' ? 'bg-red-50/70 border-red-200' : 'bg-white/70 border-white/50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className={`w-5 h-5 ${sos.status === 'active' ? 'text-red-600' : 'text-slate-400'}`} />
                        <h3 className="font-semibold text-slate-800">{sos.type}</h3>
                        <Badge className={sos.status === 'active' ? 'bg-red-600 text-white' : sos.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                          {sos.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> {sos.location}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{sos.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800 mb-2">
                        Van: <span className="text-teal-600">{sos.van}</span>
                      </p>
                      {sos.status === 'active' && (
                        <Button size="sm" className="bg-gradient-to-r from-teal-500 to-cyan-500">
                          Assign Van
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'adoption':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Adoption & Transfer Logs</h2>
            <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50">
              <p className="text-slate-600 mb-4">Recent adoptions and pet transfers will be displayed here.</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                  <div>
                    <p className="font-semibold text-slate-800">Luna transferred to Priya Sharma</p>
                    <p className="text-sm text-slate-500">Adoption Certificate - ADOPT-2026-001</p>
                  </div>
                  <Button size="sm" variant="outline">View Certificate</Button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'donations':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Donation & Fund Analytics</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                <p className="text-slate-600 text-sm mb-2">Total Donations (This Month)</p>
                <p className="text-4xl font-bold text-emerald-600">$542,890</p>
                <p className="text-sm text-emerald-600 mt-2">↑ 34% from last month</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50">
                <p className="text-slate-600 text-sm mb-4">Top 5 Donors</p>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between"><span>John Smith</span><span className="font-semibold">$50,000</span></p>
                  <p className="flex justify-between"><span>Mukesh Enterprises</span><span className="font-semibold">$35,000</span></p>
                  <p className="flex justify-between"><span>Sarah Johnson</span><span className="font-semibold">$25,000</span></p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'moderation':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Content Moderation</h2>
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-yellow-50/70 border border-yellow-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">Flagged: "Aggressive pet training tips"</h3>
                    <p className="text-sm text-slate-600 mt-1">Posted by: Rajesh Kumar | 2 hours ago</p>
                    <p className="text-sm text-slate-500 mt-2">Reason: Contains potentially harmful content</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700">Under Review</Badge>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500">
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-200 text-red-600 bg-transparent hover:bg-red-50">
                    Delete
                  </Button>
                  <Button size="sm" variant="outline" className="bg-transparent hover:bg-slate-50">
                    Warn User
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'directory':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Vet & NGO Directory</h2>
            <Tabs defaultValue="vets" className="w-full">
              <TabsList className="bg-white/60 backdrop-blur-sm border border-white/50 p-1 rounded-xl">
                <TabsTrigger value="vets" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                  Veterinarians
                </TabsTrigger>
                <TabsTrigger value="ngos" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                  NGOs
                </TabsTrigger>
              </TabsList>
              <TabsContent value="vets" className="mt-6">
                <p className="text-slate-600">Manage veterinarian profiles and listings here.</p>
              </TabsContent>
              <TabsContent value="ngos" className="mt-6">
                <p className="text-slate-600">Manage NGO listings and regions here.</p>
              </TabsContent>
            </Tabs>
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">System Settings</h2>
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50">
                <h3 className="font-semibold text-slate-800 mb-4">Blockchain Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">Contract Address</Label>
                    <Input placeholder="0x..." defaultValue="0x123456..." className="mt-2" />
                  </div>
                  <Button className="bg-gradient-to-r from-teal-500 to-cyan-500">Save Settings</Button>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50">
                <h3 className="font-semibold text-slate-800 mb-4">Backup & Restore</h3>
                <div className="flex gap-3">
                  <Button variant="outline" className="bg-transparent hover:bg-slate-50">
                    <Download className="w-4 h-4 mr-2" /> Backup Data
                  </Button>
                  <Button variant="outline" className="bg-transparent hover:bg-slate-50">
                    📁 Restore
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-300/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-emerald-300/15 rounded-full blur-3xl" />
      </div>

      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/50">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-teal-100/50 lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-gradient-to-b from-white to-teal-50/50 backdrop-blur-xl">
              <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
              <div className="flex flex-col gap-2 py-4">
                <div className="px-3 py-4 mb-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg text-slate-800">ADMIN</h2>
                      <p className="text-xs text-slate-500">Control Panel</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {sidebarItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id as AdminSection)
                          setSidebarOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          activeSection === item.id
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                            : 'text-slate-600 hover:bg-gradient-to-r hover:from-teal-100/80 hover:to-cyan-100/60 hover:text-teal-700'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-100/50 hover:text-red-700 transition-all duration-200 mt-4"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">ADMIN</h1>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative hover:bg-teal-100/50">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-100/80 to-rose-100/60">
              <Avatar className="w-7 h-7 border-2 border-white">
                <AvatarFallback className="bg-gradient-to-br from-red-500 to-rose-500 text-white text-xs">AD</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-700 hidden lg:block">Admin</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Layout */}
      <div className="flex relative z-10">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col fixed left-0 top-16 bottom-0 bg-white/70 backdrop-blur-xl border-r border-white/50 overflow-y-auto">
          <div className="p-4">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as AdminSection)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                      : 'text-slate-600 hover:bg-gradient-to-r hover:from-teal-100/80 hover:to-cyan-100/60 hover:text-teal-700'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-100/50 hover:text-red-700 transition-all duration-200 mt-6"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 px-4 md:px-6 py-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>

        <EmergencySOS />
      </div>
    </div>
  )
}

import { Heart } from 'lucide-react'
