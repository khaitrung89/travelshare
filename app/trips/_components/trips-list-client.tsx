
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, MapPin, Users, Receipt, Loader2 } from 'lucide-react'
import { CreateTripDialog } from './create-trip-dialog'

type Trip = {
  id: string
  name: string
  description: string | null
  location: string | null
  startDate: string | null
  endDate: string | null
  currency: string
  _count: {
    members: number
    expenses: number
  }
}

export function TripsListClient() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/trips')
      if (response.ok) {
        const data = await response.json()
        setTrips(data)
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTripCreated = () => {
    setShowCreateDialog(false)
    fetchTrips()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
          <p className="text-gray-600 mt-1">Manage your travel expenses</p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span>New Trip</span>
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
          <p className="text-gray-600 mb-6">Create your first trip to start tracking expenses</p>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Trip</span>
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              href={`/trips/${trip.id}`}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {trip.name}
                  </h3>
                  {trip.location && (
                    <div className="flex items-center text-gray-600 text-sm mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {trip.location}
                    </div>
                  )}
                </div>
                <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {trip.currency}
                </div>
              </div>

              {trip.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {trip.description}
                </p>
              )}

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{trip._count.members} members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Receipt className="w-4 h-4" />
                  <span>{trip._count.expenses} expenses</span>
                </div>
              </div>

              {trip.startDate && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                  {new Date(trip.startDate).toLocaleDateString()} 
                  {trip.endDate && ` - ${new Date(trip.endDate).toLocaleDateString()}`}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <CreateTripDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreated={handleTripCreated}
      />
    </div>
  )
}
