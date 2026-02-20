'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MedicalRecords from '@/components/MedicalRecords'
import Notifications from '@/components/Notifications'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('medical')

  return (
    <div className="p-6 md:p-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100 p-1 rounded-lg mb-8">
          <TabsTrigger
            value="medical"
            className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm rounded-md"
          >
            📋 Medical Records
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm rounded-md"
          >
            🔔 Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="medical" className="space-y-6">
          <MedicalRecords />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Notifications />
        </TabsContent>
      </Tabs>
    </div>
  )
}
